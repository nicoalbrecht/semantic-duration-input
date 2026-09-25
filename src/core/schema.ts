import type { DurationLocale } from './locale'
import { en } from './locales/en'
import { formatErrorMessage, type ErrorMessages } from './messages'
import { parseDuration, type ParseFailure, type ParseOptions, type ParseResult } from './parse'
import { fromModelValue, resolveAmount, toModelValue, type DurationAmount, type ValueFormat } from './value'

/** The Standard Schema v1 interface (https://standardschema.dev), inlined to stay dependency-free. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: string
    readonly validate: (value: unknown) => StandardSchemaResult<Output>
    readonly types?: { readonly input: Input; readonly output: Output }
  }
}
/** What a Standard Schema's `validate` returns: the value, or the issues. */
export type StandardSchemaResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<{ readonly message: string }> }

/** Options of `durationSchema`. Accepts the `ParseOptions` too, except that bounds work like the component's. */
export interface DurationSchemaOptions extends Omit<ParseOptions, 'min' | 'max'> {
  /** Type of the validated output. Defaults to `'minutes'`. */
  valueFormat?: ValueFormat
  /** Inclusive bounds: a number in the output's unit, or a duration text like `'8h'`. */
  min?: DurationAmount
  /** Inclusive upper bound, like `min`. */
  max?: DurationAmount
  /** Language of the issue messages. Defaults to the first of `locales`, else English. */
  locale?: DurationLocale
  /** Replacement texts for the issue messages, see `formatErrorMessage`. */
  messages?: ErrorMessages
}

/**
 * A Standard Schema that parses duration text into the model value, for Valibot, ArkType, TanStack Form,
 * VeeValidate and other libraries that accept Standard Schema. Values already in the output format pass too.
 * Empty input validates to `null` unless `required` is set.
 *
 * @example
 * const estimate = durationSchema({ required: true, max: '8h' })
 * estimate['~standard'].validate('1h30') // { value: 90 }
 * estimate['~standard'].validate('9h')   // { issues: [{ message: 'Must be at most 8h.' }] }
 */
export function durationSchema<Output = number | null>(
  options: DurationSchemaOptions = {},
): StandardSchemaV1<string | Output, Output> {
  const { valueFormat = 'minutes', locale = options.locales?.[0] ?? en, messages, ...parseOptions } = options
  const min = resolveAmount(options.min, valueFormat, options)
  const max = resolveAmount(options.max, valueFormat, options)

  return {
    '~standard': {
      version: 1,
      vendor: 'semantic-duration-input',
      validate(value) {
        // Numbers (or custom model values) are already durations and only get range-checked. Text is parsed.
        const isText = value === null || value === undefined || typeof value === 'string'
        const stored = isText ? null : fromModelValue(value, valueFormat)
        const parsed: ParseResult | ParseFailure = isText
          ? parseDuration(value ?? '', { ...parseOptions, min, max })
          : stored !== null
            ? checkRange(stored, min, max)
            : { ok: false, error: 'invalid_format' }
        if (!parsed.ok) {
          return { issues: [{ message: formatErrorMessage(parsed, { locale, min, max, overrides: messages }) }] }
        }
        return { value: toModelValue(parsed.seconds, valueFormat) as Output }
      },
    },
  }
}

function checkRange(seconds: number, min?: number, max?: number): ParseResult {
  // Text never parses to a negative duration, so a negative number isn't one either.
  if (seconds < 0) return { ok: false, error: 'invalid_format' }
  if ((min !== undefined && seconds < min) || (max !== undefined && seconds > max)) {
    return { ok: false, error: 'out_of_range' }
  }
  return { ok: true, seconds, minutes: seconds / 60 }
}

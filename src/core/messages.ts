import { formatDuration } from './format'
import type { DurationLocale, MessageKey, ParseErrorCode } from './locale'
import { en } from './locales/en'
import type { ParseFailure } from './parse'
import type { UnitKey } from './units'

/** Replacement texts per message key, e.g. `{ empty: 'Required' }`. */
export type ErrorMessages = Partial<Record<MessageKey, string>>

/** Options of `formatErrorMessage`. */
export interface ErrorMessageOptions {
  /** Language of the text and of the formatted bounds. Defaults to English. */
  locale?: DurationLocale
  /** Lower bound in seconds, for `{min}`. */
  min?: number
  /** Upper bound in seconds, for `{max}`. */
  max?: number
  /** Units used to format the bounds. */
  units?: UnitKey[]
  /** Per-key replacements. They may use the same placeholders. */
  overrides?: ErrorMessages
}

/**
 * Human-readable text for a parse error. Pass the whole failure to get `{token}` and `{suggestion}` filled in.
 * `unknown_unit` uses `unknown_unit_suggestion` when there is a suggestion; `out_of_range` uses
 * `out_of_range_min` / `out_of_range_max` when only one bound is set. Overrides of the base key apply to its variants.
 *
 * @example
 * formatErrorMessage(parseDuration('2 huors')) // 'Unknown unit "huors". Did you mean "hours"?'
 * formatErrorMessage('out_of_range', { min: 1800, max: 28800 }) // 'Must be between 30min and 8h.'
 */
export function formatErrorMessage(error: ParseErrorCode | ParseFailure, options: ErrorMessageOptions = {}): string {
  const failure: Omit<ParseFailure, 'ok'> = typeof error === 'string' ? { error } : error
  const { locale = en, min, max, units, overrides } = options

  const keys = messageKeys(failure.error, failure.suggestion !== undefined, min, max)
  const template = keys.map((key) => overrides?.[key]).find((text) => text !== undefined) ?? locale.messages[keys[0]]

  const bound = (seconds: number | undefined) => (seconds === undefined ? '' : formatDuration(seconds, { locale, units }))
  return template
    .replace('{min}', bound(min))
    .replace('{max}', bound(max))
    .replace('{token}', failure.token ?? '')
    .replace('{suggestion}', failure.suggestion ?? '')
}

/** Keys to look up, most specific first. */
function messageKeys(code: ParseErrorCode, hasSuggestion: boolean, min?: number, max?: number): MessageKey[] {
  if (code === 'unknown_unit' && hasSuggestion) return ['unknown_unit_suggestion', 'unknown_unit']
  if (code === 'out_of_range' && min === undefined) return ['out_of_range_max', 'out_of_range']
  if (code === 'out_of_range' && max === undefined) return ['out_of_range_min', 'out_of_range']
  return [code]
}

import { fromIso, toIso } from './iso'
import { parseDuration, type ParseOptions } from './parse'

/** Converts between seconds and your own model type. */
export interface CustomValueFormat<T = any> {
  toModel(seconds: number): T
  /** Return `null` for values that aren't a duration. */
  fromModel(value: T): number | null
}

/**
 * How durations are stored in `v-model`: `'minutes'` (default), `'seconds'`, `'ms'`,
 * `'iso'` (ISO 8601 like `PT1H30M`) or a custom conversion.
 */
export type ValueFormat = 'minutes' | 'seconds' | 'ms' | 'iso' | CustomValueFormat

const FACTORS = { minutes: 60, seconds: 1, ms: 0.001 }

/** Seconds -> model value. `null` stays `null`. */
export function toModelValue(seconds: number | null, format: ValueFormat = 'minutes'): unknown {
  if (seconds === null) return null
  if (typeof format === 'object') return format.toModel(seconds)
  if (format === 'iso') return toIso(seconds)
  return seconds / FACTORS[format]
}

/** Model value -> seconds, or `null` when empty or not a duration. */
export function fromModelValue(value: unknown, format: ValueFormat = 'minutes'): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof format === 'object') return format.fromModel(value)
  if (format === 'iso') return typeof value === 'string' ? fromIso(value) : null
  return typeof value === 'number' && Number.isFinite(value) ? value * FACTORS[format] : null
}

/** A bound or step: a number in the model's unit (minutes for `'iso'`), or a duration text like `'30m'`. */
export type DurationAmount = number | string

/** Resolves an amount to seconds. Invalid texts resolve to `undefined`. */
export function resolveAmount(
  amount: DurationAmount | undefined,
  format: ValueFormat = 'minutes',
  options: Pick<ParseOptions, 'locales'> = {},
): number | undefined {
  if (amount === undefined) return undefined
  if (typeof amount === 'string') {
    const result = parseDuration(amount, { locales: options.locales, precision: 'second' })
    return result.ok && result.seconds !== null ? result.seconds : undefined
  }
  if (format === 'iso') return amount * 60
  return fromModelValue(amount, format) ?? undefined
}

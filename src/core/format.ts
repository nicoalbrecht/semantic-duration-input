import type { DurationLocale } from './locale'
import { en } from './locales/en'
import { isBuiltIn, resolveUnits, unitSeconds, type CustomUnits, type ResolvedUnits, type UnitKey, type UnitName } from './units'

/** `'short'`: "1d 2h 30min", `'long'`: "1 day 2 hours 30 minutes". */
export type FormatStyle = 'short' | 'long'

export interface FormatOptions {
  /** Labels to use. Defaults to English. Locales without `labels` use `Intl.DurationFormat`. */
  locale?: DurationLocale
  /** `short`: "1d 2h 30min", `long`: "1 day 2 hours 30 minutes". Defaults to `'short'`. */
  style?: FormatStyle
  /**
   * Units to decompose into. Defaults to days, hours and minutes. The smallest one takes the rest,
   * as a decimal if needed: `formatDuration(5400, { units: ['hour'] })` -> "1.5h".
   */
  units?: UnitName[]
  /** Units of your own and other lengths for `day` and `week`, see `ParseOptions.customUnits`. */
  customUnits?: CustomUnits
}

/** Units of the normalized text by default: days, hours and minutes. */
export const DEFAULT_DISPLAY_UNITS: UnitKey[] = ['day', 'hour', 'minute']

/**
 * Formats a duration given in seconds, e.g. `formatDuration(5400)` -> "1h 30min". Throws a `RangeError` for negative
 * or non-finite input, and an `Error` for unknown units.
 */
export function formatDuration(seconds: number, options: FormatOptions = {}): string {
  const { locale = en, style = 'short', units = DEFAULT_DISPLAY_UNITS, customUnits } = options
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`formatDuration: expected a finite, non-negative number, got ${seconds}`)
  }
  const resolved = resolveUnits(customUnits)
  if (units.length === 0) throw new Error('formatDuration: `units` must not be empty')
  for (const unit of units) unitSeconds(unit, resolved, 'formatDuration')
  // Longest first, without duplicates.
  const selected = resolved.desc.filter((unit) => units.includes(unit))

  const parts = decompose(Math.round(seconds), selected, resolved)
  if (!locale.labels) {
    const formatted = intlFormat(locale.code, style, parts, (unit, value) => label(unit, value, style, locale, resolved))
    if (formatted !== null) return formatted
  }
  return parts.map(([unit, value]) => label(unit, value, style, locale, resolved)).join(' ')
}

/**
 * Splits `seconds` into whole larger units; the smallest one takes the rest, as a decimal if needed
 * (units: ['hour'] -> 1.5). If rounding that decimal makes up a larger unit, the rounded total is split again:
 * 86399s in days and hours is "1d", not "24h".
 */
function decompose(seconds: number, units: string[], resolved: ResolvedUnits): [string, number][] {
  const split = (total: number) => {
    let rest = total
    return units.map((unit, i): [string, number] => {
      const size = resolved.seconds.get(unit)!
      // The epsilon keeps float noise of a rounded total (28799.999...) from losing a whole unit.
      const value = i === units.length - 1 ? Math.round((rest / size) * 100) / 100 : Math.floor(rest / size + 1e-9)
      rest -= value * size
      return [unit, value]
    })
  }
  let parts = split(seconds)
  const rounded = parts.reduce((sum, [unit, value]) => sum + value * resolved.seconds.get(unit)!, 0)
  if (rounded !== seconds) parts = split(rounded)
  const nonZero = parts.filter(([, value]) => value > 0)
  return nonZero.length > 0 ? nonZero : [[units[units.length - 1], 0]]
}

/**
 * `value` with its unit label: from the locale, else from `customUnits`, else English (built-in units)
 * or the unit's name. A custom unit without a short label is written like the long form: "2 pomodoro".
 */
function label(unit: string, value: number, style: FormatStyle, locale: DurationLocale, resolved: ResolvedUnits): string {
  const custom = resolved.definitions.get(unit)?.labels
  const fallback = isBuiltIn(unit) ? en.labels! : undefined
  const long = locale.labels?.long[unit] ?? custom?.long ?? fallback?.long[unit] ?? [unit, unit]
  const short = locale.labels?.short[unit] ?? custom?.short ?? fallback?.short[unit]
  if (style === 'short' && short !== undefined) return `${value}${short}`
  return `${value} ${long[value === 1 ? 0 : 1]}`
}

interface IntlDurationFormat {
  format(duration: Record<string, number>): string
}
type IntlWithDurationFormat = typeof Intl & {
  DurationFormat?: new (locale: string, options: Record<string, string>) => IntlDurationFormat
}

const formatters = new Map<string, { format(value: never): string }>()
/** Creating Intl formatters is slow, and the input formats on every keystroke: reuse them. */
function cached<T extends { format(value: never): string }>(key: string, create: () => T): T {
  let formatter = formatters.get(key)
  if (!formatter) formatters.set(key, (formatter = create()))
  return formatter as T
}

/**
 * Formats via `Intl.DurationFormat`, or returns `null` where it isn't available.
 * `Intl` doesn't know custom units: those are written with `customLabel`.
 */
function intlFormat(
  code: string,
  style: FormatStyle,
  parts: [string, number][],
  customLabel: (unit: string, value: number) => string,
): string | null {
  const DurationFormat = (Intl as IntlWithDurationFormat).DurationFormat
  if (!DurationFormat) return null
  const unitDisplay = style === 'short' ? 'narrow' : 'long'

  // Duration fields must be integers, and built-in units. Decimals (units: ['hour'] -> 1.5) and custom units
  // are formatted per unit instead.
  if (parts.some(([unit, value]) => !Number.isInteger(value) || !isBuiltIn(unit))) {
    const list = cached(`list|${code}|${unitDisplay}`, () => new Intl.ListFormat(code, { type: 'unit', style: unitDisplay }))
    return list.format(
      parts.map(([unit, value]) =>
        isBuiltIn(unit)
          ? cached(`number|${code}|${unitDisplay}|${unit}`, () =>
              new Intl.NumberFormat(code, { style: 'unit', unit, unitDisplay, maximumFractionDigits: 2 }),
            ).format(value)
          : customLabel(unit, value),
      ),
    )
  }

  const options: Record<string, string> = { style: unitDisplay }
  const duration: Record<string, number> = {}
  for (const [unit, value] of parts) {
    duration[`${unit}s`] = value
    options[`${unit}sDisplay`] = 'always'
  }
  const key = `duration|${code}|${JSON.stringify(options)}`
  return cached(key, () => new DurationFormat(code, options)).format(duration)
}

import type { DurationLocale } from './locale'
import { en } from './locales/en'
import { UNIT_SECONDS, UNITS_DESC, type UnitKey } from './units'

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
  units?: UnitKey[]
}

/** Units of the normalized text by default: days, hours and minutes. */
export const DEFAULT_DISPLAY_UNITS: UnitKey[] = ['day', 'hour', 'minute']

/** Formats a duration given in seconds, e.g. `formatDuration(5400)` -> "1h 30min". Throws a `RangeError` for negative or non-finite input. */
export function formatDuration(seconds: number, options: FormatOptions = {}): string {
  const { locale = en, style = 'short', units = DEFAULT_DISPLAY_UNITS } = options
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`formatDuration: expected a finite, non-negative number, got ${seconds}`)
  }
  const selected = UNITS_DESC.filter((unit) => units.includes(unit))
  if (selected.length === 0) throw new Error('formatDuration: `units` must not be empty')

  // Count in hundredths of the smallest unit, so its rounding carries over into the larger units
  // (86399s with units ['day', 'hour'] is "1d", not "24h"). Unit sizes are whole multiples of each other.
  const smallest = UNIT_SECONDS[selected[selected.length - 1]]
  let remaining = Math.round((Math.round(seconds) / smallest) * 100)
  const parts: [UnitKey, number][] = []
  for (const [i, unit] of selected.entries()) {
    const size = (UNIT_SECONDS[unit] / smallest) * 100
    // The smallest unit takes whatever is left, as a decimal if it isn't whole (e.g. units: ['hour'] -> "1.5h").
    const value = i === selected.length - 1 ? remaining / 100 : Math.floor(remaining / size)
    remaining -= value * size
    if (value > 0) parts.push([unit, value])
  }
  if (parts.length === 0) parts.push([selected[selected.length - 1], 0])

  if (!locale.labels) {
    const formatted = intlFormat(locale.code, style, parts)
    if (formatted !== null) return formatted
  }
  const labels = locale.labels ?? en.labels!
  return parts
    .map(([unit, value]) =>
      style === 'short' ? `${value}${labels.short[unit]}` : `${value} ${labels.long[unit][value === 1 ? 0 : 1]}`,
    )
    .join(' ')
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

/** Formats via `Intl.DurationFormat`, or returns `null` where it isn't available. */
function intlFormat(code: string, style: FormatStyle, parts: [UnitKey, number][]): string | null {
  const DurationFormat = (Intl as IntlWithDurationFormat).DurationFormat
  if (!DurationFormat) return null
  const unitDisplay = style === 'short' ? 'narrow' : 'long'

  // Duration fields must be integers. A decimal (units: ['hour'] -> 1.5) is formatted per unit instead.
  if (parts.some(([, value]) => !Number.isInteger(value))) {
    const list = cached(`list|${code}|${unitDisplay}`, () => new Intl.ListFormat(code, { type: 'unit', style: unitDisplay }))
    return list.format(
      parts.map(([unit, value]) =>
        cached(`number|${code}|${unitDisplay}|${unit}`, () =>
          new Intl.NumberFormat(code, { style: 'unit', unit, unitDisplay, maximumFractionDigits: 2 }),
        ).format(value),
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

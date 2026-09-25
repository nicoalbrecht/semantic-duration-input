import type { DurationLocale } from './locale'
import { en } from './locales/en'
import { UNIT_SECONDS, UNITS_DESC, type UnitKey } from './units'

export type FormatStyle = 'short' | 'long'

export interface FormatOptions {
  /** Labels to use. Defaults to English. Locales without `labels` use `Intl.DurationFormat`. */
  locale?: DurationLocale
  /** `short`: "1d 2h 30min", `long`: "1 day 2 hours 30 minutes". Defaults to `'short'`. */
  style?: FormatStyle
  /** Units to decompose into. Defaults to days, hours and minutes. */
  units?: UnitKey[]
}

export const DEFAULT_DISPLAY_UNITS: UnitKey[] = ['day', 'hour', 'minute']

/** Formats a duration given in seconds, e.g. `formatDuration(5400)` -> "1h 30min". */
export function formatDuration(seconds: number, options: FormatOptions = {}): string {
  const { locale = en, style = 'short', units = DEFAULT_DISPLAY_UNITS } = options
  const selected = UNITS_DESC.filter((unit) => units.includes(unit))
  if (selected.length === 0) throw new Error('formatDuration: `units` must not be empty')

  const smallest = selected[selected.length - 1]
  let remaining = Math.round(Math.abs(seconds))
  const parts: [UnitKey, number][] = []
  for (const unit of selected) {
    // The smallest unit takes whatever is left, as a decimal if it isn't whole (e.g. units: ['hour'] -> "1.5h").
    const value =
      unit === smallest
        ? Math.round((remaining / UNIT_SECONDS[unit]) * 100) / 100
        : Math.floor(remaining / UNIT_SECONDS[unit])
    remaining -= value * UNIT_SECONDS[unit]
    if (value > 0) parts.push([unit, value])
  }
  if (parts.length === 0) parts.push([smallest, 0])

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

/** Formats via `Intl.DurationFormat`, or returns `null` where it isn't available. */
function intlFormat(code: string, style: FormatStyle, parts: [UnitKey, number][]): string | null {
  const DurationFormat = (Intl as IntlWithDurationFormat).DurationFormat
  if (!DurationFormat) return null
  const options: Record<string, string> = { style: style === 'short' ? 'narrow' : 'long' }
  const duration: Record<string, number> = {}
  for (const [unit, value] of parts) {
    // Duration fields must be integers.
    duration[`${unit}s`] = Math.round(value)
    options[`${unit}sDisplay`] = 'always'
  }
  return new DurationFormat(code, options).format(duration)
}

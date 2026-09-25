import { UNIT_MINUTES, UNITS_DESC, type Locale, type UnitKey } from './units'

export type FormatStyle = 'short' | 'long'

export interface FormatOptions {
  /** Language for the `long` style. Defaults to `'en'`. */
  locale?: Locale
  /** `short`: "1d 2h 30min", `long`: "1 day 2 hours 30 minutes". Defaults to `'short'`. */
  style?: FormatStyle
  /** Units to decompose into. Defaults to days, hours and minutes. */
  units?: UnitKey[]
}

const SHORT_LABELS: Record<UnitKey, string> = {
  week: 'w',
  day: 'd',
  hour: 'h',
  minute: 'min',
}

const LONG_LABELS: Record<Locale, Record<UnitKey, [singular: string, plural: string]>> = {
  en: {
    week: ['week', 'weeks'],
    day: ['day', 'days'],
    hour: ['hour', 'hours'],
    minute: ['minute', 'minutes'],
  },
  de: {
    week: ['Woche', 'Wochen'],
    day: ['Tag', 'Tage'],
    hour: ['Stunde', 'Stunden'],
    minute: ['Minute', 'Minuten'],
  },
}

const DEFAULT_UNITS: UnitKey[] = ['day', 'hour', 'minute']

export function formatDuration(minutes: number, options: FormatOptions = {}): string {
  const { locale = 'en', style = 'short', units = DEFAULT_UNITS } = options
  const selected = UNITS_DESC.filter((unit) => units.includes(unit))
  if (selected.length === 0) throw new Error('formatDuration: `units` must not be empty')

  const label = (unit: UnitKey, value: number) =>
    style === 'short'
      ? `${value}${SHORT_LABELS[unit]}`
      : `${value} ${LONG_LABELS[locale][unit][value === 1 ? 0 : 1]}`

  const smallest = selected[selected.length - 1]
  let remaining = Math.round(Math.abs(minutes))
  const parts: string[] = []
  for (const unit of selected) {
    // The smallest unit takes whatever is left, as a decimal if it isn't whole (e.g. units: ['hour'] -> "1.5h").
    const value =
      unit === smallest
        ? Math.round((remaining / UNIT_MINUTES[unit]) * 100) / 100
        : Math.floor(remaining / UNIT_MINUTES[unit])
    remaining -= value * UNIT_MINUTES[unit]
    if (value > 0) parts.push(label(unit, value))
  }

  return parts.length > 0 ? parts.join(' ') : label(smallest, 0)
}

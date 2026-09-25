export type UnitKey = 'minute' | 'hour' | 'day' | 'week'

export type Locale = 'en' | 'de'

export type UnitAliases = Partial<Record<UnitKey, string[]>>

/** Length of each unit in minutes. Months/years are omitted on purpose: their length varies. */
export const UNIT_MINUTES: Record<UnitKey, number> = {
  minute: 1,
  hour: 60,
  day: 1440,
  week: 10080,
}

/** Units ordered from largest to smallest. */
export const UNITS_DESC: UnitKey[] = ['week', 'day', 'hour', 'minute']

export const LOCALE_ALIASES: Record<Locale, Required<UnitAliases>> = {
  en: {
    minute: ['m', 'min', 'mins', 'minute', 'minutes'],
    hour: ['h', 'hr', 'hrs', 'hour', 'hours'],
    day: ['d', 'day', 'days'],
    week: ['w', 'wk', 'wks', 'week', 'weeks'],
  },
  de: {
    minute: ['m', 'min', 'minute', 'minuten'],
    hour: ['h', 'std', 'stunde', 'stunden'],
    day: ['d', 't', 'tag', 'tage', 'tagen'],
    week: ['w', 'wo', 'woche', 'wochen'],
  },
}

export const DEFAULT_LOCALES: Locale[] = ['en', 'de']

/**
 * Builds a lowercase alias -> unit lookup from the given locales plus custom aliases.
 * Custom aliases are applied last, so they win over built-in ones.
 */
export function buildAliasMap(
  locales: Locale[] = DEFAULT_LOCALES,
  customAliases: UnitAliases = {},
): Map<string, UnitKey> {
  const map = new Map<string, UnitKey>()
  const add = (aliases: UnitAliases) => {
    for (const unit of UNITS_DESC) {
      for (const alias of aliases[unit] ?? []) {
        map.set(alias.trim().toLowerCase(), unit)
      }
    }
  }
  for (const locale of locales) add(LOCALE_ALIASES[locale])
  add(customAliases)
  return map
}

import { foldName, isBuiltIn, type ResolvedUnits, type UnitKey } from './units'

/**
 * Why input was rejected:
 * - `empty`: nothing was entered, but a value is required.
 * - `invalid_format`: the text isn't a duration at all.
 * - `unknown_unit`: a number is followed by a word that isn't a unit name of the active locales.
 * - `missing_unit`: a number has no unit, e.g. `45` without `defaultUnit`.
 * - `out_of_range`: the duration is below `min` or above `max`.
 */
export type ParseErrorCode = 'empty' | 'invalid_format' | 'unknown_unit' | 'missing_unit' | 'out_of_range'

/** Keys of a locale's messages: the error codes plus variants picked by `formatErrorMessage`. */
export type MessageKey = ParseErrorCode | 'unknown_unit_suggestion' | 'out_of_range_min' | 'out_of_range_max'

/**
 * Long labels per plural category, for languages with more than two forms. The form is picked with
 * `Intl.PluralRules` for the locale's `code`; missing categories use `other`.
 *
 * @example
 * { one: 'ساعة', two: 'ساعتان', few: 'ساعات', other: 'ساعة' } // Arabic: 1 ساعة, 2 ساعتان, 5 ساعات, 11 ساعة
 */
export type PluralLabels = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }

/** Long label of a unit: `[one, other]`, or one form per plural category. */
export type LongLabel = [one: string, other: string] | PluralLabels

/** Unit names, separator words, display labels and error messages of one language. */
export interface DurationLocale {
  /** BCP 47 code, used for `Intl.DurationFormat` when `labels` are missing. */
  code: string
  /** Unit names accepted by the parser, also for custom units. Matched case-insensitively. */
  aliases: Partial<Record<UnitKey, string[]>> & Partial<Record<string, string[]>>
  /** Words that may join parts, like "and". The symbols `,` `+` `&` are always allowed. */
  separators?: string[]
  /**
   * Unit labels for the normalized text. Without them, `Intl.DurationFormat` is used where available.
   * Long labels are `[one, other]`, or a `PluralLabels` object for languages with more forms.
   * Labels of custom units are optional, and accepted by the parser.
   */
  labels?: {
    short: Record<UnitKey, string> & Partial<Record<string, string>>
    long: Record<UnitKey, LongLabel> & Partial<Record<string, LongLabel>>
  }
  /** Error texts. `{min}`, `{max}`, `{token}` and `{suggestion}` are filled in. */
  messages: Record<MessageKey, string>
}

/** Typed helper for custom locales, e.g. `defineLocale({ ...en, code: 'en-GB', aliases: { ... } })`. */
/* @__NO_SIDE_EFFECTS__ */
export function defineLocale(locale: DurationLocale): DurationLocale {
  return locale
}

/**
 * Builds a lowercase alias -> unit lookup. Later locales win over earlier ones, and the names from `customUnits`
 * win over all locales. The locales' labels of custom units are added, so the normalized text parses back.
 */
export function buildAliasMap(locales: DurationLocale[], units: string[], resolved: ResolvedUnits): Map<string, string> {
  const map = new Map<string, string>()
  const add = (name: string, unit: string) => map.set(foldName(name.trim().replace(/\.$/, '')), unit)
  for (const locale of locales) {
    for (const unit of units) {
      for (const alias of locale.aliases[unit] ?? []) add(alias, unit)
      if (isBuiltIn(unit) || !locale.labels) continue
      const { short, long } = locale.labels
      for (const label of [short[unit], ...longForms(long[unit])]) if (label !== undefined) add(label, unit)
    }
  }
  for (const unit of units) {
    for (const name of resolved.definitions.get(unit)?.names ?? []) map.set(name, unit)
  }
  return map
}

/** All forms of a long label. */
export function longForms(label: LongLabel | undefined): (string | undefined)[] {
  if (!label) return []
  return Array.isArray(label) ? label : Object.values(label)
}

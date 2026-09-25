import type { UnitKey } from './units'

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

/** Unit names, separator words, display labels and error messages of one language. */
export interface DurationLocale {
  /** BCP 47 code, used for `Intl.DurationFormat` when `labels` are missing. */
  code: string
  /** Unit names accepted by the parser. Matched case-insensitively. */
  aliases: Partial<Record<UnitKey, string[]>>
  /** Words that may join parts, like "and". The symbols `,` `+` `&` are always allowed. */
  separators?: string[]
  /** Unit labels for the normalized text. Without them, `Intl.DurationFormat` is used where available. */
  labels?: {
    short: Record<UnitKey, string>
    long: Record<UnitKey, [one: string, other: string]>
  }
  /** Error texts. `{min}`, `{max}`, `{token}` and `{suggestion}` are filled in. */
  messages: Record<MessageKey, string>
}

/** Typed helper for custom locales, e.g. `defineLocale({ ...en, code: 'en-GB', aliases: { ... } })`. */
export function defineLocale(locale: DurationLocale): DurationLocale {
  return locale
}

/** Builds a lowercase alias -> unit lookup. Later locales win over earlier ones. */
export function buildAliasMap(locales: DurationLocale[], units: UnitKey[]): Map<string, UnitKey> {
  const map = new Map<string, UnitKey>()
  for (const locale of locales) {
    for (const unit of units) {
      for (const alias of locale.aliases[unit] ?? []) map.set(alias.trim().toLowerCase(), unit)
    }
  }
  return map
}

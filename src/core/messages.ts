import { formatDuration } from './format'
import type { ParseErrorCode } from './parse'
import type { Locale } from './units'

export type ErrorMessages = Partial<Record<ParseErrorCode, string>>

/**
 * Default error texts. `{min}` and `{max}` in `out_of_range` are replaced with the formatted bounds.
 * `out_of_range_min` / `out_of_range_max` are used when only one bound is set.
 */
export const ERROR_MESSAGES: Record<Locale, Record<ParseErrorCode | 'out_of_range_min' | 'out_of_range_max', string>> = {
  en: {
    empty: 'Please enter a duration.',
    invalid_format: 'Enter a duration like "1h 30m" or "1:30".',
    unknown_unit: 'Unknown unit. Use minutes, hours, days or weeks.',
    missing_unit: 'Add a unit, e.g. "45min" or "2h".',
    out_of_range: 'Must be between {min} and {max}.',
    out_of_range_min: 'Must be at least {min}.',
    out_of_range_max: 'Must be at most {max}.',
  },
  de: {
    empty: 'Bitte gib eine Dauer ein.',
    invalid_format: 'Gib eine Dauer wie „1h 30m“ oder „1:30“ ein.',
    unknown_unit: 'Unbekannte Einheit. Erlaubt sind Minuten, Stunden, Tage oder Wochen.',
    missing_unit: 'Gib eine Einheit an, z. B. „45min“ oder „2h“.',
    out_of_range: 'Muss zwischen {min} und {max} liegen.',
    out_of_range_min: 'Muss mindestens {min} sein.',
    out_of_range_max: 'Darf höchstens {max} sein.',
  },
}

export interface ErrorMessageOptions {
  locale?: Locale
  min?: number
  max?: number
  /** Per-code replacements. They may also use `{min}` and `{max}`. */
  overrides?: ErrorMessages
}

/** Human-readable text for a parse error code. */
export function formatErrorMessage(code: ParseErrorCode, options: ErrorMessageOptions = {}): string {
  const { locale = 'en', min, max, overrides } = options
  const texts = ERROR_MESSAGES[locale]
  let template = overrides?.[code]
  if (template === undefined) {
    if (code !== 'out_of_range') template = texts[code]
    else if (min === undefined) template = texts.out_of_range_max
    else if (max === undefined) template = texts.out_of_range_min
    else template = texts.out_of_range
  }
  const bound = (minutes: number | undefined) => (minutes === undefined ? '' : formatDuration(minutes, { locale }))
  return template.replace('{min}', bound(min)).replace('{max}', bound(max))
}

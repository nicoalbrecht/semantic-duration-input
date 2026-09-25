import { buildAliasMap, UNIT_MINUTES, type Locale, type UnitAliases } from './units'

export type ParseErrorCode =
  | 'empty'
  | 'invalid_format'
  | 'unknown_unit'
  | 'missing_unit'
  | 'out_of_range'

export type ParseResult =
  | { ok: true; minutes: number | null }
  | { ok: false; error: ParseErrorCode }

export interface ParseOptions {
  /** Built-in locales whose unit names are accepted. Defaults to `['en', 'de']`. */
  locales?: Locale[]
  /** Extra unit aliases, e.g. `{ hour: ['óra'] }`. */
  customAliases?: UnitAliases
  /** Inclusive lower bound in minutes. */
  min?: number
  /** Inclusive upper bound in minutes. */
  max?: number
  /** When true, empty input is an error instead of `null`. */
  required?: boolean
}

const CLOCK_RE = /^(\d+):([0-5]\d)$/
const TOKEN_RE = /(\d+(?:[.,]\d+)?)\s*(\p{L}+)/gu
const SEPARATOR_RE = /^(?:\s|,|\+|&|\band\b|\bund\b)*$/
const BARE_NUMBER_RE = /^[\s,+&]*\d+(?:[.,]\d+)?[\s,+&]*$/

export function parseDuration(input: string, options: ParseOptions = {}): ParseResult {
  const text = input.trim().toLowerCase()

  if (text === '') {
    return options.required ? { ok: false, error: 'empty' } : { ok: true, minutes: null }
  }

  const minutes = parseClock(text) ?? parseTokens(text, options)
  if (typeof minutes !== 'number') return minutes

  const { min, max } = options
  if ((min !== undefined && minutes < min) || (max !== undefined && minutes > max)) {
    return { ok: false, error: 'out_of_range' }
  }
  return { ok: true, minutes }
}

function parseClock(text: string): number | null {
  const match = CLOCK_RE.exec(text)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function parseTokens(text: string, options: ParseOptions): number | { ok: false; error: ParseErrorCode } {
  const aliases = buildAliasMap(options.locales, options.customAliases)
  let total = 0
  let cursor = 0
  let tokenCount = 0

  for (const match of text.matchAll(TOKEN_RE)) {
    const gapError = checkGap(text.slice(cursor, match.index))
    if (gapError) return { ok: false, error: gapError }

    const unit = aliases.get(match[2])
    if (!unit) return { ok: false, error: 'unknown_unit' }

    total += Number(match[1].replace(',', '.')) * UNIT_MINUTES[unit]
    cursor = match.index + match[0].length
    tokenCount++
  }

  const gapError = checkGap(text.slice(cursor))
  if (gapError) return { ok: false, error: gapError }
  if (tokenCount === 0) return { ok: false, error: 'invalid_format' }

  return Math.round(total)
}

/** Text between tokens may only contain separators; a stray number means a unit is missing. */
function checkGap(gap: string): ParseErrorCode | null {
  if (SEPARATOR_RE.test(gap)) return null
  return BARE_NUMBER_RE.test(gap) ? 'missing_unit' : 'invalid_format'
}

import { fromIso } from './iso'
import { buildAliasMap, type DurationLocale, type ParseErrorCode } from './locale'
import { de } from './locales/de'
import { en } from './locales/en'
import { suggest } from './suggest'
import { UNIT_SECONDS, unitsFor, type Precision, type UnitKey } from './units'

export type { ParseErrorCode }

/** Why `parseDuration` rejected the input. Pass it to `formatErrorMessage` for a readable text. */
export interface ParseFailure {
  ok: false
  /** What went wrong, see `ParseErrorCode`. */
  error: ParseErrorCode
  /** The part of the input that caused the error, as typed. */
  token?: string
  /** Position of `token` in the input. */
  index?: number
  /** For `unknown_unit`: the closest known unit name, if one is close enough. */
  suggestion?: string
}

/**
 * Result of `parseDuration`: either the duration (in seconds and minutes, `null` for empty input)
 * or a `ParseFailure`. Check `ok` to tell them apart.
 */
export type ParseResult = { ok: true; seconds: number | null; minutes: number | null } | ParseFailure

export interface ParseOptions {
  /** Locales whose unit names and separator words are accepted. Defaults to `[en, de]`. */
  locales?: DurationLocale[]
  /**
   * `'minute'` (default): results are rounded to whole minutes and seconds aren't accepted.
   * `'second'`: seconds (`30s`, `1:02:03`) are accepted and results are rounded to whole seconds.
   */
  precision?: Precision
  /** A bare number after the last unit takes the next smaller unit: `1h30` is 1h 30min. Defaults to `true`. */
  implicitUnits?: boolean
  /** Unit for input that is only a number, e.g. `'minute'` makes `45` mean 45 minutes. */
  defaultUnit?: UnitKey
  /** Inclusive lower bound in seconds. */
  min?: number
  /** Inclusive upper bound in seconds. */
  max?: number
  /** Report empty input as `empty` instead of returning `null`. */
  required?: boolean
}

/** Locales accepted when none are given: English and German. */
export const DEFAULT_LOCALES: DurationLocale[] = [en, de]

const NUMBER = '\\d+(?:[.,]\\d+)?'
const NUMBER_RE = new RegExp(`^${NUMBER}$`)
const TOKEN_RE = new RegExp(`(${NUMBER})\\s*(\\p{L}+)`, 'gu')
const PART_RE = /[^\s,+&]+/g
const CLOCK_RE = /^(\d+):([0-5]\d)$/
const CLOCK_SECONDS_RE = /^(\d+):([0-5]\d):([0-5]\d)$/

const toNumber = (text: string) => Number(text.replace(',', '.'))

/**
 * Parses human-friendly duration text: units (`2h 30min`, `3 Tage`), implicit units (`1h30`),
 * decimals (`1,5h`), clock format (`1:30`) and ISO 8601 (`PT1H30M`).
 *
 * @example
 * parseDuration('1h 30m')  // { ok: true, seconds: 5400, minutes: 90 }
 * parseDuration('')        // { ok: true, seconds: null, minutes: null }
 * parseDuration('2 huors') // { ok: false, error: 'unknown_unit', token: 'huors', index: 2, suggestion: 'hours' }
 */
export function parseDuration(input: string, options: ParseOptions = {}): ParseResult {
  const offset = input.length - input.trimStart().length
  const raw = input.trim()
  if (raw === '') {
    return options.required ? { ok: false, error: 'empty' } : { ok: true, seconds: null, minutes: null }
  }

  const text = raw.toLowerCase()
  const precision = options.precision ?? 'minute'
  let total = parseClock(text, precision) ?? fromIso(text)
  if (total === null && options.defaultUnit && NUMBER_RE.test(text)) {
    total = toNumber(text) * UNIT_SECONDS[options.defaultUnit]
  }
  if (total === null) {
    const result = parseTokens(raw, text, options)
    if (typeof result !== 'number') {
      return result.index === undefined ? result : { ...result, index: result.index + offset }
    }
    total = result
  }

  const granularity = UNIT_SECONDS[precision]
  const seconds = Math.round(total / granularity) * granularity
  const { min, max } = options
  if ((min !== undefined && seconds < min) || (max !== undefined && seconds > max)) {
    return { ok: false, error: 'out_of_range' }
  }
  return { ok: true, seconds, minutes: seconds / 60 }
}

function parseClock(text: string, precision: Precision): number | null {
  const long = precision === 'second' ? CLOCK_SECONDS_RE.exec(text) : null
  if (long) return Number(long[1]) * 3600 + Number(long[2]) * 60 + Number(long[3])
  const short = CLOCK_RE.exec(text)
  return short ? Number(short[1]) * 3600 + Number(short[2]) * 60 : null
}

function parseTokens(raw: string, text: string, options: ParseOptions): number | ParseFailure {
  const locales = options.locales ?? DEFAULT_LOCALES
  const units = unitsFor(options.precision)
  const aliases = buildAliasMap(locales, units)
  const separators = new Set(locales.flatMap((locale) => locale.separators ?? []).map((word) => word.toLowerCase()))
  const fail = (error: ParseErrorCode, index: number, length: number, extra: Partial<ParseFailure> = {}): ParseFailure => ({
    ok: false,
    error,
    token: raw.slice(index, index + length),
    index,
    ...extra,
  })

  /** Words between tokens that are neither separators nor anything else we understand. */
  const strayParts = (from: number, to: number) =>
    [...text.slice(from, to).matchAll(PART_RE)]
      .filter((part) => !separators.has(part[0]))
      .map((part) => ({ word: part[0], index: from + part.index }))

  let total = 0
  let cursor = 0
  let lastUnit: UnitKey | undefined

  for (const match of text.matchAll(TOKEN_RE)) {
    const [stray] = strayParts(cursor, match.index)
    if (stray) return fail(NUMBER_RE.test(stray.word) ? 'missing_unit' : 'invalid_format', stray.index, stray.word.length)

    const word = match[2]
    const wordIndex = match.index + match[0].length - word.length
    const unit = aliases.get(word)
    if (!unit) return fail('unknown_unit', wordIndex, word.length, { suggestion: suggest(word, aliases.keys()) })

    total += toNumber(match[1]) * UNIT_SECONDS[unit]
    cursor = match.index + match[0].length
    lastUnit = unit
  }

  const trailing = strayParts(cursor, text.length)
  if (trailing.length > 0) {
    const [first] = trailing
    const isNumber = NUMBER_RE.test(first.word)
    if (!isNumber) return fail('invalid_format', first.index, first.word.length)
    // `1h30`: a single trailing number takes the unit below the last one.
    const next = lastUnit && options.implicitUnits !== false ? units[units.indexOf(lastUnit) + 1] : undefined
    if (trailing.length > 1 || !next) return fail('missing_unit', first.index, first.word.length)
    total += toNumber(first.word) * UNIT_SECONDS[next]
    lastUnit = next
  }

  if (lastUnit === undefined) return fail('invalid_format', 0, raw.length)
  return total
}

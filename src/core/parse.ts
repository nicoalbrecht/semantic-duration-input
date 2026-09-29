import { fromIso } from './iso'
import { buildAliasMap, type DurationLocale, type ParseErrorCode } from './locale'
import { de } from './locales/de'
import { en } from './locales/en'
import { suggest } from './suggest'
import {
  foldName,
  nextSmallerBuiltIn,
  resolveUnits,
  unitSeconds,
  unitsFor,
  UNIT_SECONDS,
  type CustomUnits,
  type Precision,
  type ResolvedUnits,
  type UnitName,
} from './units'

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
   * `'minute'` (default): results are rounded to whole minutes and seconds aren't a unit (ISO input like `PT30S` is still rounded).
   * `'second'`: seconds (`30s`, `1:02:03`) are accepted and results are rounded to whole seconds.
   */
  precision?: Precision
  /** A bare number after the last unit takes the next smaller unit: `1h30` is 1h 30min. Defaults to `true`. */
  implicitUnits?: boolean
  /** Unit for input that is only a number, e.g. `'minute'` makes `45` mean 45 minutes. */
  defaultUnit?: UnitName
  /**
   * Units of your own (`sprint`, `workday`) and other lengths for `day` and `week`, e.g. `{ day: 8 * 3600 }`.
   * ISO 8601 and clock input (`1:30`) always use the standard lengths.
   */
  customUnits?: CustomUnits
  /** Inclusive lower bound in seconds. */
  min?: number
  /** Inclusive upper bound in seconds. */
  max?: number
  /** Report empty input as `empty` instead of returning `null`. */
  required?: boolean
}

/** Locales accepted when none are given: English and German. */
export const DEFAULT_LOCALES: DurationLocale[] = [en, de]

/**
 * Longer input is rejected as `invalid_format` without parsing. Real durations are far shorter, and
 * matching a long run of digits takes quadratic time, which would let a large request block a server.
 */
const MAX_INPUT_LENGTH = 256

const NUMBER = '\\d+(?:[.,]\\d+)?'
const NUMBER_RE = new RegExp(`^${NUMBER}$`)
// A unit word may end with a period (`2 Std.`), but not one that starts a decimal (`1h.5`). Marks after the
// first letter belong to the word: Devanagari vowel signs (`घंटे`) and Arabic diacritics are marks.
const TOKEN_RE = new RegExp(`(${NUMBER})\\s*(\\p{L}[\\p{L}\\p{M}]*)(?:\\.(?!\\d))?`, 'gu')
const PART_RE = /[^\s,+&]+/g
// Scripts written without spaces: a separator in them may be attached to the unit before it (`1小时零5分钟`).
const UNSPACED_RE = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+$/u
const CLOCK_RE = /^(\d+):([0-5]\d)$/
const CLOCK_SECONDS_RE = /^(\d+):([0-5]\d):([0-5]\d)$/

const toNumber = (text: string) => Number(text.replace(',', '.'))

// Arabic-Indic, Persian, Devanagari and full-width digits: the code point of each zero.
const DIGIT_ZEROS = [0x0660, 0x06f0, 0x0966, 0xff10]
const PUNCTUATION: Record<string, string> = { '٫': '.', '،': ',', '、': ',', '，': ',', '：': ':', '＋': '+' }
const NATIVE_RE = /[\u0660-\u0669\u06f0-\u06f9\u0966-\u096f\uff10-\uff19٫،、，：＋]/g

/**
 * Maps native and full-width digits and punctuation to ASCII (`٣٠` -> `30`, `，` -> `,`). Each character is
 * replaced by exactly one, so indices into the result are indices into the input.
 */
function normalizeInput(text: string): string {
  return text.replace(NATIVE_RE, (char) => {
    const code = char.charCodeAt(0)
    const zero = DIGIT_ZEROS.find((start) => code >= start && code <= start + 9)
    return zero === undefined ? PUNCTUATION[char] : String(code - zero)
  })
}

/**
 * Parses human-friendly duration text: units (`2h 30min`, `3 Tage`), implicit units (`1h30`),
 * decimals (`1,5h`), clock format (`1:30`) and ISO 8601 (`PT1H30M`). Native digits (`٣٠`, `३०`) and
 * full-width digits and punctuation (`１小时，３０分钟`) are read like their ASCII counterparts.
 *
 * @example
 * parseDuration('1h 30m')  // { ok: true, seconds: 5400, minutes: 90 }
 * parseDuration('')        // { ok: true, seconds: null, minutes: null }
 * parseDuration('2 huors') // { ok: false, error: 'unknown_unit', token: 'huors', index: 2, suggestion: 'hours' }
 */
export function parseDuration(input: string, options: ParseOptions = {}): ParseResult {
  // Resolved before anything else, so an invalid configuration throws for every input.
  const units = resolveUnits(options.customUnits)
  const defaultLength = options.defaultUnit && unitSeconds(options.defaultUnit, units, 'parseDuration')
  const offset = input.length - input.trimStart().length
  // `source` is what the user typed, for error tokens; `raw` has ASCII digits and punctuation, at the same indices.
  const source = input.trim()
  if (source === '') {
    return options.required ? { ok: false, error: 'empty' } : { ok: true, seconds: null, minutes: null }
  }

  if (source.length > MAX_INPUT_LENGTH) return { ok: false, error: 'invalid_format', token: source, index: offset }
  const raw = normalizeInput(source)

  const precision = options.precision ?? 'minute'
  let total = parseClock(raw, precision) ?? fromIso(raw)
  if (total === null && defaultLength && NUMBER_RE.test(raw)) {
    total = toNumber(raw) * defaultLength
  }
  if (total === null) {
    const result = parseTokens(raw, source, options, units)
    if (typeof result !== 'number') {
      return result.index === undefined ? result : { ...result, index: result.index + offset }
    }
    total = result
  }

  const granularity = UNIT_SECONDS[precision]
  const seconds = Math.round(total / granularity) * granularity
  // Absurdly long numbers overflow to Infinity or lose precision.
  if (!Number.isSafeInteger(seconds)) return { ok: false, error: 'invalid_format', token: source, index: offset }
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

// Works on the raw text and folds single words for lookups: lowercasing or normalizing the whole text can change
// its length (e.g. "İ"), which would shift the reported indices. Error tokens are cut from `source`, as typed.
function parseTokens(raw: string, source: string, options: ParseOptions, resolved: ResolvedUnits): number | ParseFailure {
  const locales = options.locales ?? DEFAULT_LOCALES
  const aliases = buildAliasMap(locales, unitsFor(options.precision, resolved), resolved)
  const separators = new Set(locales.flatMap((locale) => locale.separators ?? []).map(foldName))
  const attachable = [...separators].filter((separator) => UNSPACED_RE.test(separator))
  /** The unit of `name`, also when an attachable separator follows it: `小时零` is `小时`. */
  const lookup = (name: string) => {
    const unit = aliases.get(name)
    if (unit) return unit
    const separator = attachable.find((word) => name.length > word.length && name.endsWith(word))
    return separator === undefined ? undefined : aliases.get(name.slice(0, -separator.length))
  }
  const fail = (error: ParseErrorCode, index: number, length: number, extra: Partial<ParseFailure> = {}): ParseFailure => ({
    ok: false,
    error,
    token: source.slice(index, index + length),
    index,
    ...extra,
  })

  /** Words between tokens that are neither separators nor anything else we understand. */
  const strayParts = (from: number, to: number) =>
    [...raw.slice(from, to).matchAll(PART_RE)]
      .filter((part) => !separators.has(foldName(part[0])))
      .map((part) => ({ word: part[0], index: from + part.index }))

  let total = 0
  let cursor = 0
  let lastUnit: string | undefined

  for (const match of raw.matchAll(TOKEN_RE)) {
    const [stray] = strayParts(cursor, match.index)
    if (stray) return fail(NUMBER_RE.test(stray.word) ? 'missing_unit' : 'invalid_format', stray.index, stray.word.length)

    const word = match[2]
    const wordIndex = match.index + match[0].indexOf(word, match[1].length)
    const name = foldName(word)
    const unit = lookup(name)
    if (!unit) return fail('unknown_unit', wordIndex, word.length, { suggestion: suggest(name, aliases.keys()) })

    total += toNumber(match[1]) * resolved.seconds.get(unit)!
    cursor = match.index + match[0].length
    lastUnit = unit
  }

  const trailing = strayParts(cursor, raw.length)
  if (trailing.length > 0) {
    const [first] = trailing
    const isNumber = NUMBER_RE.test(first.word)
    if (!isNumber) return fail('invalid_format', first.index, first.word.length)
    // `1h30`: a single trailing number takes the built-in unit below the last one.
    const next =
      lastUnit && options.implicitUnits !== false ? nextSmallerBuiltIn(lastUnit, options.precision, resolved) : undefined
    if (!next) return fail('missing_unit', first.index, first.word.length)
    // Only one trailing number can take the implicit unit: report the extra one.
    if (trailing.length > 1) {
      const [, second] = trailing
      return fail(NUMBER_RE.test(second.word) ? 'missing_unit' : 'invalid_format', second.index, second.word.length)
    }
    total += toNumber(first.word) * resolved.seconds.get(next)!
    lastUnit = next
  }

  if (lastUnit === undefined) return fail('invalid_format', 0, raw.length)
  return total
}

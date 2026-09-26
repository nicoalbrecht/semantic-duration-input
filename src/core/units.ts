/** Units the parser and the formatter know. There are no months or years. */
export type UnitKey = 'second' | 'minute' | 'hour' | 'day' | 'week'

/** A built-in unit or the name of a custom unit (see `CustomUnits`). */
export type UnitName = UnitKey | (string & {})

/** Length of each unit in seconds. Months/years are omitted on purpose: their length varies. */
export const UNIT_SECONDS: Record<UnitKey, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
}

/** Units ordered from largest to smallest. */
export const UNITS_DESC: UnitKey[] = ['week', 'day', 'hour', 'minute', 'second']

/** Smallest unit the parser and the formatter work with. */
export type Precision = 'minute' | 'second'

/** A unit of your own, or extra aliases for an overridden `day` or `week`. */
export interface CustomUnit {
  /** Length in seconds, a whole number greater than 0. */
  seconds: number
  /** Names accepted by the parser in every locale, matched case-insensitively. Letters only. */
  aliases?: string[]
  /**
   * Labels for the normalized text, used when the display locale has none for this unit. Accepted by the parser too.
   * Without them, the unit's name is used. Not allowed on `day` and `week`: their labels come from the locale.
   */
  labels?: { short?: string; long?: [one: string, other: string] }
}

/**
 * Units of your own and overridden lengths of `day` and `week`, by name. A number is the length in seconds.
 * The name of a custom unit is accepted by the parser and is its default label.
 *
 * @example
 * { day: 8 * 3600, week: 5 * 8 * 3600, sprint: { seconds: 10 * 8 * 3600, aliases: ['sprints'] } }
 */
export type CustomUnits = Record<string, number | CustomUnit | undefined>

/** Units after applying `CustomUnits`. */
export interface ResolvedUnits {
  /** Length of every unit in seconds. */
  seconds: ReadonlyMap<string, number>
  /** All units, longest first. Units of the same length keep their order, built-in ones first. */
  desc: readonly string[]
  /** Parser names (lowercase, without a trailing period) and labels of the units in `CustomUnits`. */
  definitions: ReadonlyMap<string, { names: string[]; labels?: CustomUnit['labels'] }>
}

const LETTERS = /^\p{L}+$/u
// A label may end with a period (`Std.`), like unit words in the input.
const LABEL = /^\p{L}+\.?$/u
const OVERRIDABLE: UnitName[] = ['day', 'week']

export const isBuiltIn = (unit: string): unit is UnitKey => unit in UNIT_SECONDS

const resolved = new WeakMap<CustomUnits, ResolvedUnits>()
let builtIn: ResolvedUnits | undefined

/**
 * Merges `customUnits` into the built-in units. Throws for invalid definitions. Results are cached per object,
 * because the input parses on every keystroke.
 */
export function resolveUnits(customUnits?: CustomUnits): ResolvedUnits {
  if (!customUnits) return (builtIn ??= buildUnits({}))
  let units = resolved.get(customUnits)
  if (!units) resolved.set(customUnits, (units = buildUnits(customUnits)))
  return units
}

function buildUnits(customUnits: CustomUnits): ResolvedUnits {
  const fail = (message: string): never => {
    throw new Error(`customUnits: ${message}`)
  }
  const seconds = new Map<string, number>(Object.entries(UNIT_SECONDS))
  const definitions = new Map<string, { names: string[]; labels?: CustomUnit['labels'] }>()
  const owners = new Map<string, string>()

  for (const [unit, definition] of Object.entries(customUnits)) {
    if (definition === undefined) continue
    const { seconds: length, aliases = [], labels } = typeof definition === 'number' ? { seconds: definition } : definition
    if (isBuiltIn(unit) && !OVERRIDABLE.includes(unit)) fail(`only day and week can be overridden, not ${unit}`)
    if (!isBuiltIn(unit) && !LETTERS.test(unit)) fail(`unit names must be letters only, got "${unit}"`)
    if (!Number.isSafeInteger(length) || length <= 0) fail(`${unit} must be a whole number of seconds greater than 0, got ${length}`)
    if (isBuiltIn(unit) && labels) fail(`${unit} can't have labels; set them in the locale`)

    for (const alias of aliases) if (!LETTERS.test(alias)) fail(`aliases must be letters only, got "${alias}"`)
    const labelTexts = [labels?.short, ...(labels?.long ?? [])].filter((label) => label !== undefined)
    for (const label of labelTexts) if (!LABEL.test(label)) fail(`labels must be letters only, got "${label}"`)

    const names = [...(isBuiltIn(unit) ? [] : [unit]), ...aliases, ...labelTexts].map((name) => name.replace(/\.$/, '').toLowerCase())
    for (const name of names) {
      const owner = owners.get(name)
      if (owner !== undefined && owner !== unit) fail(`"${name}" is used by both ${owner} and ${unit}`)
      owners.set(name, unit)
    }
    seconds.set(unit, length)
    definitions.set(unit, { names: [...new Set(names)], labels })
  }

  const length = (unit: UnitKey) => seconds.get(unit)!
  if (!(length('hour') < length('day') && length('day') < length('week'))) {
    fail(`day must be longer than an hour and shorter than week, got day = ${length('day')}s and week = ${length('week')}s`)
  }
  // `sort` is stable: units of the same length keep their order, built-in ones first.
  const desc = [...seconds.keys()].sort((a, b) => seconds.get(b)! - seconds.get(a)!)
  return { seconds, desc, definitions }
}

/** Units allowed at the given precision, largest first: those at least as long as the precision. */
export function unitsFor(precision: Precision = 'minute', units: ResolvedUnits = resolveUnits()): string[] {
  return units.desc.filter((unit) => units.seconds.get(unit)! >= UNIT_SECONDS[precision])
}

/**
 * The unit a bare number after `unit` takes (`1h30`): the longest built-in unit that is shorter than `unit`,
 * so custom units never take it over.
 */
export function nextSmallerBuiltIn(unit: string, precision: Precision = 'minute', units: ResolvedUnits = resolveUnits()) {
  const length = units.seconds.get(unit)!
  return UNITS_DESC.find((next) => {
    const nextLength = units.seconds.get(next)!
    return nextLength < length && nextLength >= UNIT_SECONDS[precision]
  })
}

/** Length of `unit` in seconds. Throws for names that are neither built in nor in `customUnits`. */
export function unitSeconds(unit: string, units: ResolvedUnits, caller: string): number {
  const length = units.seconds.get(unit)
  if (length === undefined) throw new Error(`${caller}: unknown unit "${unit}"`)
  return length
}

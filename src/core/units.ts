/** Units the parser and the formatter know. There are no months or years. */
export type UnitKey = 'second' | 'minute' | 'hour' | 'day' | 'week'

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

/** Units allowed at the given precision, largest first. */
export function unitsFor(precision: Precision = 'minute'): UnitKey[] {
  return precision === 'second' ? UNITS_DESC : UNITS_DESC.filter((unit) => unit !== 'second')
}

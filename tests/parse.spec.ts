import { describe, expect, it } from 'vitest'
import { parseDuration, type ParseErrorCode } from '../src/core/parse'

const valid: [string, number][] = [
  // examples from the spec
  ['2h', 120],
  ['3days', 4320],
  ['189h', 11340],
  ['10 hours', 600],
  ['59 min', 59],
  // single units & aliases
  ['1m', 1],
  ['45 mins', 45],
  ['1 minute', 1],
  ['2 hrs', 120],
  ['1 day', 1440],
  ['1w', 10080],
  ['2 weeks', 20160],
  // compound
  ['1h 30m', 90],
  ['1h30m', 90],
  ['2d4h', 3120],
  ['1d 2h 30min', 1590],
  ['1 day 3 hours', 1620],
  ['1h, 30min', 90],
  ['1h + 30min', 90],
  ['1 hour and 30 minutes', 90],
  // decimals
  ['1.5h', 90],
  ['1,5h', 90],
  ['0.5 days', 720],
  ['0,25 h', 15],
  ['0.01h', 1],
  // clock
  ['1:30', 90],
  ['0:05', 5],
  ['26:05', 1565],
  // German
  ['2 Stunden', 120],
  ['1 Stunde 15 Minuten', 75],
  ['3 Tage', 4320],
  ['1 Tag und 2 Std', 1560],
  ['2 Wochen', 20160],
  ['1,5 Std', 90],
  // case & whitespace
  ['  2H  ', 120],
  ['10 HOURS', 600],
  ['1   h    30   m', 90],
]

describe('parseDuration – valid input', () => {
  it.each(valid)('%j -> %i minutes', (input, minutes) => {
    expect(parseDuration(input)).toEqual({ ok: true, minutes })
  })
})

const invalid: [string, ParseErrorCode][] = [
  ['45', 'missing_unit'],
  ['1h 30', 'missing_unit'],
  ['5 parsecs', 'unknown_unit'],
  ['1:75', 'invalid_format'],
  ['abc', 'invalid_format'],
  ['2h foo', 'invalid_format'],
  ['-2h', 'invalid_format'],
  ['h', 'invalid_format'],
  ['1.5.3h', 'invalid_format'],
]

describe('parseDuration – invalid input', () => {
  it.each(invalid)('%j -> %s', (input, error) => {
    expect(parseDuration(input)).toEqual({ ok: false, error })
  })
})

describe('parseDuration – options', () => {
  it('returns null for empty input', () => {
    expect(parseDuration('')).toEqual({ ok: true, minutes: null })
    expect(parseDuration('   ')).toEqual({ ok: true, minutes: null })
  })

  it('reports empty input when required', () => {
    expect(parseDuration('', { required: true })).toEqual({ ok: false, error: 'empty' })
  })

  it('restricts accepted units to the given locales', () => {
    expect(parseDuration('2 Stunden', { locales: ['en'] })).toEqual({ ok: false, error: 'unknown_unit' })
    expect(parseDuration('2 hours', { locales: ['de'] })).toEqual({ ok: false, error: 'unknown_unit' })
  })

  it('accepts custom aliases', () => {
    const customAliases = { hour: ['óra'], day: ['nap'] }
    expect(parseDuration('2 óra', { customAliases })).toEqual({ ok: true, minutes: 120 })
    expect(parseDuration('1 nap 1 óra', { customAliases })).toEqual({ ok: true, minutes: 1500 })
  })

  it('enforces min and max', () => {
    expect(parseDuration('10min', { min: 15 })).toEqual({ ok: false, error: 'out_of_range' })
    expect(parseDuration('2h', { max: 60 })).toEqual({ ok: false, error: 'out_of_range' })
    expect(parseDuration('1h', { min: 60, max: 60 })).toEqual({ ok: true, minutes: 60 })
  })
})

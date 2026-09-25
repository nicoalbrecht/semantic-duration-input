import { describe, expect, it } from 'vitest'
import { parseDuration, type ParseErrorCode } from '../src/core/parse'
import { de, defineLocale, en } from '../src/core'

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
  // implicit next-smaller unit
  ['1h30', 90],
  ['1h 30', 90],
  ['2h 15', 135],
  ['1d 4', 1680],
  ['1w2', 12960],
  ['1h and 30', 90],
  // ISO 8601
  ['PT1H30M', 90],
  ['pt45m', 45],
  ['P1DT2H', 1560],
  ['P2W', 20160],
  ['PT1,5H', 90],
]

describe('parseDuration – valid input', () => {
  it.each(valid)('%j -> %i minutes', (input, minutes) => {
    expect(parseDuration(input)).toEqual({ ok: true, minutes, seconds: minutes * 60 })
  })
})

const invalid: [string, ParseErrorCode][] = [
  ['45', 'missing_unit'],
  ['1h 30 15', 'missing_unit'],
  ['1h 30 15min', 'missing_unit'],
  ['30m 15', 'missing_unit'],
  ['5 parsecs', 'unknown_unit'],
  ['30s', 'unknown_unit'],
  ['1:30:00', 'invalid_format'],
  ['P', 'invalid_format'],
  ['PT', 'invalid_format'],
  ['P1Y', 'invalid_format'],
  ['1:75', 'invalid_format'],
  ['abc', 'invalid_format'],
  ['2h foo', 'invalid_format'],
  ['-2h', 'invalid_format'],
  ['h', 'invalid_format'],
  ['1.5.3h', 'invalid_format'],
]

describe('parseDuration – invalid input', () => {
  it.each(invalid)('%j -> %s', (input, error) => {
    expect(parseDuration(input)).toMatchObject({ ok: false, error })
  })
})

describe('parseDuration – error details', () => {
  it('points at the offending token', () => {
    expect(parseDuration('  2h foo')).toEqual({ ok: false, error: 'invalid_format', token: 'foo', index: 5 })
    expect(parseDuration('1h 30 15min')).toEqual({ ok: false, error: 'missing_unit', token: '30', index: 3 })
    expect(parseDuration('45')).toEqual({ ok: false, error: 'missing_unit', token: '45', index: 0 })
  })

  it('suggests the closest unit for typos', () => {
    expect(parseDuration('2 Huors')).toEqual({ ok: false, error: 'unknown_unit', token: 'Huors', index: 2, suggestion: 'hours' })
    expect(parseDuration('3 minuts')).toMatchObject({ suggestion: 'minute' })
    expect(parseDuration('1 stnde')).toMatchObject({ suggestion: 'stunde' })
    expect(parseDuration('5 parsecs')).toMatchObject({ suggestion: undefined })
    expect(parseDuration('5 x')).toMatchObject({ suggestion: undefined })
  })
})

describe('parseDuration – options', () => {
  it('returns null for empty input', () => {
    expect(parseDuration('')).toEqual({ ok: true, minutes: null, seconds: null })
    expect(parseDuration('   ')).toEqual({ ok: true, minutes: null, seconds: null })
  })

  it('reports empty input when required', () => {
    expect(parseDuration('', { required: true })).toEqual({ ok: false, error: 'empty' })
  })

  it('restricts accepted units and separators to the given locales', () => {
    expect(parseDuration('2 Stunden', { locales: [en] })).toMatchObject({ ok: false, error: 'unknown_unit' })
    expect(parseDuration('2 hours', { locales: [de] })).toMatchObject({ ok: false, error: 'unknown_unit' })
    expect(parseDuration('1h und 30m', { locales: [en] })).toMatchObject({ ok: false, error: 'invalid_format' })
  })

  it('accepts custom locales', () => {
    const hu = defineLocale({ ...en, code: 'hu', aliases: { hour: ['óra'], day: ['nap'] }, separators: ['és'] })
    expect(parseDuration('2 óra', { locales: [hu] })).toMatchObject({ ok: true, minutes: 120 })
    expect(parseDuration('1 nap és 1 óra', { locales: [hu] })).toMatchObject({ ok: true, minutes: 1500 })
    expect(parseDuration('1 nap 1 óra 2h', { locales: [en, hu] })).toMatchObject({ ok: true, minutes: 1620 })
  })

  it('enforces min and max in seconds', () => {
    expect(parseDuration('10min', { min: 900 })).toEqual({ ok: false, error: 'out_of_range' })
    expect(parseDuration('2h', { max: 3600 })).toEqual({ ok: false, error: 'out_of_range' })
    expect(parseDuration('1h', { min: 3600, max: 3600 })).toMatchObject({ ok: true, minutes: 60 })
  })

  it('accepts seconds with second precision', () => {
    const precision = 'second'
    expect(parseDuration('30s', { precision })).toEqual({ ok: true, seconds: 30, minutes: 0.5 })
    expect(parseDuration('1m30', { precision })).toMatchObject({ seconds: 90 })
    expect(parseDuration('1 min 5 sek', { precision })).toMatchObject({ seconds: 65 })
    expect(parseDuration('1:02:03', { precision })).toMatchObject({ seconds: 3723 })
    expect(parseDuration('1:30', { precision })).toMatchObject({ seconds: 5400 })
    expect(parseDuration('PT1M5S', { precision })).toMatchObject({ seconds: 65 })
    expect(parseDuration('0.01h', { precision })).toMatchObject({ seconds: 36 })
  })

  it('rounds to whole minutes by default', () => {
    expect(parseDuration('PT1M40S')).toMatchObject({ seconds: 120, minutes: 2 })
  })

  it('uses defaultUnit for bare numbers', () => {
    expect(parseDuration('45', { defaultUnit: 'minute' })).toMatchObject({ ok: true, minutes: 45 })
    expect(parseDuration('1,5', { defaultUnit: 'hour' })).toMatchObject({ ok: true, minutes: 90 })
    expect(parseDuration('45 15', { defaultUnit: 'minute' })).toMatchObject({ ok: false, error: 'missing_unit' })
  })

  it('can turn implicit units off', () => {
    expect(parseDuration('1h30', { implicitUnits: false })).toMatchObject({ ok: false, error: 'missing_unit' })
  })
})

import { describe, expect, it } from 'vitest'
import { durationSchema, fromIso, fromModelValue, resolveAmount, toIso, toModelValue } from '../src/core'
import { editDistance, suggest } from '../src/core/suggest'

describe('ISO 8601', () => {
  it.each([
    ['PT1H30M', 5400],
    ['P1DT2H', 93600],
    ['P2W', 1209600],
    ['PT90S', 90],
    ['pt0,5h', 1800],
  ])('fromIso(%j) -> %i', (text, seconds) => {
    expect(fromIso(text)).toBe(seconds)
  })

  it.each(['', 'P', 'PT', 'P1DT', 'P1Y', 'P1M', '1h', 'PT1H30'])('rejects %j', (text) => {
    expect(fromIso(text)).toBeNull()
  })

  it.each([
    [0, 'PT0S'],
    [90, 'PT1M30S'],
    [5400, 'PT1H30M'],
    [93600, 'P1DT2H'],
    [1209600, 'P14D'],
  ])('toIso(%i) -> %j', (seconds, text) => {
    expect(toIso(seconds)).toBe(text)
    expect(fromIso(text)).toBe(seconds)
  })
})

describe('model values', () => {
  it('converts seconds to and from each format', () => {
    expect(toModelValue(5400)).toBe(90)
    expect(toModelValue(5400, 'seconds')).toBe(5400)
    expect(toModelValue(5400, 'ms')).toBe(5400000)
    expect(toModelValue(5400, 'iso')).toBe('PT1H30M')
    expect(toModelValue(null, 'iso')).toBeNull()
    expect(fromModelValue(90)).toBe(5400)
    expect(fromModelValue(5400000, 'ms')).toBe(5400)
    expect(fromModelValue('PT1H30M', 'iso')).toBe(5400)
    expect(fromModelValue('garbage', 'iso')).toBeNull()
    expect(fromModelValue(NaN)).toBeNull()
    expect(fromModelValue(undefined)).toBeNull()
  })

  it('supports custom formats', () => {
    const hours = { toModel: (s: number) => `${s / 3600}`, fromModel: (v: string) => Number(v) * 3600 }
    expect(toModelValue(5400, hours)).toBe('1.5')
    expect(fromModelValue('1.5', hours)).toBe(5400)
  })

  it('resolves amounts from numbers in the model unit or duration text', () => {
    expect(resolveAmount(30)).toBe(1800)
    expect(resolveAmount(30, 'seconds')).toBe(30)
    expect(resolveAmount('8h', 'ms')).toBe(28800)
    expect(resolveAmount('PT30S')).toBe(30)
    expect(resolveAmount(30, 'iso')).toBe(1800)
    expect(resolveAmount('nope')).toBeUndefined()
    expect(resolveAmount(undefined)).toBeUndefined()
  })
})

describe('durationSchema', () => {
  const validate = (schema: ReturnType<typeof durationSchema>, value: unknown) => schema['~standard'].validate(value)

  it('parses text into the model value', () => {
    expect(validate(durationSchema(), '1h 30m')).toEqual({ value: 90 })
    expect(validate(durationSchema({ valueFormat: 'iso' }), '90 min')).toEqual({ value: 'PT1H30M' })
    expect(validate(durationSchema(), '')).toEqual({ value: null })
  })

  it('reports localized issues', () => {
    expect(validate(durationSchema({ required: true }), '')).toEqual({ issues: [{ message: 'Please enter a duration.' }] })
    expect(validate(durationSchema({ max: '8h' }), '9h')).toEqual({ issues: [{ message: 'Must be at most 8h.' }] })
  })

  it('range-checks values that are already model values', () => {
    expect(validate(durationSchema({ min: 30 }), 45)).toEqual({ value: 45 })
    expect(validate(durationSchema({ min: 30 }), 15)).toEqual({ issues: [{ message: 'Must be at least 30min.' }] })
    expect(validate(durationSchema(), {})).toMatchObject({ issues: [{}] })
  })
})

describe('suggest', () => {
  it('computes edit distance with transpositions', () => {
    expect(editDistance('huors', 'hours')).toBe(1)
    expect(editDistance('abc', 'abc')).toBe(0)
    expect(editDistance('kitten', 'sitting')).toBe(3)
  })

  it('picks the closest long-enough candidate', () => {
    expect(suggest('hurs', ['h', 'hours', 'hrs'])).toBe('hours')
    expect(suggest('xy', ['day', 'h'])).toBeUndefined()
    expect(suggest('minuts', ['min', 'minutes'])).toBe('minutes')
  })
})

import { describe, expect, it } from 'vitest'
import { formatDuration } from '../src/core/format'
import { parseDuration } from '../src/core/parse'

describe('formatDuration', () => {
  it.each([
    [0, '0min'],
    [59, '59min'],
    [60, '1h'],
    [90, '1h 30min'],
    [1440, '1d'],
    [11340, '7d 21h'],
    [11345, '7d 21h 5min'],
    [20160, '14d'],
  ])('short: %i -> %j', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected)
  })

  it('formats long English with singular/plural', () => {
    expect(formatDuration(11340, { style: 'long' })).toBe('7 days 21 hours')
    expect(formatDuration(1501, { style: 'long' })).toBe('1 day 1 hour 1 minute')
    expect(formatDuration(0, { style: 'long' })).toBe('0 minutes')
  })

  it('formats long German with singular/plural', () => {
    expect(formatDuration(11340, { style: 'long', locale: 'de' })).toBe('7 Tage 21 Stunden')
    expect(formatDuration(1501, { style: 'long', locale: 'de' })).toBe('1 Tag 1 Stunde 1 Minute')
  })

  it('uses weeks only when requested', () => {
    expect(formatDuration(20160 + 60, { units: ['week', 'day', 'hour', 'minute'] })).toBe('2w 1h')
  })

  it('keeps leftovers as a decimal of the smallest unit', () => {
    expect(formatDuration(90, { units: ['hour'] })).toBe('1.5h')
    expect(formatDuration(1530, { units: ['day', 'hour'] })).toBe('1d 1.5h')
  })

  it('round-trips through parseDuration for every style and locale', () => {
    const styles = [
      {},
      { style: 'long' as const },
      { style: 'long' as const, locale: 'de' as const },
      { units: ['week' as const, 'day' as const, 'hour' as const, 'minute' as const] },
    ]
    for (const opts of styles) {
      for (let minutes = 0; minutes < 30000; minutes += 7) {
        expect(parseDuration(formatDuration(minutes, opts))).toEqual({ ok: true, minutes })
      }
    }
  })
})

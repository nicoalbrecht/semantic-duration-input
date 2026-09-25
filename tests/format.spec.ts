import { describe, expect, it } from 'vitest'
import { formatDuration } from '../src/core/format'
import { parseDuration } from '../src/core/parse'
import { de, defineLocale, en } from '../src/core'

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
  ])('short: %i min -> %j', (minutes, expected) => {
    expect(formatDuration(minutes * 60)).toBe(expected)
  })

  it('formats long English with singular/plural', () => {
    expect(formatDuration(11340 * 60, { style: 'long' })).toBe('7 days 21 hours')
    expect(formatDuration(1501 * 60, { style: 'long' })).toBe('1 day 1 hour 1 minute')
    expect(formatDuration(0, { style: 'long' })).toBe('0 minutes')
  })

  it('formats long German with singular/plural', () => {
    expect(formatDuration(11340 * 60, { style: 'long', locale: de })).toBe('7 Tage 21 Stunden')
    expect(formatDuration(1501 * 60, { style: 'long', locale: de })).toBe('1 Tag 1 Stunde 1 Minute')
  })

  it('uses weeks only when requested', () => {
    expect(formatDuration((20160 + 60) * 60, { units: ['week', 'day', 'hour', 'minute'] })).toBe('2w 1h')
  })

  it('keeps leftovers as a decimal of the smallest unit', () => {
    expect(formatDuration(5400, { units: ['hour'] })).toBe('1.5h')
    expect(formatDuration(1530 * 60, { units: ['day', 'hour'] })).toBe('1d 1.5h')
  })

  it('round-trips through parseDuration for every style and locale', () => {
    const styles = [
      {},
      { style: 'long' as const },
      { style: 'long' as const, locale: de },
      { units: ['week' as const, 'day' as const, 'hour' as const, 'minute' as const] },
    ]
    for (const opts of styles) {
      for (let minutes = 0; minutes < 30000; minutes += 7) {
        expect(parseDuration(formatDuration(minutes * 60, opts))).toMatchObject({ ok: true, minutes })
      }
    }
  })

  it('formats seconds when requested, and round-trips them', () => {
    const units = ['hour' as const, 'minute' as const, 'second' as const]
    expect(formatDuration(3723, { units })).toBe('1h 2min 3s')
    expect(formatDuration(65, { units, style: 'long' })).toBe('1 minute 5 seconds')
    expect(formatDuration(65, { units, style: 'long', locale: de })).toBe('1 Minute 5 Sekunden')
    for (let seconds = 0; seconds < 10000; seconds += 13) {
      expect(parseDuration(formatDuration(seconds, { units }), { precision: 'second' })).toMatchObject({ seconds })
    }
  })

  it('shows leftover seconds as a decimal of the smallest unit', () => {
    expect(formatDuration(90)).toBe('1.5min')
  })

  it.skipIf(!('DurationFormat' in Intl))('uses Intl.DurationFormat for locales without labels', () => {
    const fr = defineLocale({ ...en, code: 'fr', labels: undefined })
    expect(formatDuration(5400, { locale: fr, style: 'long' })).toBe(
      new (Intl as any).DurationFormat('fr', { style: 'long' }).format({ hours: 1, minutes: 30 }),
    )
  })

  it('falls back to English labels without Intl.DurationFormat', () => {
    const original = (Intl as any).DurationFormat
    ;(Intl as any).DurationFormat = undefined
    try {
      expect(formatDuration(5400, { locale: defineLocale({ ...en, code: 'fr', labels: undefined }) })).toBe('1h 30min')
    } finally {
      ;(Intl as any).DurationFormat = original
    }
  })
})

import { describe, expect, it } from 'vitest'
import { de, defineLocale, en, formatDuration, formatErrorMessage, parseDuration, type CustomUnits } from '../src/core'

const HOUR = 3600
const DAY = 86400

const workingTime: CustomUnits = { day: 8 * HOUR, week: 5 * 8 * HOUR }
const agile: CustomUnits = {
  pomodoro: 25 * 60,
  workday: { seconds: 8 * HOUR, aliases: ['workdays', 'wd'] },
  sprint: { seconds: 14 * DAY, aliases: ['sprints'], labels: { short: 'sp', long: ['sprint', 'sprints'] } },
}

const seconds = (input: string, customUnits: CustomUnits, options = {}) => {
  const result = parseDuration(input, { customUnits, ...options })
  return result.ok ? result.seconds : result
}

describe('customUnits: validation', () => {
  it.each<[string, CustomUnits]>([
    ['overriding seconds', { second: 2 }],
    ['overriding minutes', { minute: 30 }],
    ['overriding hours', { hour: 1800 }],
    ['a zero length', { tick: 0 }],
    ['a negative length', { tick: -60 }],
    ['a fractional length', { tick: 1.5 }],
    ['an infinite length', { tick: Infinity }],
    ['a name that is not letters only', { 'story-point': 3600 }],
    ['an alias that is not letters only', { sprint: { seconds: DAY, aliases: ['sp1'] } }],
    ['a label with a space', { workday: { seconds: DAY, labels: { long: ['work day', 'work days'] } } }],
    ['labels on an override', { day: { seconds: 8 * HOUR, labels: { short: 'wd' } } }],
    ['an alias used by two units', { sprint: { seconds: DAY, aliases: ['x'] }, block: { seconds: HOUR, aliases: ['X'] } }],
    ['a day longer than a week', { day: 8 * DAY }],
    ['a day not longer than an hour', { day: HOUR }],
  ])('throws for %s', (_, customUnits) => {
    expect(() => parseDuration('1h', { customUnits })).toThrow(/^customUnits: /)
  })

  it('throws for an unknown defaultUnit or display unit', () => {
    expect(() => parseDuration('', { defaultUnit: 'sprint' })).toThrow('parseDuration: unknown unit "sprint"')
    expect(() => formatDuration(60, { units: ['sprint'] })).toThrow('formatDuration: unknown unit "sprint"')
  })

  it('allows labels ending with a period and ignores undefined entries', () => {
    expect(seconds('2 Arb.', { workday: { seconds: 8 * HOUR, labels: { short: 'Arb.' } }, sprint: undefined })).toBe(16 * HOUR)
    expect(parseDuration('1 sprint', { customUnits: { sprint: undefined } })).toMatchObject({ error: 'unknown_unit' })
  })
})

describe('customUnits: parsing', () => {
  it('accepts new units by name, alias and label', () => {
    expect(seconds('1 sprint', agile)).toBe(14 * DAY)
    expect(seconds('2 SPRINTS', agile)).toBe(28 * DAY)
    expect(seconds('2sp 3d', agile)).toBe(31 * DAY)
    expect(seconds('2 pomodoro', agile)).toBe(50 * 60)
    expect(seconds('1 workday and 2h', agile)).toBe(10 * HOUR)
    expect(seconds('1,5 wd', agile)).toBe(12 * HOUR)
  })

  it('uses overridden lengths for day and week', () => {
    expect(seconds('1d', workingTime)).toBe(8 * HOUR)
    expect(seconds('1w 2d', workingTime)).toBe(56 * HOUR)
    expect(seconds('3 Tage', workingTime)).toBe(24 * HOUR)
  })

  it('adds aliases to overridden units', () => {
    expect(seconds('2 pt', { day: { seconds: 8 * HOUR, aliases: ['pt'] } })).toBe(16 * HOUR)
  })

  it('keeps ISO 8601 and clock input at their standard lengths', () => {
    expect(seconds('P1D', workingTime)).toBe(DAY)
    expect(seconds('P1W', workingTime)).toBe(7 * DAY)
    expect(seconds('26:00', workingTime)).toBe(26 * HOUR)
  })

  it('gives a trailing number the next smaller built-in unit', () => {
    expect(seconds('1h30', agile)).toBe(90 * 60)
    expect(seconds('1 workday 3', agile)).toBe(11 * HOUR)
    expect(seconds('1 pomodoro 5', agile)).toBe(30 * 60)
    expect(seconds('1 sprint 2', agile)).toBe(28 * DAY)
    expect(seconds('1d 2', workingTime)).toBe(10 * HOUR)
    expect(seconds('1w 2', workingTime)).toBe(56 * HOUR)
  })

  it('leaves out units shorter than the precision', () => {
    const customUnits = { tick: 10 }
    expect(parseDuration('3 tick', { customUnits })).toMatchObject({ ok: false, error: 'unknown_unit' })
    expect(seconds('3 tick', customUnits, { precision: 'second' })).toBe(30)
    expect(seconds('1 tick 5', customUnits, { precision: 'second' })).toBe(15)
  })

  it('uses custom units as defaultUnit', () => {
    expect(seconds('3', agile, { defaultUnit: 'pomodoro' })).toBe(75 * 60)
    expect(seconds('1', workingTime, { defaultUnit: 'day' })).toBe(8 * HOUR)
  })

  it('suggests custom unit names for typos', () => {
    expect(parseDuration('2 sprnits', { customUnits: agile })).toMatchObject({ error: 'unknown_unit', suggestion: 'sprints' })
  })

  it('lets custom names take over names of the locales', () => {
    expect(seconds('2 s', { sprint: { seconds: 14 * DAY, aliases: ['s'] } }, { precision: 'second' })).toBe(28 * DAY)
  })

  it('accepts aliases and labels that locales give custom units', () => {
    const deAgile = defineLocale({
      ...de,
      aliases: { ...de.aliases, workday: ['arbeitstage'] },
      labels: {
        short: { ...de.labels!.short, workday: 'AT' },
        long: { ...de.labels!.long, workday: ['Arbeitstag', 'Arbeitstage'] },
      },
    })
    const options = { locales: [deAgile], customUnits: agile }
    expect(parseDuration('2 Arbeitstage', options)).toMatchObject({ seconds: 16 * HOUR })
    expect(parseDuration('1 Arbeitstag', options)).toMatchObject({ seconds: 8 * HOUR })
    expect(parseDuration('2AT', options)).toMatchObject({ seconds: 16 * HOUR })
    // Names from `customUnits` work in every locale.
    expect(parseDuration('2 workdays', options)).toMatchObject({ seconds: 16 * HOUR })
  })
})

describe('customUnits: formatting', () => {
  it('formats custom units with their labels, or their name', () => {
    const units = ['sprint', 'day', 'hour']
    expect(formatDuration(31 * DAY, { units, customUnits: agile })).toBe('2sp 3d')
    expect(formatDuration(15 * DAY, { units, customUnits: agile, style: 'long' })).toBe('1 sprint 1 day')
    expect(formatDuration(28 * DAY, { units, customUnits: agile, style: 'long' })).toBe('2 sprints')
    // No short label: written like the long form. No long label: the name.
    expect(formatDuration(50 * 60, { units: ['pomodoro'], customUnits: agile })).toBe('2 pomodoro')
    expect(formatDuration(8 * HOUR, { units: ['workday'], customUnits: agile, style: 'long' })).toBe('1 workday')
  })

  it('formats overridden units with the locale labels', () => {
    const units = ['week', 'day', 'hour']
    expect(formatDuration(56 * HOUR, { units, customUnits: workingTime })).toBe('1w 2d')
    expect(formatDuration(10 * HOUR, { units, customUnits: workingTime, style: 'long', locale: de })).toBe('1 Tag 2 Stunden')
    expect(formatDuration(10 * HOUR, { customUnits: workingTime })).toBe('1d 2h')
  })

  it('sorts display units by length and drops duplicates', () => {
    expect(formatDuration(8 * HOUR + 1500, { units: ['pomodoro', 'workday', 'pomodoro'], customUnits: agile })).toBe(
      '1 workday 1 pomodoro',
    )
  })

  it.each([
    [28800, '1 workday'],
    [57600, '2 workday'],
    [34200, '1 workday 1 block'],
    [28800 + 2700, '1 workday 0.5 block'],
  ])('carries correctly between lengths that are not multiples: %is -> %j', (value, expected) => {
    const customUnits = { workday: 8 * HOUR, block: 90 * 60 }
    expect(formatDuration(value, { units: ['workday', 'block'], customUnits })).toBe(expected)
  })

  it('carries a rounded remainder into the larger unit', () => {
    expect(formatDuration(7200, { units: ['hour', 'x'], customUnits: { x: 7 * 60 } })).toBe('2h')
    expect(formatDuration(DAY - 1, { units: ['day', 'hour'] })).toBe('1d')
    expect(formatDuration(7 * DAY - 1, { units: ['week', 'day', 'hour'] })).toBe('1w')
    expect(formatDuration(8 * HOUR - 1, { units: ['day', 'hour'], customUnits: workingTime })).toBe('1d')
  })

  it('round-trips through parseDuration', () => {
    const customUnits = { ...agile, block: 90 * 60 }
    const units = ['sprint', 'workday', 'block', 'pomodoro', 'hour', 'minute']
    for (const style of ['short', 'long'] as const) {
      for (const value of [60, 1500, 5400, 8 * HOUR + 1560, 14 * DAY + 9 * HOUR, 30 * DAY + 60]) {
        const text = formatDuration(value, { units, customUnits, style })
        expect(parseDuration(text, { customUnits }), text).toMatchObject({ ok: true, seconds: value })
      }
    }
  })

  it('formats built-in parts with Intl and custom parts with labels for locales without labels', () => {
    const fr = defineLocale({ ...en, code: 'fr', labels: undefined })
    const original = (Intl as any).DurationFormat
    // Only its presence matters: parts with custom units never go through Intl.DurationFormat.
    ;(Intl as any).DurationFormat = class {
      format(): string {
        throw new Error('custom units must not reach Intl.DurationFormat')
      }
    }
    try {
      const hours = new Intl.NumberFormat('fr', { style: 'unit', unit: 'hour', unitDisplay: 'long' }).format(2)
      const expected = new Intl.ListFormat('fr', { type: 'unit', style: 'long' }).format(['1 workday', hours])
      expect(formatDuration(10 * HOUR, { locale: fr, style: 'long', units: ['workday', 'hour'], customUnits: agile })).toBe(expected)
    } finally {
      ;(Intl as any).DurationFormat = original
    }
  })

  it('falls back to labels for custom units without Intl.DurationFormat', () => {
    const fr = defineLocale({ ...en, code: 'fr', labels: undefined })
    const original = (Intl as any).DurationFormat
    ;(Intl as any).DurationFormat = undefined
    try {
      expect(formatDuration(10 * HOUR, { locale: fr, units: ['workday', 'hour'], customUnits: agile })).toBe('1 workday 2h')
    } finally {
      ;(Intl as any).DurationFormat = original
    }
  })

  it('formats error message bounds with custom units', () => {
    const message = formatErrorMessage('out_of_range', { max: 24 * HOUR, units: ['day'], customUnits: workingTime })
    expect(message).toBe('Must be at most 3d.')
  })
})

import { describe, expect, it } from 'vitest'
import {
  ar,
  de,
  en,
  es,
  formatDuration,
  formatErrorMessage,
  fr,
  hi,
  parseDuration,
  pt,
  zh,
  type DurationLocale,
  type FormatStyle,
  type Precision,
} from '../src/core'
import { longForms } from '../src/core/locale'

const LOCALES: DurationLocale[] = [en, de, es, fr, pt, hi, ar, zh]
const byCode = (locale: DurationLocale) => [locale.code, locale] as const

describe('built-in locales', () => {
  it.each(LOCALES.map(byCode))('%s: formatted text parses back', (_, locale) => {
    const cases: [Precision, string[]][] = [
      ['minute', ['week', 'day', 'hour', 'minute']],
      ['second', ['day', 'hour', 'minute', 'second']],
    ]
    for (const [precision, units] of cases) {
      const step = precision === 'minute' ? 60 : 1
      for (const style of ['short', 'long'] as FormatStyle[]) {
        for (let seconds = 0; seconds < 2 * 604800; seconds += 997 * step) {
          const text = formatDuration(seconds, { locale, style, units })
          expect(parseDuration(text, { locales: [locale], precision }), text).toMatchObject({ ok: true, seconds })
        }
      }
    }
  })

  it.each(LOCALES.map(byCode))('%s: no name stands for two units', (_, locale) => {
    const owners = new Map<string, string>()
    const names = Object.entries(locale.aliases).flatMap(([unit, aliases]) => (aliases ?? []).map((name) => [name, unit]))
    for (const [unit, short] of Object.entries(locale.labels?.short ?? {})) names.push([short!, unit])
    for (const [unit, long] of Object.entries(locale.labels?.long ?? {})) {
      for (const name of longForms(long)) names.push([name!, unit])
    }
    for (const [name, unit] of names) {
      const key = name.normalize('NFC').toLowerCase()
      expect(owners.get(key) ?? unit, `"${name}"`).toBe(unit)
      owners.set(key, unit)
    }
  })

  it.each(LOCALES.map(byCode))('%s: messages use the same placeholders as English', (_, locale) => {
    const placeholders = (text: string) => [...new Set(text.match(/\{\w+\}/g))].sort()
    for (const [key, text] of Object.entries(en.messages)) {
      expect(placeholders(locale.messages[key as keyof typeof en.messages]), key).toEqual(placeholders(text))
    }
  })

  it.each<[string, DurationLocale, number]>([
    ['2 horas y 30 minutos', es, 150],
    ['1 día 2 hrs', es, 1560],
    ['1 j 2 h', fr, 1560],
    ['2 heures et 15 min', fr, 135],
    ['3 dias e 2h', pt, 4440],
    ['1 semana', pt, 10080],
    ['2 घंटे 30 मिनट', hi, 150],
    ['1 हफ़्ता और 1 दिन', hi, 11520],
    ['1小时30分钟', zh, 90],
    ['1个小时', zh, 60],
    ['1小时零5分钟', zh, 65],
    ['2天又3小时', zh, 3060],
    ['1小時30分鐘', zh, 90],
    ['2 ساعة و 30 دقيقة', ar, 150],
    ['2 ساعة و30 دقيقة', ar, 150],
    ['3 ساعات', ar, 180],
    ['11 يومًا', ar, 15840],
    ['1 اسبوع', ar, 10080],
  ])('parses %s', (input, locale, minutes) => {
    expect(parseDuration(input, { locales: [locale] })).toMatchObject({ ok: true, minutes })
  })

  it('writes Arabic long labels in all plural forms', () => {
    const hours = (value: number) => formatDuration(value * 3600, { locale: ar, style: 'long', units: ['hour'] })
    expect([0, 1, 2, 5, 11, 100].map(hours)).toEqual(['0 ساعة', '1 ساعة', '2 ساعتان', '5 ساعات', '11 ساعة', '100 ساعة'])
    expect(formatDuration(5 * 86400, { locale: ar, style: 'long' })).toBe('5 أيام')
    expect(formatDuration(11 * 86400, { locale: ar, style: 'long' })).toBe('11 يومًا')
  })

  it('formats with localized labels', () => {
    expect(formatDuration(95400, { locale: es, style: 'long' })).toBe('1 día 2 horas 30 minutos')
    expect(formatDuration(95400, { locale: fr })).toBe('1j 2h 30min')
    expect(formatDuration(95400, { locale: hi, style: 'long' })).toBe('1 दिन 2 घंटे 30 मिनट')
    expect(formatDuration(95400, { locale: zh })).toBe('1天 2小时 30分钟')
    expect(formatDuration(95400, { locale: ar })).toBe('1ي 2س 30د')
  })

  it('writes localized error messages', () => {
    expect(formatErrorMessage('out_of_range', { locale: ar, min: 1800, max: 28800 })).toBe('يجب أن تكون المدة بين 30د و8س.')
    expect(formatErrorMessage(parseDuration('2 foo', { locales: [zh] }) as never, { locale: zh })).toBe(
      '未知单位“foo”。请使用分钟、小时、天或周。',
    )
    expect(formatErrorMessage(parseDuration('2 heurs', { locales: [fr] }) as never, { locale: fr })).toBe(
      'Unité inconnue « heurs ». Vouliez-vous dire « heure » ?',
    )
  })
})

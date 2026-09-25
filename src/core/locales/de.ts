import { defineLocale } from '../locale'

/** German unit names (`Std`, `Stunden`, `Tage`, ...), separator `und`, labels and messages. */
export const de = defineLocale({
  code: 'de',
  aliases: {
    second: ['s', 'sek', 'sekunde', 'sekunden'],
    minute: ['m', 'min', 'minute', 'minuten'],
    hour: ['h', 'std', 'stunde', 'stunden'],
    day: ['d', 't', 'tag', 'tage', 'tagen'],
    week: ['w', 'wo', 'woche', 'wochen'],
  },
  separators: ['und'],
  labels: {
    short: { week: 'w', day: 'd', hour: 'h', minute: 'min', second: 's' },
    long: {
      week: ['Woche', 'Wochen'],
      day: ['Tag', 'Tage'],
      hour: ['Stunde', 'Stunden'],
      minute: ['Minute', 'Minuten'],
      second: ['Sekunde', 'Sekunden'],
    },
  },
  messages: {
    empty: 'Bitte gib eine Dauer ein.',
    invalid_format: 'Gib eine Dauer wie „1h 30m“ oder „1:30“ ein.',
    unknown_unit: 'Unbekannte Einheit „{token}“. Erlaubt sind Minuten, Stunden, Tage oder Wochen.',
    unknown_unit_suggestion: 'Unbekannte Einheit „{token}“. Meintest du „{suggestion}“?',
    missing_unit: 'Gib eine Einheit an, z. B. „45min“ oder „2h“.',
    out_of_range: 'Muss zwischen {min} und {max} liegen.',
    out_of_range_min: 'Muss mindestens {min} sein.',
    out_of_range_max: 'Darf höchstens {max} sein.',
  },
})

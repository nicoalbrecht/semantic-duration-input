import { defineLocale } from '../locale'

/** French unit names (`h`, `heures`, `jours`, ...), separator `et`, labels and messages. */
export const fr = defineLocale({
  code: 'fr',
  aliases: {
    second: ['s', 'sec', 'secs', 'seconde', 'secondes'],
    minute: ['m', 'mn', 'min', 'mins', 'minute', 'minutes'],
    hour: ['h', 'heure', 'heures'],
    day: ['d', 'j', 'jour', 'jours'],
    week: ['w', 'sem', 'semaine', 'semaines'],
  },
  separators: ['et'],
  labels: {
    short: { week: 'sem', day: 'j', hour: 'h', minute: 'min', second: 's' },
    long: {
      week: ['semaine', 'semaines'],
      day: ['jour', 'jours'],
      hour: ['heure', 'heures'],
      minute: ['minute', 'minutes'],
      second: ['seconde', 'secondes'],
    },
  },
  // Guillemets and the question mark take a no-break space (U+00A0).
  messages: {
    empty: 'Saisissez une durée.',
    invalid_format: 'Saisissez une durée comme « 1h 30m » ou « 1:30 ».',
    unknown_unit: 'Unité inconnue « {token} ». Utilisez minutes, heures, jours ou semaines.',
    unknown_unit_suggestion: 'Unité inconnue « {token} ». Vouliez-vous dire « {suggestion} » ?',
    missing_unit: 'Ajoutez une unité, par ex. « 45min » ou « 2h ».',
    out_of_range: 'La durée doit être comprise entre {min} et {max}.',
    out_of_range_min: 'La durée doit être d’au moins {min}.',
    out_of_range_max: 'La durée ne doit pas dépasser {max}.',
  },
})

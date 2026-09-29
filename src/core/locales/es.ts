import { defineLocale } from '../locale'

/** Spanish unit names (`h`, `horas`, `días`, ...), separator `y`, labels and messages. */
export const es = defineLocale({
  code: 'es',
  aliases: {
    second: ['s', 'seg', 'segs', 'segundo', 'segundos'],
    minute: ['m', 'min', 'mins', 'minuto', 'minutos'],
    hour: ['h', 'hr', 'hrs', 'hora', 'horas'],
    day: ['d', 'día', 'días', 'dia', 'dias'],
    week: ['w', 'sem', 'semana', 'semanas'],
  },
  separators: ['y'],
  labels: {
    short: { week: 'sem', day: 'd', hour: 'h', minute: 'min', second: 's' },
    long: {
      week: ['semana', 'semanas'],
      day: ['día', 'días'],
      hour: ['hora', 'horas'],
      minute: ['minuto', 'minutos'],
      second: ['segundo', 'segundos'],
    },
  },
  messages: {
    empty: 'Escribe una duración.',
    invalid_format: 'Escribe una duración como «1h 30m» o «1:30».',
    unknown_unit: 'Unidad desconocida «{token}». Usa minutos, horas, días o semanas.',
    unknown_unit_suggestion: 'Unidad desconocida «{token}». ¿Quisiste decir «{suggestion}»?',
    missing_unit: 'Indica una unidad, p. ej. «45min» o «2h».',
    out_of_range: 'Debe estar entre {min} y {max}.',
    out_of_range_min: 'Debe ser de al menos {min}.',
    out_of_range_max: 'Debe ser de como máximo {max}.',
  },
})

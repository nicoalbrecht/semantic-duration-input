import { defineLocale } from '../locale'

/** Portuguese unit names (`h`, `horas`, `dias`, ...), separator `e`, labels and messages (Brazilian wording). */
export const pt = defineLocale({
  code: 'pt',
  aliases: {
    second: ['s', 'seg', 'segs', 'segundo', 'segundos'],
    minute: ['m', 'min', 'mins', 'minuto', 'minutos'],
    hour: ['h', 'hr', 'hrs', 'hora', 'horas'],
    day: ['d', 'dia', 'dias'],
    week: ['w', 'sem', 'semana', 'semanas'],
  },
  separators: ['e'],
  labels: {
    short: { week: 'sem', day: 'd', hour: 'h', minute: 'min', second: 's' },
    long: {
      week: ['semana', 'semanas'],
      day: ['dia', 'dias'],
      hour: ['hora', 'horas'],
      minute: ['minuto', 'minutos'],
      second: ['segundo', 'segundos'],
    },
  },
  messages: {
    empty: 'Informe uma duração.',
    invalid_format: 'Informe uma duração como “1h 30m” ou “1:30”.',
    unknown_unit: 'Unidade desconhecida “{token}”. Use minutos, horas, dias ou semanas.',
    unknown_unit_suggestion: 'Unidade desconhecida “{token}”. Você quis dizer “{suggestion}”?',
    missing_unit: 'Informe uma unidade, por ex. “45min” ou “2h”.',
    out_of_range: 'Deve estar entre {min} e {max}.',
    out_of_range_min: 'Deve ser de pelo menos {min}.',
    out_of_range_max: 'Deve ser de no máximo {max}.',
  },
})

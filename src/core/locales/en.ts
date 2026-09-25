import { defineLocale } from '../locale'

export const en = defineLocale({
  code: 'en',
  aliases: {
    second: ['s', 'sec', 'secs', 'second', 'seconds'],
    minute: ['m', 'min', 'mins', 'minute', 'minutes'],
    hour: ['h', 'hr', 'hrs', 'hour', 'hours'],
    day: ['d', 'day', 'days'],
    week: ['w', 'wk', 'wks', 'week', 'weeks'],
  },
  separators: ['and'],
  labels: {
    short: { week: 'w', day: 'd', hour: 'h', minute: 'min', second: 's' },
    long: {
      week: ['week', 'weeks'],
      day: ['day', 'days'],
      hour: ['hour', 'hours'],
      minute: ['minute', 'minutes'],
      second: ['second', 'seconds'],
    },
  },
  messages: {
    empty: 'Please enter a duration.',
    invalid_format: 'Enter a duration like "1h 30m" or "1:30".',
    unknown_unit: 'Unknown unit "{token}". Use minutes, hours, days or weeks.',
    unknown_unit_suggestion: 'Unknown unit "{token}". Did you mean "{suggestion}"?',
    missing_unit: 'Add a unit, e.g. "45min" or "2h".',
    out_of_range: 'Must be between {min} and {max}.',
    out_of_range_min: 'Must be at least {min}.',
    out_of_range_max: 'Must be at most {max}.',
  },
})

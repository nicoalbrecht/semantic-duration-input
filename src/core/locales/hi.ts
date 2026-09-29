import { defineLocale } from '../locale'

/** Hindi unit names (`घंटे`, `मिनट`, `दिन`, ...), separators `और` and `व`, labels and messages. */
export const hi = defineLocale({
  code: 'hi',
  aliases: {
    second: ['s', 'से', 'सेकंड', 'सेकेंड', 'सेकण्ड'],
    minute: ['m', 'min', 'मि', 'मिनट', 'मिनिट'],
    hour: ['h', 'घं', 'घंटा', 'घंटे', 'घण्टा', 'घण्टे'],
    day: ['d', 'दि', 'दिन'],
    week: ['w', 'सप्ताह', 'हफ़्ता', 'हफ़्ते', 'हफ्ता', 'हफ्ते'],
  },
  separators: ['और', 'व'],
  labels: {
    short: { week: 'सप्ताह', day: 'दि', hour: 'घं', minute: 'मि', second: 'से' },
    long: {
      week: ['सप्ताह', 'सप्ताह'],
      day: ['दिन', 'दिन'],
      hour: ['घंटा', 'घंटे'],
      minute: ['मिनट', 'मिनट'],
      second: ['सेकंड', 'सेकंड'],
    },
  },
  messages: {
    empty: 'कृपया अवधि दर्ज करें।',
    invalid_format: '“1 घंटा 30 मिनट” या “1:30” जैसी अवधि दर्ज करें।',
    unknown_unit: 'अज्ञात इकाई “{token}”। मिनट, घंटे, दिन या सप्ताह का उपयोग करें।',
    unknown_unit_suggestion: 'अज्ञात इकाई “{token}”। क्या आपका मतलब “{suggestion}” था?',
    missing_unit: 'इकाई जोड़ें, जैसे “45 मिनट” या “2 घंटे”।',
    out_of_range: 'अवधि {min} और {max} के बीच होनी चाहिए।',
    out_of_range_min: 'अवधि कम से कम {min} होनी चाहिए।',
    out_of_range_max: 'अवधि अधिकतम {max} हो सकती है।',
  },
})

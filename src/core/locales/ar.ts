import { defineLocale } from '../locale'

/**
 * Arabic unit names (`ساعة`, `دقائق`, `أيام`, ...), separator `و`, labels and messages. Long labels use all six
 * plural forms: 1 ساعة, 2 ساعتان, 5 ساعات, 11 ساعة. Common spellings without hamza or with `ه` for `ة` are accepted.
 */
export const ar = defineLocale({
  code: 'ar',
  aliases: {
    second: ['s', 'ث', 'ثانية', 'ثانيه', 'ثانيتان', 'ثانيتين', 'ثوان', 'ثوانٍ', 'ثواني'],
    minute: ['m', 'min', 'د', 'دقيقة', 'دقيقه', 'دقيقتان', 'دقيقتين', 'دقائق'],
    hour: ['h', 'س', 'ساعة', 'ساعه', 'ساعتان', 'ساعتين', 'ساعات'],
    day: ['d', 'ي', 'يوم', 'يومان', 'يومين', 'أيام', 'ايام', 'يومًا', 'يوما'],
    week: ['w', 'أ', 'أسبوع', 'اسبوع', 'أسبوعان', 'اسبوعان', 'أسبوعين', 'اسبوعين', 'أسابيع', 'اسابيع', 'أسبوعًا', 'أسبوعا', 'اسبوعا'],
  },
  separators: ['و'],
  labels: {
    short: { week: 'أ', day: 'ي', hour: 'س', minute: 'د', second: 'ث' },
    // CLDR forms. Unlike CLDR, the number is always written, also for one and two.
    long: {
      week: { zero: 'أسبوع', one: 'أسبوع', two: 'أسبوعان', few: 'أسابيع', many: 'أسبوعًا', other: 'أسبوع' },
      day: { zero: 'يوم', one: 'يوم', two: 'يومان', few: 'أيام', many: 'يومًا', other: 'يوم' },
      hour: { zero: 'ساعة', one: 'ساعة', two: 'ساعتان', few: 'ساعات', many: 'ساعة', other: 'ساعة' },
      minute: { zero: 'دقيقة', one: 'دقيقة', two: 'دقيقتان', few: 'دقائق', many: 'دقيقة', other: 'دقيقة' },
      second: { zero: 'ثانية', one: 'ثانية', two: 'ثانيتان', few: 'ثوان', many: 'ثانية', other: 'ثانية' },
    },
  },
  messages: {
    empty: 'يُرجى إدخال مدة.',
    invalid_format: 'أدخل مدة مثل «1 ساعة 30 دقيقة» أو «1:30».',
    unknown_unit: 'وحدة غير معروفة «{token}». استخدم الدقائق أو الساعات أو الأيام أو الأسابيع.',
    unknown_unit_suggestion: 'وحدة غير معروفة «{token}». هل تقصد «{suggestion}»؟',
    missing_unit: 'أضف وحدة، مثل «45 دقيقة» أو «3 ساعات».',
    out_of_range: 'يجب أن تكون المدة بين {min} و{max}.',
    out_of_range_min: 'يجب ألا تقل المدة عن {min}.',
    out_of_range_max: 'يجب ألا تزيد المدة عن {max}.',
  },
})

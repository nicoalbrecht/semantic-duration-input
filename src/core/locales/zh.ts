import { defineLocale } from '../locale'

/**
 * Mandarin Chinese unit names (`小时`, `分钟`, `天`, ...), separators `和`, `又` and `零`, labels and messages.
 * Labels and messages are Simplified; Traditional unit names (`小時`, `分鐘`, `週`) are accepted too.
 */
export const zh = defineLocale({
  code: 'zh',
  aliases: {
    second: ['s', '秒', '秒钟', '秒鐘'],
    minute: ['m', 'min', '分', '分钟', '分鐘'],
    hour: ['h', '时', '小时', '个小时', '钟头', '个钟头', '時', '小時', '個小時', '鐘頭', '個鐘頭'],
    day: ['d', '天', '日'],
    week: ['w', '周', '星期', '个星期', '礼拜', '个礼拜', '週', '個星期', '禮拜', '個禮拜'],
  },
  separators: ['和', '又', '零'],
  labels: {
    short: { week: '周', day: '天', hour: '小时', minute: '分钟', second: '秒' },
    long: {
      week: ['周', '周'],
      day: ['天', '天'],
      hour: ['小时', '小时'],
      minute: ['分钟', '分钟'],
      second: ['秒', '秒'],
    },
  },
  messages: {
    empty: '请输入时长。',
    invalid_format: '请输入类似“1小时30分钟”或“1:30”的时长。',
    unknown_unit: '未知单位“{token}”。请使用分钟、小时、天或周。',
    unknown_unit_suggestion: '未知单位“{token}”。你是想输入“{suggestion}”吗？',
    missing_unit: '请添加单位，例如“45分钟”或“2小时”。',
    out_of_range: '时长必须在 {min} 到 {max} 之间。',
    out_of_range_min: '时长不能少于 {min}。',
    out_of_range_max: '时长不能超过 {max}。',
  },
})

import { UNIT_SECONDS } from './units'

const NUM = '(\\d+(?:[.,]\\d+)?)'
// Weeks and days before `T`, then hours, minutes and seconds. Years and months are not supported.
const ISO_RE = new RegExp(`^P(?:${NUM}W)?(?:${NUM}D)?(?:T(?:${NUM}H)?(?:${NUM}M)?(?:${NUM}S)?)?$`, 'i')
const ISO_FIELDS = [UNIT_SECONDS.week, UNIT_SECONDS.day, UNIT_SECONDS.hour, UNIT_SECONDS.minute, UNIT_SECONDS.second]

/** Seconds of an ISO 8601 duration like `PT1H30M` or `P2W`, or `null` if the text isn't one. */
export function fromIso(text: string): number | null {
  const trimmed = text.trim()
  const match = ISO_RE.exec(trimmed)
  // Reject "P", "PT" and a trailing "T" without any field.
  if (!match || match.slice(1).every((field) => field === undefined) || /T$/i.test(trimmed)) return null
  return ISO_FIELDS.reduce((sum, size, i) => sum + (match[i + 1] ? Number(match[i + 1].replace(',', '.')) * size : 0), 0)
}

/** ISO 8601 duration in `PnDTnHnMnS` form (no weeks, for the widest interoperability). */
export function toIso(seconds: number): string {
  let remaining = Math.round(Math.abs(seconds))
  const take = (size: number) => {
    const value = Math.floor(remaining / size)
    remaining -= value * size
    return value
  }
  const [d, h, m, s] = [take(UNIT_SECONDS.day), take(UNIT_SECONDS.hour), take(UNIT_SECONDS.minute), take(1)]
  const time = `${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s ? `${s}S` : ''}`
  if (!d && !time) return 'PT0S'
  return `P${d ? `${d}D` : ''}${time ? `T${time}` : ''}`
}

const VN_TZ = 'Asia/Ho_Chi_Minh'

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: VN_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Calendar day in Vietnam as YYYY-MM-DD. */
export function dailyKey(now: Date = new Date()): string {
  return fmt.format(now)
}

/** ISO week key (YYYY-Www) of the Vietnamese calendar day. */
export function weekKey(now: Date = new Date()): string {
  const [y, m, d] = dailyKey(now).split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export type PeriodKeys = { alltime: 'alltime'; weekly: `w:${string}`; daily: `d:${string}` }

export function periodKeys(now: Date = new Date()): PeriodKeys {
  return { alltime: 'alltime', weekly: `w:${weekKey(now)}`, daily: `d:${dailyKey(now)}` }
}

/** Next 00:00 Vietnam time after `now`. */
export function nextResetAt(now: Date = new Date()): Date {
  const [y, m, d] = dailyKey(now).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + 1) - 7 * 3_600_000)
}

/**
 * Ngày Tết Trung Thu (15/8 âm lịch) theo dương lịch, giờ Việt Nam.
 * Nguồn: lịch âm Việt Nam. Bảng cần cập nhật khi tới gần 2031.
 */
export const MID_AUTUMN_DATES: Readonly<Record<number, string>> = {
  2025: '2025-10-06',
  2026: '2026-09-25',
  2027: '2027-09-15',
  2028: '2028-10-03',
  2029: '2029-09-22',
  2030: '2030-09-12',
}

const VN_OFFSET_MS = 7 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/** 00:00 giờ Việt Nam của ngày yyyy-mm-dd, trả về Date (UTC instant). */
export function vnMidnight(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d) - VN_OFFSET_MS)
}

export interface MidAutumnInfo {
  year: number
  start: Date
  end: Date
  isTonight: boolean
}

/**
 * Trả về Trung Thu sắp tới (hoặc đang diễn ra hôm nay).
 * Nếu vượt ngoài bảng thì trả về null.
 */
export function getNextMidAutumn(now: Date = new Date()): MidAutumnInfo | null {
  const years = Object.keys(MID_AUTUMN_DATES)
    .map(Number)
    .sort((a, b) => a - b)
  const t = now.getTime()
  for (const year of years) {
    const start = vnMidnight(MID_AUTUMN_DATES[year])
    const end = new Date(start.getTime() + DAY_MS)
    if (t < end.getTime()) {
      return { year, start, end, isTonight: t >= start.getTime() }
    }
  }
  return null
}

export function isMidAutumnNight(now: Date = new Date()): boolean {
  return getNextMidAutumn(now)?.isTonight ?? false
}

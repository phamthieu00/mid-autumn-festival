import type { LocalizedText } from '@/i18n'
import type { GeneratedCategory, QuizDifficulty, QuizQuestion } from '../../types'

export const lt = (vi: string, en: string): LocalizedText => ({ vi, en })

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const WEEKDAYS: LocalizedText[] = [
  lt('Chủ Nhật', 'Sunday'),
  lt('Thứ Hai', 'Monday'),
  lt('Thứ Ba', 'Tuesday'),
  lt('Thứ Tư', 'Wednesday'),
  lt('Thứ Năm', 'Thursday'),
  lt('Thứ Sáu', 'Friday'),
  lt('Thứ Bảy', 'Saturday'),
]

export function parseIso(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

export function ordinalEn(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

export const fmtDate = (iso: string): LocalizedText => {
  const { y, m, d } = parseIso(iso)
  return lt(`${d}/${m}/${y}`, `${d} ${EN_MONTHS[m - 1].slice(0, 3)} ${y}`)
}

export const fmtDayMonth = (iso: string): LocalizedText => {
  const { y, m, d } = parseIso(iso)
  void y
  return lt(`${d} tháng ${m}`, `${d} ${EN_MONTHS[m - 1]}`)
}

export const weekdayOf = (iso: string): LocalizedText =>
  WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()]

export const DAY_MS = 86_400_000
export const isoMs = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

export function shiftIso(iso: string, days: number): string {
  return new Date(isoMs(iso) + days * DAY_MS).toISOString().slice(0, 10)
}

export const lunarDate = (d: number, m: number): LocalizedText =>
  lt(`${d}/${m} âm lịch`, `${ordinalEn(d)} day of the ${ordinalEn(m)} lunar month`)

export function gq(
  category: GeneratedCategory,
  id: string,
  difficulty: QuizDifficulty,
  question: LocalizedText,
  options: LocalizedText[],
  correctIndex: number,
  explanation: LocalizedText,
): QuizQuestion {
  return {
    id: `g:${id}`,
    category,
    difficulty,
    source: 'generated',
    question,
    options,
    correctIndex,
    explanation,
  }
}

/** All k-combinations of indexes 0..n-1 in lexicographic order. */
export function combinations(n: number, k: number): number[][] {
  const out: number[][] = []
  const cur: number[] = []
  const rec = (start: number) => {
    if (cur.length === k) {
      out.push(cur.slice())
      return
    }
    for (let i = start; i < n; i++) {
      cur.push(i)
      rec(i + 1)
      cur.pop()
    }
  }
  rec(0)
  return out
}

/** Place `correct` at a deterministic position among distractors (rotates by seed). */
export function placeCorrect<T>(
  correct: T,
  distractors: T[],
  seed: number,
): { options: T[]; index: number } {
  const index = seed % 4
  const options = distractors.slice(0, 3)
  options.splice(index, 0, correct)
  return { options, index }
}

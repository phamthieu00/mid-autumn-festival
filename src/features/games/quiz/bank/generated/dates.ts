import { MID_AUTUMN_DATES } from '@/lib/midAutumnDates'
import type { QuizQuestion } from '../../types'
import {
  combinations,
  DAY_MS,
  fmtDate,
  fmtDayMonth,
  gq,
  isoMs,
  lt,
  placeCorrect,
  shiftIso,
  WEEKDAYS,
  weekdayOf,
} from './templates'

const YEARS = Object.keys(MID_AUTUMN_DATES)
  .map(Number)
  .sort((a, b) => a - b)

export function generateDateQuestions(): QuizQuestion[] {
  const out: QuizQuestion[] = []

  YEARS.forEach((year, yi) => {
    const iso = MID_AUTUMN_DATES[year]
    const date = fmtDate(iso)

    // forward: which Gregorian date
    const shifts = [-14, -7, 7, 14].filter((_, i) => i !== yi % 4)
    const fwd = placeCorrect(
      date,
      shifts.map((s) => fmtDate(shiftIso(iso, s))),
      yi,
    )
    out.push(
      gq(
        'gen-dates',
        `date:fwd:${year}`,
        2,
        lt(
          `Tết Trung Thu năm ${year} rơi vào ngày dương lịch nào?`,
          `On which Gregorian date does the Mid-Autumn Festival fall in ${year}?`,
        ),
        fwd.options,
        fwd.index,
        lt(
          `Rằm tháng Tám năm ${year} nhằm ngày ${date.vi}. Vì lịch âm lệch dần so với lịch dương nên mỗi năm Trung Thu rơi vào một ngày khác.`,
          `The 15th day of the 8th lunar month in ${year} falls on ${date.en}. Because the lunar calendar drifts against the Gregorian one, the date shifts every year.`,
        ),
      ),
    )

    // reverse: which year
    const others = [1, 2, 3].map((k) => YEARS[(yi + k) % YEARS.length])
    const rev = placeCorrect(
      lt(`${year}`, `${year}`),
      others.map((y) => lt(`${y}`, `${y}`)),
      yi + 1,
    )
    const dm = fmtDayMonth(iso)
    out.push(
      gq(
        'gen-dates',
        `date:rev:${year}`,
        2,
        lt(
          `Năm nào Tết Trung Thu rơi vào ngày ${dm.vi} dương lịch?`,
          `In which year does the Mid-Autumn Festival fall on ${dm.en}?`,
        ),
        rev.options,
        rev.index,
        lt(
          `Ngày ${dm.vi} là Trung Thu của năm ${year}. Các năm khác: ${others.map((y) => `${y} (${fmtDate(MID_AUTUMN_DATES[y]).vi})`).join(', ')}.`,
          `${dm.en} is Mid-Autumn in ${year}. Other years: ${others.map((y) => `${y} (${fmtDate(MID_AUTUMN_DATES[y]).en})`).join(', ')}.`,
        ),
      ),
    )

    // weekday
    const wd = weekdayOf(iso)
    const wdIdx = WEEKDAYS.indexOf(wd)
    const wrongDays = [2, 4, 6].map((k) => WEEKDAYS[(wdIdx + k) % 7])
    const wq = placeCorrect(wd, wrongDays, yi + 2)
    out.push(
      gq(
        'gen-dates',
        `date:wday:${year}`,
        2,
        lt(
          `Tết Trung Thu năm ${year} (${date.vi}) rơi vào thứ mấy?`,
          `What day of the week is the Mid-Autumn Festival in ${year} (${date.en})?`,
        ),
        wq.options,
        wq.index,
        lt(`Ngày ${date.vi} là ${wd.vi}.`, `${date.en} is a ${wd.en}.`),
      ),
    )

    // days from National Day (2 Sep)
    const days = Math.round((isoMs(iso) - isoMs(`${year}-09-02`)) / DAY_MS)
    const dq = placeCorrect(
      lt(`${days} ngày`, `${days} days`),
      [days + 3, days - 4, days + 9].map((n) => lt(`${n} ngày`, `${n} days`)),
      yi + 3,
    )
    out.push(
      gq(
        'gen-dates',
        `date:from-national-day:${year}`,
        3,
        lt(
          `Từ Quốc khánh 2/9/${year} đến Tết Trung Thu (${date.vi}) là bao nhiêu ngày?`,
          `How many days are there from National Day (2 Sep ${year}) to the Mid-Autumn Festival (${date.en})?`,
        ),
        dq.options,
        dq.index,
        lt(
          `Từ 2/9 đến ${date.vi} là ${days} ngày.`,
          `From 2 September to ${date.en} is ${days} days.`,
        ),
      ),
    )
  })

  // earliest / latest among 4 years
  const monthDay = (y: number) => {
    const [, m, d] = MID_AUTUMN_DATES[y].split('-').map(Number)
    return m * 100 + d
  }
  combinations(YEARS.length, 4).forEach((combo, ci) => {
    const ys = combo.map((i) => YEARS[i])
    for (const mode of ['earliest', 'latest'] as const) {
      const sorted = [...ys].sort((a, b) => monthDay(a) - monthDay(b))
      const answer = mode === 'earliest' ? sorted[0] : sorted[sorted.length - 1]
      const options = ys.map((y) => lt(`${y}`, `${y}`))
      const index = ys.indexOf(answer)
      const list = ys.map((y) => `${y}: ${fmtDayMonth(MID_AUTUMN_DATES[y]).vi}`).join(' · ')
      const listEn = ys.map((y) => `${y}: ${fmtDayMonth(MID_AUTUMN_DATES[y]).en}`).join(' · ')
      out.push(
        gq(
          'gen-dates',
          `date:${mode}:${ys.join('-')}`,
          3,
          mode === 'earliest'
            ? lt(
                `Trong các năm sau, năm nào Tết Trung Thu đến sớm nhất theo dương lịch?`,
                `Of these years, in which does the Mid-Autumn Festival fall earliest in the Gregorian calendar?`,
              )
            : lt(
                `Trong các năm sau, năm nào Tết Trung Thu đến muộn nhất theo dương lịch?`,
                `Of these years, in which does the Mid-Autumn Festival fall latest in the Gregorian calendar?`,
              ),
          options,
          index,
          lt(`Ngày Trung Thu từng năm: ${list}.`, `Mid-Autumn dates: ${listEn}.`),
        ),
      )
      void ci
    }
  })

  return out
}

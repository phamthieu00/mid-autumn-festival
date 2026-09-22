import type { QuizQuestion } from '../../types'
import { gq, lt, ordinalEn, placeCorrect } from './templates'

const PHASES = [
  {
    id: 'new',
    day: 1,
    name: lt('Trăng non (sóc)', 'New moon'),
    note: lt(
      'Mùng 1 âm lịch là ngày sóc, Mặt Trăng nằm giữa Trái Đất và Mặt Trời nên không nhìn thấy.',
      'The 1st lunar day is the new moon: the Moon sits between Earth and Sun and cannot be seen.',
    ),
  },
  {
    id: 'first-quarter',
    day: 8,
    name: lt('Trăng thượng huyền', 'First quarter'),
    note: lt(
      'Khoảng mùng 7–8, ta thấy nửa mặt trăng được chiếu sáng, gọi là thượng huyền.',
      'Around the 7th–8th day half the Moon is lit: the first quarter.',
    ),
  },
  {
    id: 'full',
    day: 15,
    name: lt('Trăng tròn (vọng)', 'Full moon'),
    note: lt(
      'Ngày rằm (15) là ngày vọng, Mặt Trăng tròn và sáng nhất.',
      'The 15th day is the full moon, round and brightest.',
    ),
  },
  {
    id: 'last-quarter',
    day: 23,
    name: lt('Trăng hạ huyền', 'Last quarter'),
    note: lt(
      'Khoảng ngày 22–23, trăng chỉ còn một nửa và mọc về nửa đêm: hạ huyền.',
      'Around the 22nd–23rd day the Moon is half lit and rises near midnight: the last quarter.',
    ),
  },
]

export function generateMoonPhaseQuestions(): QuizQuestion[] {
  const out: QuizQuestion[] = []
  PHASES.forEach((p, i) => {
    const others = PHASES.filter((o) => o.id !== p.id)
    const fwd = placeCorrect(
      p.name,
      others.map((o) => o.name),
      i,
    )
    out.push(
      gq(
        'gen-moon',
        `moon:fwd:${p.id}`,
        2,
        lt(
          `Vào khoảng ngày ${p.day} âm lịch, Mặt Trăng ở pha nào?`,
          `Around the ${ordinalEn(p.day)} lunar day, which phase is the Moon in?`,
        ),
        fwd.options,
        fwd.index,
        p.note,
      ),
    )
    const dayLabel = (d: number) => lt(`Khoảng ngày ${d}`, `Around day ${d}`)
    const rev = placeCorrect(
      dayLabel(p.day),
      others.map((o) => dayLabel(o.day)),
      i + 1,
    )
    out.push(
      gq(
        'gen-moon',
        `moon:rev:${p.id}`,
        2,
        lt(
          `${p.name.vi} thường rơi vào khoảng ngày nào trong tháng âm lịch?`,
          `Around which lunar day does the ${p.name.en.toLowerCase()} occur?`,
        ),
        rev.options,
        rev.index,
        p.note,
      ),
    )
  })
  return out
}

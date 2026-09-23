import type { QuizQuestion } from '../../types'
import { LUNAR_FESTIVALS } from './lunarFestivals'
import { gq, lt, lunarDate, ordinalEn, placeCorrect } from './templates'

export function generateLunarQuestions(): QuizQuestion[] {
  const out: QuizQuestion[] = []
  const N = LUNAR_FESTIVALS.length
  LUNAR_FESTIVALS.forEach((fest, i) => {
    const others = [2, 4, 6].map((k) => LUNAR_FESTIVALS[(i + k) % N])
    const explain = lt(
      `${fest.name.vi} là ngày ${fest.day}/${fest.month} âm lịch. ${fest.note.vi}`,
      `${fest.name.en} falls on the ${ordinalEn(fest.day)} day of the ${ordinalEn(fest.month)} lunar month. ${fest.note.en}`,
    )

    const fwd = placeCorrect(
      lunarDate(fest.day, fest.month),
      others.map((o) => lunarDate(o.day, o.month)),
      i,
    )
    out.push(
      gq(
        'gen-lunar',
        `lunar:fwd:${fest.id}`,
        1,
        lt(
          `${fest.name.vi} diễn ra vào ngày nào theo âm lịch?`,
          `On which lunar date is ${fest.name.en} held?`,
        ),
        fwd.options,
        fwd.index,
        explain,
      ),
    )

    const rev = placeCorrect(
      fest.name,
      others.map((o) => o.name),
      i + 1,
    )
    out.push(
      gq(
        'gen-lunar',
        `lunar:rev:${fest.id}`,
        1,
        lt(
          `Ngày ${fest.day}/${fest.month} âm lịch là ngày lễ nào?`,
          `Which festival falls on the ${ordinalEn(fest.day)} day of the ${ordinalEn(fest.month)} lunar month?`,
        ),
        rev.options,
        rev.index,
        explain,
      ),
    )

    const alias = placeCorrect(
      fest.name,
      others.map((o) => o.name),
      i + 2,
    )
    out.push(
      gq(
        'gen-lunar',
        `lunar:alias:${fest.id}`,
        2,
        lt(
          `"${fest.alias.vi}" là tên gọi khác của ngày lễ nào?`,
          `"${fest.alias.en}" is another name for which festival?`,
        ),
        alias.options,
        alias.index,
        explain,
      ),
    )

    const aliasRev = placeCorrect(
      fest.alias,
      others.map((o) => o.alias),
      i + 3,
    )
    out.push(
      gq(
        'gen-lunar',
        `lunar:alias-rev:${fest.id}`,
        2,
        lt(`${fest.name.vi} còn được gọi là gì?`, `What is another name for ${fest.name.en}?`),
        aliasRev.options,
        aliasRev.index,
        explain,
      ),
    )

    const nextFest = LUNAR_FESTIVALS[(i + 1) % N]
    const nextOthers = [3, 5, 6].map((k) => LUNAR_FESTIVALS[(i + k) % N])
    const nx = placeCorrect(
      nextFest.name,
      nextOthers.map((o) => o.name),
      i,
    )
    out.push(
      gq(
        'gen-lunar',
        `lunar:next:${fest.id}`,
        3,
        lt(
          `Theo lịch âm, ngày lễ nào đến ngay sau ${fest.name.vi}?`,
          `In the lunar calendar, which festival comes right after ${fest.name.en}?`,
        ),
        nx.options,
        nx.index,
        lt(
          `Sau ${fest.name.vi} (${fest.day}/${fest.month}) là ${nextFest.name.vi} (${nextFest.day}/${nextFest.month} âm lịch).`,
          `After ${fest.name.en} (${fest.day}/${fest.month}) comes ${nextFest.name.en} (${ordinalEn(nextFest.day)} of the ${ordinalEn(nextFest.month)} month).`,
        ),
      ),
    )
  })
  return out
}

import type { QuizQuestion } from '../../types'
import { SET_LISTS } from './setLists'
import { combinations, gq, lt } from './templates'

export const ODD_PER_LIST = 22
export const MEMBER_PER_LIST = 16

export function generateSetQuestions(): QuizQuestion[] {
  const out: QuizQuestion[] = []
  for (const list of SET_LISTS) {
    const trios = combinations(list.members.length, 3)
    const oddCount = Math.min(ODD_PER_LIST, trios.length)
    for (let k = 0; k < oddCount; k++) {
      const trio = trios[Math.floor((k * trios.length) / oddCount)].map((i) => list.members[i])
      const outsider = list.outsiders[k % list.outsiders.length]
      const index = k % 4
      const options = trio.map((m) => lt(m.vi, m.en))
      options.splice(index, 0, lt(outsider.vi, outsider.en))
      const [a, b, c] = trio
      out.push(
        gq(
          'gen-sets',
          `sets:odd:${list.id}:${k}`,
          k % 3 === 0 ? 1 : 2,
          lt(
            `Mục nào sau đây KHÔNG phải là ${list.label.vi}?`,
            `Which of the following is NOT ${list.label.en}?`,
          ),
          options,
          index,
          lt(
            `${outsider.vi} không phải là ${list.label.vi} (${outsider.note.vi}). Ba mục còn lại là ${a.vi}, ${b.vi} và ${c.vi}.`,
            `${outsider.en} is not ${list.label.en} (${outsider.note.en}). The other three, ${a.en}, ${b.en} and ${c.en}, all belong.`,
          ),
        ),
      )
    }

    const outTrios = combinations(list.outsiders.length, 3)
    const memberCount = Math.min(MEMBER_PER_LIST, list.members.length * outTrios.length)
    for (let k = 0; k < memberCount; k++) {
      const member = list.members[k % list.members.length]
      const trio = outTrios[Math.floor((k * outTrios.length) / memberCount) % outTrios.length].map(
        (i) => list.outsiders[i],
      )
      const index = (k + 1) % 4
      const options = trio.map((o) => lt(o.vi, o.en))
      options.splice(index, 0, lt(member.vi, member.en))
      const [a, b, c] = trio
      out.push(
        gq(
          'gen-sets',
          `sets:member:${list.id}:${k}`,
          1,
          lt(`Mục nào sau đây LÀ ${list.label.vi}?`, `Which of the following IS ${list.label.en}?`),
          options,
          index,
          lt(
            `${member.vi} là ${list.label.vi} (${member.note.vi}). ${a.vi}, ${b.vi} và ${c.vi} không thuộc nhóm này.`,
            `${member.en} is ${list.label.en} (${member.note.en}). ${a.en}, ${b.en} and ${c.en} do not belong.`,
          ),
        ),
      )
    }
  }
  return out
}

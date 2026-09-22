import type { LocalizedText } from '@/i18n'
import type { QuizQuestion } from '../../types'
import { FACTS, type Fact, type Relation } from './facts'
import { gq, lt, placeCorrect } from './templates'

const FWD: Record<Relation, (s: string) => LocalizedText> = {
  symbol: () => lt('', ''),
  country: () => lt('', ''),
  composer: () => lt('', ''),
  festivalFood: () => lt('', ''),
  place: () => lt('', ''),
  role: () => lt('', ''),
}
void FWD

function fwdQuestion(f: Fact): LocalizedText {
  const s = f.subject
  switch (f.relation) {
    case 'symbol':
      return lt(
        `${s.vi} gắn với hình ảnh nào sau đây?`,
        `Which of these is associated with ${s.en}?`,
      )
    case 'country':
      return lt(
        `${s.vi} là lễ trăng rằm của nước/vùng nào?`,
        `${s.en} belongs to which country or region?`,
      )
    case 'composer':
      return lt(`Bài hát "${s.vi}" do ai sáng tác?`, `Who composed "${s.en}"?`)
    case 'festivalFood':
      return lt(`Món ăn đặc trưng của ${s.vi} là gì?`, `Which food is characteristic of ${s.en}?`)
    case 'place':
      return lt(`${s.vi} nằm ở đâu?`, `Where is ${s.en}?`)
    case 'role':
      return lt(`${s.vi} nổi tiếng với việc gì?`, `What is ${s.en} known for?`)
  }
}

function revQuestion(f: Fact): LocalizedText {
  const a = f.attribute
  switch (f.relation) {
    case 'symbol':
      return lt(`Hình ảnh "${a.vi}" gắn với nhân vật nào?`, `Who is associated with "${a.en}"?`)
    case 'country':
      return lt(
        `Lễ trăng rằm tháng Tám của ${a.vi} có tên là gì?`,
        `What is ${a.en}'s mid-autumn moon festival called?`,
      )
    case 'composer':
      return lt(
        `Nhạc sĩ ${a.vi} là tác giả bài hát nào sau đây?`,
        `Which of these songs did ${a.en} write?`,
      )
    case 'festivalFood':
      return lt(
        `"${a.vi}" là món đặc trưng của ngày lễ nào?`,
        `"${a.en}" is the signature food of which festival?`,
      )
    case 'place':
      return lt(`Địa điểm nào sau đây ở ${a.vi}?`, `Which of these is in ${a.en}?`)
    case 'role':
      return lt(`Ai nổi tiếng với việc ${a.vi}?`, `Who is known for ${a.en}?`)
  }
}

export function generateMatchQuestions(): QuizQuestion[] {
  const out: QuizQuestion[] = []
  FACTS.forEach((fact, i) => {
    const peers = FACTS.filter(
      (o) =>
        o.relation === fact.relation &&
        o.id !== fact.id &&
        o.attribute.vi !== fact.attribute.vi &&
        o.subject.vi !== fact.subject.vi,
    )
    if (peers.length < 3) return
    const ds = [0, 1, 2].map((k) => peers[(i + k) % peers.length])
    // ensure distinct distractor attributes/subjects
    const uniqAttr = new Set(ds.map((d) => d.attribute.vi))
    const uniqSubj = new Set(ds.map((d) => d.subject.vi))
    if (uniqAttr.size < 3 || uniqSubj.size < 3) return

    const fwd = placeCorrect(
      fact.attribute,
      ds.map((d) => d.attribute),
      i,
    )
    out.push(
      gq(
        'gen-match',
        `match:fwd:${fact.id}`,
        fact.difficulty,
        fwdQuestion(fact),
        fwd.options,
        fwd.index,
        fact.explanation,
      ),
    )
    const rev = placeCorrect(
      fact.subject,
      ds.map((d) => d.subject),
      i + 1,
    )
    out.push(
      gq(
        'gen-match',
        `match:rev:${fact.id}`,
        fact.difficulty,
        revQuestion(fact),
        rev.options,
        rev.index,
        fact.explanation,
      ),
    )
  })
  return out
}

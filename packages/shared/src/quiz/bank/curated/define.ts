import type { CuratedCategory, QuizDifficulty, QuizQuestion } from '../../types'

export type LT = readonly [vi: string, en: string]
const lt = (t: LT) => ({ vi: t[0], en: t[1] })

/** Compact curated-question factory. */
export function q(
  category: CuratedCategory,
  slug: string,
  difficulty: QuizDifficulty,
  question: LT,
  options: readonly [LT, LT, LT, LT],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: LT,
  emoji?: string,
): QuizQuestion {
  return {
    id: `c:${category}:${slug}`,
    category,
    difficulty,
    source: 'curated',
    question: lt(question),
    options: options.map(lt),
    correctIndex,
    explanation: lt(explanation),
    emoji,
  }
}

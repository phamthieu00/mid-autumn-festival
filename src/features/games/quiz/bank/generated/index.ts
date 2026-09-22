import type { QuizQuestion } from '../../types'
import { generateDateQuestions } from './dates'
import { generateVocabQuestions } from './vocab'
import { generateSetQuestions } from './sets'
import { generateMatchQuestions } from './match'
import { generateLunarQuestions } from './lunar'
import { generateMoonPhaseQuestions } from './moonPhase'

/** Pure and deterministic: no Math.random anywhere in the generators. */
export function buildGenerated(): QuizQuestion[] {
  return [
    ...generateDateQuestions(),
    ...generateVocabQuestions(),
    ...generateSetQuestions(),
    ...generateMatchQuestions(),
    ...generateLunarQuestions(),
    ...generateMoonPhaseQuestions(),
  ]
}

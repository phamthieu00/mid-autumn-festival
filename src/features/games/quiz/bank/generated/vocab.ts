import type { QuizQuestion } from '../../types'
import { GLOSSARY, type GlossaryEntry } from './glossary'
import { gq, lt, placeCorrect } from './templates'

function distractors(entry: GlossaryEntry, i: number): GlossaryEntry[] {
  const same = GLOSSARY.filter((e) => e.group === entry.group && e.id !== entry.id)
  const pool = same.length >= 3 ? same : GLOSSARY.filter((e) => e.id !== entry.id)
  return [0, 1, 2].map((k) => pool[(i + k) % pool.length])
}

export function generateVocabQuestions(): QuizQuestion[] {
  const out: QuizQuestion[] = []
  GLOSSARY.forEach((entry, i) => {
    const ds = distractors(entry, i + 1)
    const viEn = placeCorrect(
      lt(entry.en, entry.en),
      ds.map((d) => lt(d.en, d.en)),
      i,
    )
    out.push(
      gq(
        'gen-vocab',
        `vocab:vi-en:${entry.id}`,
        1,
        lt(`"${entry.vi}" trong tiếng Anh là gì?`, `What is the English for "${entry.vi}"?`),
        viEn.options,
        viEn.index,
        lt(
          `"${entry.vi}" tiếng Anh là "${entry.en}".`,
          `"${entry.vi}" is "${entry.en}" in English.`,
        ),
      ),
    )
    const enVi = placeCorrect(
      lt(entry.vi, entry.vi),
      ds.map((d) => lt(d.vi, d.vi)),
      i + 2,
    )
    out.push(
      gq(
        'gen-vocab',
        `vocab:en-vi:${entry.id}`,
        1,
        lt(`"${entry.en}" trong tiếng Việt là gì?`, `What is the Vietnamese for "${entry.en}"?`),
        enVi.options,
        enVi.index,
        lt(
          `"${entry.en}" tiếng Việt là "${entry.vi}".`,
          `"${entry.en}" is "${entry.vi}" in Vietnamese.`,
        ),
      ),
    )
  })
  return out
}

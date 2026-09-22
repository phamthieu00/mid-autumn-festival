import { shuffle } from '@/lib/random'
import { QUIZ_SIZE, type QuizDifficulty, type QuizQuestion } from './types'

export interface PickOptions {
  recentIds?: readonly string[]
  mix?: { curated: number; generated: number }
  maxPerCategory?: number
  difficultyTarget?: Record<QuizDifficulty, number>
}

/**
 * Pick `n` distinct questions: prefer unseen ones, mix curated/generated,
 * cap per category and spread difficulty. Deterministic for a given rng.
 */
export function pickQuizSet(
  rng: () => number,
  bank: readonly QuizQuestion[],
  n = QUIZ_SIZE,
  opts: PickOptions = {},
): QuizQuestion[] {
  if (bank.length <= n) return shuffle(bank, rng)
  const recent = new Set(opts.recentIds ?? [])
  const mix = opts.mix ?? { curated: 6, generated: 4 }
  const maxPerCategory = opts.maxPerCategory ?? 2
  const target = { ...(opts.difficultyTarget ?? { 1: 4, 2: 4, 3: 2 }) }

  const poolOf = (source: QuizQuestion['source']) => {
    const items = bank.filter((q) => q.source === source)
    const fresh = shuffle(
      items.filter((q) => !recent.has(q.id)),
      rng,
    )
    const seen = shuffle(
      items.filter((q) => recent.has(q.id)),
      rng,
    )
    return [...fresh, ...seen]
  }

  const selected: QuizQuestion[] = []
  const chosen = new Set<string>()
  const perCat = new Map<string, number>()
  const perDiff: Record<QuizDifficulty, number> = { 1: 0, 2: 0, 3: 0 }

  const accept = (q: QuizQuestion) => {
    selected.push(q)
    chosen.add(q.id)
    perCat.set(q.category, (perCat.get(q.category) ?? 0) + 1)
    perDiff[q.difficulty]++
  }

  const take = (pool: QuizQuestion[], want: number) => {
    let got = 0
    const passes: ((q: QuizQuestion) => boolean)[] = [
      (q) =>
        (perCat.get(q.category) ?? 0) < maxPerCategory &&
        perDiff[q.difficulty] < target[q.difficulty],
      (q) => (perCat.get(q.category) ?? 0) < maxPerCategory,
      () => true,
    ]
    for (const ok of passes) {
      for (const q of pool) {
        if (got >= want) return got
        if (chosen.has(q.id) || !ok(q)) continue
        accept(q)
        got++
      }
    }
    return got
  }

  const curated = poolOf('curated')
  const generated = poolOf('generated')
  take(curated, Math.min(mix.curated, n))
  take(generated, Math.min(mix.generated, n - selected.length))
  if (selected.length < n) take([...curated, ...generated], n - selected.length)

  return shuffle(selected.slice(0, n), rng)
}

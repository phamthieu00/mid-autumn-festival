import type { QuizCategory, QuizQuestion } from '../types'
import { CURATED } from './curated'
import { buildGenerated } from './generated'

export const normalizeText = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

export const signature = (q: QuizQuestion) =>
  `${normalizeText(q.question.vi)}::${q.options
    .map((o) => normalizeText(o.vi))
    .sort()
    .join('|')}`

export const CATEGORY_EMOJI: Record<QuizCategory, string> = {
  legends: '🌳',
  customs: '🏮',
  food: '🥮',
  lanterns: '⭐',
  'music-arts': '🎵',
  asia: '🌏',
  'moon-astronomy': '🔭',
  'dates-numbers': '📅',
  literature: '📜',
  modern: '🏙️',
  'gen-dates': '📆',
  'gen-vocab': '🔤',
  'gen-sets': '🧺',
  'gen-match': '🔗',
  'gen-lunar': '🗓️',
  'gen-moon': '🌗',
}

export function validateQuestion(q: QuizQuestion): string | null {
  if (q.options.length !== 4) return `${q.id}: needs 4 options`
  if (q.correctIndex < 0 || q.correctIndex > 3) return `${q.id}: bad correctIndex`
  const vis = new Set(q.options.map((o) => normalizeText(o.vi)))
  const ens = new Set(q.options.map((o) => normalizeText(o.en)))
  if (vis.size !== 4 || ens.size !== 4) return `${q.id}: duplicate options`
  for (const t of [q.question, q.explanation, ...q.options]) {
    if (!t.vi.trim() || !t.en.trim()) return `${q.id}: empty text`
  }
  return null
}

let cache: QuizQuestion[] | null = null

/** Full question bank: curated first (wins on duplicates), then generated. */
export function getBank(validate = false): QuizQuestion[] {
  if (cache) return cache
  const seen = new Set<string>()
  const ids = new Set<string>()
  const out: QuizQuestion[] = []
  for (const raw of [...CURATED, ...buildGenerated()]) {
    const sig = signature(raw)
    if (seen.has(sig) || ids.has(raw.id)) continue
    seen.add(sig)
    ids.add(raw.id)
    out.push(raw.emoji ? raw : { ...raw, emoji: CATEGORY_EMOJI[raw.category] })
  }
  if (validate) {
    const errors = out.map(validateQuestion).filter((e): e is string => e !== null)
    if (errors.length) throw new Error(`Invalid quiz bank:\n${errors.join('\n')}`)
  }
  cache = out
  return out
}

export function __resetBankCache() {
  cache = null
}

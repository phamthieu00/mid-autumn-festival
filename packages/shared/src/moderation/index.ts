/**
 * Lightweight profanity / spam screening for short public texts (wishes, nicknames).
 * `hard` words are rejected outright, `soft` words send the text to moderation.
 * Matching is done on a normalised form: lower-case, diacritics stripped, đ→d,
 * repeated letters collapsed, separators removed, so "đ.ị.t" or "ddit" still match.
 */
import { HARD_VI, SOFT_VI } from './vi'
import { HARD_EN, SOFT_EN } from './en'

export type ModerationVerdict = 'ok' | 'soft' | 'hard' | 'link'

const LINK_RE = /(https?:\/\/|www\.|\.(com|net|org|vn|io|xyz|info)\b)/i

export function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '')
    .replace(/(.)\1{2,}/g, '$1$1')
}

/** Collapse every run of a letter to one, so "fuuuucker" and "fucker" compare equal. */
const squeeze = (s: string) => s.replace(/(.)\1+/g, '$1')

const norm = (list: readonly string[]) => list.map(normalizeForMatch).filter(Boolean)
const HARD = norm([...HARD_VI, ...HARD_EN])
const SOFT = norm([...SOFT_VI, ...SOFT_EN])
// only words without intentional double letters take part in squeezed matching ('cmm' must not become 'cm')
const HARD1 = HARD.filter((w) => squeeze(w) === w)
const SOFT1 = SOFT.filter((w) => squeeze(w) === w)

const hits = (n: string, n1: string, list: readonly string[], list1: readonly string[]) =>
  list.some((w) => n.includes(w)) || list1.some((w) => n1.includes(w))

export function screenText(text: string): ModerationVerdict {
  if (LINK_RE.test(text)) return 'link'
  const n = normalizeForMatch(text)
  if (!n) return 'ok'
  const n1 = squeeze(n)
  if (hits(n, n1, HARD, HARD1)) return 'hard'
  if (hits(n, n1, SOFT, SOFT1)) return 'soft'
  return 'ok'
}

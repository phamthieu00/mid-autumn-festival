import type { GameId } from '@/features/scores/types'
import type { TranslationKey } from '@/i18n'

export type GameKind = 'action' | 'brain'

export interface GameMeta {
  id: GameId
  path: string
  titleKey: TranslationKey
  descKey: TranslationKey
  howToKey: TranslationKey
  unitKey: TranslationKey
  emoji: string
  gradient: string
  kind: GameKind
  featured?: boolean
}

const meta = (
  id: GameId,
  kind: GameKind,
  emoji: string,
  gradient: string,
  featured = false,
): GameMeta => ({
  id,
  kind,
  emoji,
  gradient,
  featured,
  path: `/games/${id}`,
  titleKey: `games.${id}.title`,
  descKey: `games.${id}.desc`,
  howToKey: `games.${id}.howTo`,
  unitKey: `games.${id}.unit`,
})

export const GAMES: GameMeta[] = [
  meta('catch', 'action', '🏮', 'from-lantern-600/40 via-lantern-500/20 to-night-800', true),
  meta('runner', 'action', '🎐', 'from-lantern-500/40 via-gold-400/15 to-night-800', true),
  meta('rhythm', 'action', '🥁', 'from-lantern-700/50 via-lantern-500/20 to-night-800'),
  meta('match', 'brain', '🥮', 'from-gold-500/40 via-gold-400/15 to-night-800'),
  meta('puzzle', 'brain', '🧩', 'from-moon-500/35 via-night-600/30 to-night-800'),
  meta('quiz', 'brain', '🌕', 'from-night-600/60 via-indigo-500/20 to-night-800', true),
  meta('word', 'brain', '🔤', 'from-jade/35 via-night-600/25 to-night-800'),
]

export const FEATURED_GAMES = GAMES.filter((g) => g.featured)
export const gamesByKind = (kind: GameKind) => GAMES.filter((g) => g.kind === kind)
export const gameById = (id: GameId) => GAMES.find((g) => g.id === id)!

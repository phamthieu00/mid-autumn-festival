import type { GameId } from '@/features/scores/types'
import type { TranslationKey } from '@/i18n'

export interface GameMeta {
  id: GameId
  path: string
  titleKey: TranslationKey
  descKey: TranslationKey
  howToKey: TranslationKey
  unitKey: TranslationKey
  emoji: string
  gradient: string
}

export const GAMES: GameMeta[] = [
  {
    id: 'catch',
    path: '/games/catch',
    titleKey: 'games.catch.title',
    descKey: 'games.catch.desc',
    howToKey: 'games.catch.howTo',
    unitKey: 'games.catch.unit',
    emoji: '🏮',
    gradient: 'from-lantern-600/40 via-lantern-500/20 to-night-800',
  },
  {
    id: 'match',
    path: '/games/match',
    titleKey: 'games.match.title',
    descKey: 'games.match.desc',
    howToKey: 'games.match.howTo',
    unitKey: 'games.match.unit',
    emoji: '🥮',
    gradient: 'from-gold-500/40 via-gold-400/15 to-night-800',
  },
  {
    id: 'quiz',
    path: '/games/quiz',
    titleKey: 'games.quiz.title',
    descKey: 'games.quiz.desc',
    howToKey: 'games.quiz.howTo',
    unitKey: 'games.quiz.unit',
    emoji: '🌕',
    gradient: 'from-night-600/60 via-indigo-500/20 to-night-800',
  },
]

export const gameById = (id: GameId) => GAMES.find((g) => g.id === id)!

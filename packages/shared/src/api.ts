/** Response shapes shared between apps/api and apps/web (types only). */
import type { GameId } from './games/ids'
import type { SessionMode } from './games/rules'
import type { PublicQuizQuestion } from './quiz/types'
import type { LanternColor } from './wishes'

export interface MeResponse {
  user: { id: string; name: string; email: string; image: string | null } | null
  player: {
    nickname: string | null
    color: LanternColor
    locale: string
    legacyBests: Record<string, { value: number; secondary?: number }> | null
    createdAt: string
  } | null
  badges?: { badgeId: string; earnedAt: string }[]
  isAdmin?: boolean
}

export interface StartSessionResponse {
  sessionId: string
  gameId: GameId
  mode: SessionMode
  seed: number
  dailyKey: string | null
  expiresAt: string
  quiz?: PublicQuizQuestion[]
}

export interface AnswerResponse {
  correct: boolean
  correctIndex: number
  explanation: { vi: string; en: string }
  answered: number
  total: number
}

export interface FinishResponse {
  accepted: true
  publicId: string
  gameId: GameId
  mode: SessionMode
  value: number
  secondary: number | null
  isPersonalBest: boolean
  ranks: { alltime: number | null; weekly: number | null; daily: number | null }
  flags: string[]
  anonymous: boolean
  newBadges: string[]
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'alltime'

export interface LeaderboardEntry {
  rank: number
  userId: string
  nickname: string | null
  color: string
  avatarUrl: string | null
  value: number
  secondary: number | null
}

export interface LeaderboardResponse {
  gameId: GameId
  period: LeaderboardPeriod
  periodKey: string
  source: 'redis' | 'pg'
  entries: LeaderboardEntry[]
  me: LeaderboardEntry | null
}

export interface DailyResponse {
  dailyKey: string
  resetsAt: string
  challenges: {
    gameId: GameId
    done: boolean
    myValue: number | null
    mySecondary: number | null
    myRank: number | null
  }[]
}

export interface PlayerProfile {
  userId: string
  nickname: string | null
  color: string
  avatarUrl: string | null
  createdAt: string
  totalGames: number
  bests: {
    gameId: GameId
    value: number | null
    secondary: number | null
    rank: number | null
    at: string | null
  }[]
  badges: { badgeId: string; earnedAt: string }[]
}

export interface WishItem {
  id: string
  createdAt: string
  displayName: string
  text: string
  color: string
  lang: string
  status: 'visible' | 'pending' | 'hidden'
  mine: boolean
}

export interface WishListResponse {
  items: WishItem[]
  nextCursor: string | null
  pending: WishItem[]
}

export interface ResultResponse {
  publicId: string
  gameId: GameId
  mode: SessionMode
  dailyKey: string | null
  value: number
  secondary: number | null
  createdAt: string
  player: {
    userId: string
    nickname: string | null
    color: string
    avatarUrl: string | null
  } | null
  rank: number | null
}

export interface ApiErrorBody {
  error: { code: string; message: string; requestId?: string; issues?: unknown }
}

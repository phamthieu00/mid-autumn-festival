import type { LocalizedText } from '../i18n'
import type { GameId } from './ids'

/** Server-side labels (OG images, share pages). The web app keeps its own i18n dictionary. */
export const GAME_TITLES: Record<GameId, LocalizedText> = {
  catch: { vi: 'Bắt lồng đèn', en: 'Catch the Lanterns' },
  runner: { vi: 'Rước đèn đêm trăng', en: 'Moonlit Lantern Run' },
  rhythm: { vi: 'Nhịp trống múa lân', en: 'Lion Dance Drums' },
  match: { vi: 'Ghép bánh Trung Thu', en: 'Mooncake Match' },
  puzzle: { vi: 'Ghép hình mặt trăng', en: 'Moon Puzzle' },
  quiz: { vi: 'Đố vui Trung Thu', en: 'Mid-Autumn Trivia' },
  word: { vi: 'Đoán từ Trung Thu', en: 'Mid-Autumn Word Guess' },
}

export const GAME_UNITS: Record<GameId, LocalizedText> = {
  catch: { vi: 'điểm', en: 'points' },
  runner: { vi: 'điểm', en: 'points' },
  rhythm: { vi: 'điểm', en: 'points' },
  match: { vi: 'nước đi', en: 'moves' },
  puzzle: { vi: 'nước đi', en: 'moves' },
  quiz: { vi: '/10 câu', en: '/10 correct' },
  word: { vi: 'điểm', en: 'points' },
}

export const GAME_EMOJI: Record<GameId, string> = {
  catch: '🏮',
  runner: '🎐',
  rhythm: '🥁',
  match: '🥮',
  puzzle: '🧩',
  quiz: '🌕',
  word: '🔤',
}

import type { LocalizedText } from './i18n'
import type { GameId } from './games/ids'

export interface BadgeDef {
  id: string
  emoji: string
  title: LocalizedText
  desc: LocalizedText
}

const b = (id: string, emoji: string, vi: [string, string], en: [string, string]): BadgeDef => ({
  id,
  emoji,
  title: { vi: vi[0], en: en[0] },
  desc: { vi: vi[1], en: en[1] },
})

export const BADGES: BadgeDef[] = [
  b(
    'first-game',
    '🌱',
    ['Bước chân đầu', 'Hoàn thành ván chơi đầu tiên'],
    ['First steps', 'Finish your first game'],
  ),
  b(
    'all-seven',
    '🎡',
    ['Đủ bảy trò', 'Chơi qua cả 7 trò chơi'],
    ['All seven', 'Play every one of the 7 games'],
  ),
  b(
    'catch-50',
    '🏮',
    ['Tay bắt đèn', 'Đạt 50 điểm Bắt lồng đèn'],
    ['Lantern catcher', 'Score 50 in Catch the Lanterns'],
  ),
  b(
    'catch-combo-20',
    '🔥',
    ['Combo rực lửa', 'Combo 20 trong Bắt lồng đèn'],
    ['Blazing combo', 'Reach a 20 combo in Catch the Lanterns'],
  ),
  b(
    'runner-500m',
    '🎐',
    ['Rước đèn xa', 'Chạy 500 m trong Rước đèn'],
    ['Long parade', 'Run 500 m in the Lantern Run'],
  ),
  b(
    'rhythm-combo-50',
    '🥁',
    ['Tay trống cừ', 'Combo 50 trong Nhịp trống múa lân'],
    ['Drum master', 'Reach a 50 combo in Lion Dance Drums'],
  ),
  b(
    'rhythm-perfect-90',
    '🎯',
    ['Đúng nhịp', '90% nốt Tuyệt trong một bài'],
    ['On the beat', '90% Perfect notes in one song'],
  ),
  b(
    'match-12-moves',
    '🥮',
    ['Trí nhớ bánh nướng', 'Ghép bánh xong trong 12 nước'],
    ['Mooncake memory', 'Finish Mooncake Match in 12 moves'],
  ),
  b(
    'puzzle-30-moves',
    '🧩',
    ['Xếp trăng gọn', 'Ghép hình 3×3 dưới 30 nước'],
    ['Tidy moon', 'Solve the 3×3 puzzle in under 30 moves'],
  ),
  b(
    'quiz-perfect',
    '🌕',
    ['Hằng Nga uyên bác', 'Đúng 10/10 câu đố vui'],
    ['Wise Hằng Nga', 'Answer 10/10 trivia questions'],
  ),
  b(
    'word-perfect',
    '🔤',
    ['Thuộc làu Trung Thu', 'Đoán đúng cả 5 từ'],
    ['Word wizard', 'Guess all 5 words'],
  ),
  b(
    'daily-streak-3',
    '📅',
    ['Ba ngày liền', 'Chơi thử thách ngày 3 ngày liên tiếp'],
    ['Three-day streak', 'Play the daily challenge 3 days in a row'],
  ),
  b(
    'daily-streak-7',
    '🗓️',
    ['Trọn tuần trăng', 'Chơi thử thách ngày 7 ngày liên tiếp'],
    ['Full moon week', 'Play the daily challenge 7 days in a row'],
  ),
  b(
    'weekly-top-10',
    '🏆',
    ['Top 10 tuần', 'Lọt top 10 bảng xếp hạng tuần'],
    ['Weekly top 10', 'Reach the top 10 of a weekly leaderboard'],
  ),
  b(
    'first-wish',
    '✨',
    ['Đèn ước đầu tiên', 'Thả điều ước đầu tiên lên cung trăng'],
    ['First wish', 'Release your first wish lantern'],
  ),
]

export const badgeById = (id: string) => BADGES.find((x) => x.id === id)

export interface BadgeContext {
  gameId?: GameId
  value?: number
  meta?: Record<string, unknown>
  weeklyRank?: number | null
  stats: {
    totalGames: number
    distinctGames: number
    dailyStreak: number
    wishes: number
  }
}

const num = (v: unknown) => (typeof v === 'number' ? v : 0)

/** Pure rule evaluation: returns every badge id whose condition holds for this event. */
export function evaluateBadges(ctx: BadgeContext): string[] {
  const out: string[] = []
  const { stats, gameId, value = 0, meta = {} } = ctx
  if (stats.totalGames >= 1) out.push('first-game')
  if (stats.distinctGames >= 7) out.push('all-seven')
  if (gameId === 'catch' && value >= 50) out.push('catch-50')
  if (gameId === 'catch' && num(meta.maxCombo) >= 20) out.push('catch-combo-20')
  if (gameId === 'runner' && num(meta.metres) >= 500) out.push('runner-500m')
  if (gameId === 'rhythm' && num(meta.maxCombo) >= 50) out.push('rhythm-combo-50')
  if (gameId === 'rhythm') {
    const counts = (meta.counts ?? {}) as Record<string, number>
    const total = num(counts.perfect) + num(counts.good) + num(counts.miss)
    if (total > 0 && num(counts.perfect) / total >= 0.9) out.push('rhythm-perfect-90')
  }
  if (gameId === 'match' && value > 0 && value <= 12) out.push('match-12-moves')
  if (gameId === 'puzzle' && value > 0 && value < 30) out.push('puzzle-30-moves')
  if (gameId === 'quiz' && value === 10) out.push('quiz-perfect')
  if (gameId === 'word' && num(meta.solved) === 5) out.push('word-perfect')
  if (stats.dailyStreak >= 3) out.push('daily-streak-3')
  if (stats.dailyStreak >= 7) out.push('daily-streak-7')
  if (ctx.weeklyRank != null && ctx.weeklyRank <= 10) out.push('weekly-top-10')
  if (stats.wishes >= 1) out.push('first-wish')
  return out
}

/** Consecutive days (ending today or yesterday) from a list of YYYY-MM-DD keys. */
export function dailyStreak(dailyKeys: readonly string[], today: string): number {
  const set = new Set(dailyKeys)
  const step = (key: string, delta: number) => {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10)
  }
  let cursor = set.has(today) ? today : step(today, -1)
  if (!set.has(cursor)) return 0
  let streak = 0
  while (set.has(cursor)) {
    streak++
    cursor = step(cursor, -1)
  }
  return streak
}

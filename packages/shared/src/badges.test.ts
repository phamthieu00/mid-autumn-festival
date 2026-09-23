import { describe, expect, it } from 'vitest'
import { BADGES, dailyStreak, evaluateBadges } from './badges'

const stats = { totalGames: 1, distinctGames: 1, dailyStreak: 0, wishes: 0 }

describe('badges', () => {
  it('has unique ids with bilingual text', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length)
    for (const b of BADGES) expect(b.title.vi && b.title.en && b.desc.vi && b.desc.en).toBeTruthy()
  })
  it('evaluates game rules', () => {
    expect(evaluateBadges({ gameId: 'quiz', value: 10, stats })).toEqual([
      'first-game',
      'quiz-perfect',
    ])
    expect(
      evaluateBadges({
        gameId: 'rhythm',
        value: 5000,
        meta: { maxCombo: 60, counts: { perfect: 95, good: 3, miss: 2 } },
        stats,
      }),
    ).toEqual(expect.arrayContaining(['rhythm-combo-50', 'rhythm-perfect-90']))
    expect(evaluateBadges({ gameId: 'match', value: 12, stats, weeklyRank: 3 })).toEqual(
      expect.arrayContaining(['match-12-moves', 'weekly-top-10']),
    )
    expect(evaluateBadges({ stats: { ...stats, distinctGames: 7, dailyStreak: 7 } })).toEqual(
      expect.arrayContaining(['all-seven', 'daily-streak-3', 'daily-streak-7']),
    )
  })
  it('computes daily streaks ending today or yesterday', () => {
    expect(dailyStreak(['2026-09-25', '2026-09-24', '2026-09-23'], '2026-09-25')).toBe(3)
    expect(dailyStreak(['2026-09-24', '2026-09-23'], '2026-09-25')).toBe(2)
    expect(dailyStreak(['2026-09-22'], '2026-09-25')).toBe(0)
    expect(dailyStreak(['2026-09-30', '2026-10-01'], '2026-10-01')).toBe(2)
  })
})

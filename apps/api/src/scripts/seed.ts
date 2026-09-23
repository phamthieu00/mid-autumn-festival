/**
 * Dev-only seed: a dozen fake players with plausible bests on every game plus a few wishes,
 * so leaderboards, profiles and the wishes wall have something to show locally.
 *   pnpm --filter @maf/api db:seed
 */
import { sql as dsql } from 'drizzle-orm'
import { GAME_IDS } from '@maf/shared/games/ids'
import { encodeRankScore } from '@maf/shared/games/rank'
import { periodKeys } from '@maf/shared/games/daily'
import { LANTERN_COLOR_IDS } from '@maf/shared/wishes'
import { seededRng } from '@maf/shared/random'
import { db, sql } from '../db/client'
import { gameSessions, personalBests, players, scores, user, wishes } from '../db/schema/index'
import { env, isProd } from '../env'
import { connectRedis, redis } from '../redis'
import { pushToZsets } from '../services/leaderboards'
import { publishWish } from '../services/wishStream'
import { toEvent } from '../services/wishes'

if (isProd) {
  console.error('refusing to seed a production database')
  process.exit(1)
}

const NAMES = [
  'Thỏ Ngọc',
  'Chú Cuội',
  'Chị Hằng',
  'Bánh Dẻo',
  'Đèn Ông Sao',
  'Trống Lân',
  'Sao Băng',
  'Trăng Khuyết',
  'Cốm Xanh',
  'Múa Lân',
  'Bé Cuội',
  'Hạt Sen',
]
const WISHES = [
  'Chúc cả nhà Trung Thu đoàn viên, ấm áp và thật nhiều bánh ngon 🥮',
  'Wishing everyone a bright moon and a light heart tonight 🌕',
  'Mong năm nay em thi đậu, ba mẹ khoẻ mạnh.',
  'Ước gì được bé lại một đêm để rước đèn với bạn bè.',
  'May your lantern carry every worry away.',
  'Chúc các bé có một mùa Trung Thu rực rỡ ánh đèn!',
]
// value ranges per game (lower-is-better games get a secondary time)
const RANGE: Record<string, [number, number]> = {
  catch: [20, 140],
  runner: [180, 1600],
  rhythm: [800, 6500],
  match: [8, 28],
  puzzle: [22, 120],
  quiz: [30, 100],
  word: [40, 520],
}
const rng = seededRng(2026)
const between = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))
const pick = <T>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)]
const ALPHABET = [...'23456789abcdefghjkmnpqrstuvwxyz']
const pid = () => Array.from({ length: 10 }, () => pick(ALPHABET)).join('')

async function main() {
  await connectRedis()
  const keys = periodKeys(new Date())
  for (let i = 0; i < NAMES.length; i++) {
    const id = `seed_u${i + 1}`
    await db
      .insert(user)
      .values({ id, name: NAMES[i], email: `${id}@example.com`, emailVerified: true })
      .onConflictDoNothing()
    await db
      .insert(players)
      .values({ userId: id, nickname: NAMES[i], color: pick(LANTERN_COLOR_IDS), locale: 'vi' })
      .onConflictDoUpdate({ target: players.userId, set: { nickname: NAMES[i] } })
    for (const gameId of GAME_IDS) {
      if (rng() < 0.25) continue // not everyone plays everything
      const [lo, hi] = RANGE[gameId]
      const value = between(lo, hi)
      const secondary =
        gameId === 'match' || gameId === 'puzzle' || gameId === 'word' ? between(25, 240) : null
      const rankScore = encodeRankScore(gameId, value, secondary)
      const [session] = await db
        .insert(gameSessions)
        .values({
          userId: id,
          gameId,
          mode: 'free',
          seed: between(1, 1e6),
          status: 'finished',
          expiresAt: dsql`now()`,
          finishedAt: dsql`now()`,
          payload: {},
        })
        .returning({ id: gameSessions.id })
      const [score] = await db
        .insert(scores)
        .values({
          publicId: pid(),
          sessionId: session.id,
          userId: id,
          gameId,
          mode: 'free',
          value,
          secondary,
          rankScore,
          meta: { seeded: true },
        })
        .returning({ id: scores.id })
      for (const periodKey of [keys.alltime, keys.weekly]) {
        await db
          .insert(personalBests)
          .values({ userId: id, gameId, periodKey, scoreId: score.id, rankScore })
          .onConflictDoUpdate({
            target: [personalBests.userId, personalBests.gameId, personalBests.periodKey],
            set: { scoreId: score.id, rankScore },
            setWhere: dsql`${personalBests.rankScore} < ${rankScore}`,
          })
      }
      await pushToZsets(gameId, id, rankScore, [keys.alltime, keys.weekly])
    }
  }
  for (const text of WISHES) {
    const [row] = await db
      .insert(wishes)
      .values({
        userId: null,
        displayName: pick(NAMES),
        text,
        color: pick(LANTERN_COLOR_IDS),
        lang: /[àáạảãâăđêôơưế]/i.test(text) ? 'vi' : 'en',
        status: 'visible',
      })
      .returning()
    await publishWish(toEvent(row))
  }
  console.log(
    `seeded ${NAMES.length} players and ${WISHES.length} wishes into ${env.DATABASE_URL.replace(/\/\/.*@/, '//***@')}`,
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await Promise.allSettled([redis.quit(), sql.end({ timeout: 5 })])
  })

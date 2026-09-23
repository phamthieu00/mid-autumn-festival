import { eq, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { players, type Player } from '../db/schema/index'
import { normalizeNickname, RESERVED_NICKNAMES } from '@maf/shared/schemas'

export async function ensurePlayer(userId: string, avatarUrl: string | null): Promise<void> {
  await db
    .insert(players)
    .values({ userId, avatarUrl })
    .onConflictDoNothing({ target: players.userId })
}

export async function getPlayer(userId: string): Promise<Player | null> {
  const rows = await db.select().from(players).where(eq(players.userId, userId)).limit(1)
  return rows[0] ?? null
}

export type NicknameError = 'reserved' | 'taken'

/** Postgres SQLSTATE from a raw or Drizzle-wrapped error. */
export function pgCode(err: unknown): string | undefined {
  const e = err as { code?: string; cause?: { code?: string } }
  return e?.cause?.code ?? e?.code
}

export async function setNickname(
  userId: string,
  raw: string,
): Promise<{ ok: true; nickname: string } | { ok: false; reason: NicknameError }> {
  const nickname = normalizeNickname(raw)
  if (RESERVED_NICKNAMES.has(nickname.toLowerCase().replace(/[\s_.-]/g, ''))) {
    return { ok: false, reason: 'reserved' }
  }
  try {
    await db
      .update(players)
      .set({ nickname, updatedAt: sql`now()` })
      .where(eq(players.userId, userId))
    return { ok: true, nickname }
  } catch (err) {
    if (pgCode(err) === '23505') return { ok: false, reason: 'taken' }
    throw err
  }
}

export async function setColor(userId: string, color: Player['color']) {
  await db
    .update(players)
    .set({ color, updatedAt: sql`now()` })
    .where(eq(players.userId, userId))
}

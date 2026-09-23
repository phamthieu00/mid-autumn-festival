import { createHmac } from 'node:crypto'
import { sql } from '../db/client'
import { env } from '../env'
import { connectRedis, redis, redisReady } from '../redis'

/**
 * better-auth stores the raw token but the cookie carries `token.signature`, where the signature is a
 * standard base64 HMAC-SHA256 (Hono-style signed cookie) and the whole value is URL-encoded.
 */
export function signSessionToken(token: string) {
  const sig = createHmac('sha256', env.BETTER_AUTH_SECRET).update(token).digest('base64')
  return encodeURIComponent(`${token}.${sig}`)
}

/** Truncate all app tables between tests (order-safe via CASCADE). */
export async function resetDb() {
  if (!redisReady()) await connectRedis()
  if (redisReady()) await redis.flushdb()
  await sql`truncate table "wish_reports", "wishes", "player_badges", "personal_bests", "scores", "game_sessions", "daily_challenges", "players", "session", "account", "verification", "user" cascade`
}

export async function seedUserWithSession(
  opts: { id?: string; email?: string; name?: string } = {},
) {
  const id = opts.id ?? `u_${Math.random().toString(36).slice(2, 10)}`
  const email = opts.email ?? `${id}@example.com`
  const name = opts.name ?? 'Tester'
  const token = `tok_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
  await sql`insert into "user" (id, name, email, email_verified) values (${id}, ${name}, ${email}, true)`
  await sql`insert into "players" (user_id) values (${id})`
  await sql`insert into "session" (id, expires_at, token, user_id) values (${'s_' + id}, now() + interval '1 day', ${token}, ${id})`
  return { id, email, name, token, cookie: `maf.session_token=${signSessionToken(token)}` }
}

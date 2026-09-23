import { and, desc, eq, lt, or, sql } from 'drizzle-orm'
import { screenText } from '@maf/shared/moderation/index'
import type { WishInput } from '@maf/shared/schemas'
import { db } from '../db/client'
import { wishReports, wishes, type WishRow } from '../db/schema/index'
import { ApiError } from '../middleware/error'
import { publishWish, type WishEvent } from './wishStream'
import { metrics } from '../metrics'

export const toEvent = (w: WishRow): WishEvent => ({
  id: w.id,
  createdAt: w.createdAt.toISOString(),
  displayName: w.displayName,
  text: w.text,
  color: w.color,
  lang: w.lang,
})

export const publicWish = (w: WishRow) => ({ ...toEvent(w), status: w.status, mine: false })

export async function createWish(
  input: WishInput,
  ctx: { userId: string | null; ipHash: string | null; fallbackName: string },
) {
  const verdict = screenText(`${input.name ?? ''} ${input.text}`)
  if (verdict === 'hard') throw new ApiError(400, 'INAPPROPRIATE', 'Wish contains blocked words')
  if (verdict === 'link') throw new ApiError(400, 'NO_LINKS', 'Links are not allowed')
  const status = verdict === 'soft' ? 'pending' : 'visible'
  const displayName = input.name && input.name.length > 0 ? input.name : ctx.fallbackName
  const [row] = await db
    .insert(wishes)
    .values({
      userId: ctx.userId,
      displayName,
      text: input.text,
      color: input.color,
      lang: input.lang,
      status,
      ipHash: ctx.ipHash,
    })
    .returning()
  metrics.wishesCreated.inc({ status })
  if (status === 'visible') await publishWish(toEvent(row))
  return { ...publicWish(row), mine: true }
}

const encodeCursor = (w: { createdAt: Date; id: string }) =>
  Buffer.from(`${w.createdAt.toISOString()}|${w.id}`).toString('base64url')
const decodeCursor = (c: string) => {
  const [iso, id] = Buffer.from(c, 'base64url').toString().split('|')
  const at = new Date(iso)
  if (!id || Number.isNaN(at.getTime())) throw new ApiError(400, 'BAD_CURSOR')
  return { at, id }
}

export async function listWishes(opts: {
  cursor?: string
  limit: number
  viewerId: string | null
}) {
  const where = [eq(wishes.status, 'visible')]
  if (opts.cursor) {
    const { at, id } = decodeCursor(opts.cursor)
    where.push(or(lt(wishes.createdAt, at), and(eq(wishes.createdAt, at), lt(wishes.id, id)))!)
  }
  const rows = await db
    .select()
    .from(wishes)
    .where(and(...where))
    .orderBy(desc(wishes.createdAt), desc(wishes.id))
    .limit(opts.limit + 1)
  const page = rows.slice(0, opts.limit)
  return {
    items: page.map((w) => ({
      ...publicWish(w),
      mine: !!opts.viewerId && w.userId === opts.viewerId,
    })),
    nextCursor: rows.length > opts.limit ? encodeCursor(page[page.length - 1]) : null,
  }
}

export async function myPendingWishes(userId: string) {
  const rows = await db
    .select()
    .from(wishes)
    .where(and(eq(wishes.userId, userId), eq(wishes.status, 'pending')))
    .orderBy(desc(wishes.createdAt))
    .limit(10)
  return rows.map((w) => ({ ...publicWish(w), mine: true }))
}

const AUTO_HIDE_REPORTS = 3

export async function reportWish(wishId: string, reporterKey: string, reason: string | undefined) {
  const inserted = await db
    .insert(wishReports)
    .values({ wishId, reporterKey, reason })
    .onConflictDoNothing()
    .returning({ wishId: wishReports.wishId })
  if (inserted.length === 0) return { reported: true, duplicate: true }
  const [row] = await db
    .update(wishes)
    .set({
      reportCount: sql`${wishes.reportCount} + 1`,
      status: sql`case when ${wishes.status} = 'visible' and ${wishes.reportCount} + 1 >= ${AUTO_HIDE_REPORTS} then 'pending'::wish_status else ${wishes.status} end`,
    })
    .where(eq(wishes.id, wishId))
    .returning({ status: wishes.status, reportCount: wishes.reportCount })
  if (!row) throw new ApiError(404, 'WISH_NOT_FOUND')
  return { reported: true, duplicate: false, status: row.status }
}

export async function adminListWishes(status: WishRow['status'], limit = 50) {
  return db
    .select()
    .from(wishes)
    .where(eq(wishes.status, status))
    .orderBy(desc(wishes.createdAt))
    .limit(limit)
}

export async function adminSetStatus(wishId: string, status: WishRow['status']) {
  const [row] = await db.update(wishes).set({ status }).where(eq(wishes.id, wishId)).returning()
  if (!row) throw new ApiError(404, 'WISH_NOT_FOUND')
  if (status === 'visible') await publishWish(toEvent(row))
  return publicWish(row)
}

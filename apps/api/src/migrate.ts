import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, sql } from './db/client'
import { logger } from './logger'

const here = path.dirname(fileURLToPath(import.meta.url))
// works both from src/ (tsx) and dist/ (bundle): the drizzle folder sits next to either
const folder = [path.resolve(here, '../drizzle'), path.resolve(here, 'drizzle')].find((p) =>
  existsSync(path.join(p, 'meta', '_journal.json')),
)

async function main() {
  if (!folder) {
    logger.info('no migrations folder with a journal yet; skipping')
    return
  }
  // advisory lock so concurrent instances never race on migrations
  await sql`select pg_advisory_lock(hashtext('maf_migrate'))`
  try {
    await migrate(db, { migrationsFolder: folder })
    logger.info({ folder }, 'migrations applied')
  } finally {
    await sql`select pg_advisory_unlock(hashtext('maf_migrate'))`
  }
}

main()
  .catch((err) => {
    logger.error({ err }, 'migration failed')
    process.exitCode = 1
  })
  .finally(() => sql.end({ timeout: 5 }))

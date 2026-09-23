import { fileURLToPath } from 'node:url'
import path from 'node:path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

export default async function setup() {
  const url = process.env.DATABASE_URL ?? 'postgres://maf:maf@localhost:5432/maf_test'
  const sql = postgres(url, { max: 1 })
  const here = path.dirname(fileURLToPath(import.meta.url))
  await migrate(drizzle(sql), { migrationsFolder: path.resolve(here, '../../drizzle') })
  await sql.end()
}

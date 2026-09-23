import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { env, isTest } from '../env'
import * as schema from './schema/index'

export const sql = postgres(env.DATABASE_URL, {
  max: isTest ? 4 : 10,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: true,
})

export const db = drizzle(sql, { schema, casing: 'snake_case' })
export type Db = typeof db

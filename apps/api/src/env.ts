import { existsSync } from 'node:fs'
import { z } from 'zod'

// Local development convenience: load apps/api/.env when present (never in production images).
if (process.env.NODE_ENV !== 'production' && existsSync('.env')) {
  process.loadEnvFile('.env')
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  PUBLIC_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  DAILY_SEED_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  ADMIN_EMAILS: z
    .string()
    .default('')
    .transform((s) =>
      s
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
  SESSION_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  METRICS_TOKEN: z.string().optional(),
})

export type Env = z.infer<typeof EnvSchema>

function load(): Env {
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ')
    throw new Error(`Invalid environment:\n  ${issues}`)
  }
  return parsed.data
}

export const env = load()
export const isProd = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

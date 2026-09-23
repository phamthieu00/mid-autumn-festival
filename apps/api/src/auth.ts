import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client'
import { account, session, user, verification } from './db/schema/index'
import { env, isProd } from './env'
import { ensurePlayer } from './services/players'

export const auth = betterAuth({
  appName: 'Đêm Trăng Rằm',
  baseURL: env.PUBLIC_ORIGIN,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.PUBLIC_ORIGIN],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: 'select_account',
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  advanced: {
    useSecureCookies: isProd && env.PUBLIC_ORIGIN.startsWith('https://'),
    cookiePrefix: 'maf',
    defaultCookieAttributes: { sameSite: 'lax', httpOnly: true, path: '/' },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (u) => {
          await ensurePlayer(u.id, u.image ?? null)
        },
      },
    },
  },
})

export type AuthSession = typeof auth.$Infer.Session
export type AuthUser = AuthSession['user']

import { createContext, useCallback, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { MeResponse } from '@maf/shared/api'
import { api } from '@/lib/api'
import { authClient } from '@/lib/authClient'

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: MeResponse['user']
  player: MeResponse['player']
  badges: NonNullable<MeResponse['badges']>
  isAdmin: boolean
  needsNickname: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

export const ME_QUERY_KEY = ['me'] as const

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession()
  const qc = useQueryClient()
  const me = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => api<MeResponse>('/me'),
    enabled: !session.isPending,
  })

  const signIn = useCallback(async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.pathname + window.location.search,
    })
  }, [])

  const signOut = useCallback(async () => {
    await authClient.signOut()
    await qc.invalidateQueries({ queryKey: ME_QUERY_KEY })
  }, [qc])

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ME_QUERY_KEY })
  }, [qc])

  const value = useMemo<AuthContextValue>(() => {
    const loading = session.isPending || (me.isPending && !me.data)
    const user = me.data?.user ?? null
    return {
      status: loading ? 'loading' : user ? 'authenticated' : 'anonymous',
      user,
      player: me.data?.player ?? null,
      badges: me.data?.badges ?? [],
      isAdmin: me.data?.isAdmin ?? false,
      needsNickname: !!user && !me.data?.player?.nickname,
      signIn,
      signOut,
      refresh,
    }
  }, [session.isPending, me.isPending, me.data, signIn, signOut, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

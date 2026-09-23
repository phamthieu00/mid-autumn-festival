import { useCallback, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { GameId } from '@maf/shared/games/ids'
import type { SessionMode } from '@maf/shared/games/rules'
import type { AnswerResponse, FinishResponse, StartSessionResponse } from '@maf/shared/api'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { useT } from '@/i18n'

export type SessionState = 'idle' | 'starting' | 'online' | 'offline' | 'finished'

export type StartOutcome =
  | { kind: 'online'; session: StartSessionResponse }
  | { kind: 'offline' }
  | { kind: 'blocked'; error: ApiError }

export interface GameSession {
  state: SessionState
  mode: SessionMode
  setMode: (mode: SessionMode) => void
  current: StartSessionResponse | null
  result: FinishResponse | null
  error: ApiError | null
  start: (mode?: SessionMode) => Promise<StartOutcome>
  answer: (index: number, option: number) => Promise<AnswerResponse | null>
  finish: (body: unknown) => Promise<FinishResponse | null>
}

/**
 * Server-issued game session: `start()` asks the API for a seed (falls back to offline play when
 * the API is unreachable), `finish()` submits the verified payload and returns ranks/badges.
 */
export function useGameSession(gameId: GameId): GameSession {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { t } = useT()
  const location = useLocation()
  const [mode, setMode] = useState<SessionMode>(() =>
    new URLSearchParams(location.search).get('mode') === 'daily' ? 'daily' : 'free',
  )
  const [state, setState] = useState<SessionState>('idle')
  const [current, setCurrent] = useState<StartSessionResponse | null>(null)
  const [result, setResult] = useState<FinishResponse | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const currentRef = useRef<StartSessionResponse | null>(null)

  const start = useCallback(
    async (override?: SessionMode): Promise<StartOutcome> => {
      const m = override ?? mode
      setState('starting')
      setResult(null)
      setError(null)
      try {
        const session = await api<StartSessionResponse>(`/games/${gameId}/sessions`, {
          method: 'POST',
          body: { mode: m },
        })
        currentRef.current = session
        setCurrent(session)
        setState('online')
        return { kind: 'online', session }
      } catch (err) {
        const e = err instanceof ApiError ? err : new ApiError(0, 'NETWORK', String(err))
        currentRef.current = null
        setCurrent(null)
        setError(e)
        if (e.status >= 400 && e.status < 500 && e.status !== 404) {
          setState('idle')
          const msg =
            e.code === 'ALREADY_PLAYED'
              ? t('games.shared.dailyDone')
              : e.code === 'LOGIN_REQUIRED'
                ? t('games.shared.dailyNeedsLogin')
                : e.code === 'RATE_LIMITED'
                  ? t('games.shared.rateLimited')
                  : e.message
          toast(msg, 'warn')
          return { kind: 'blocked', error: e }
        }
        setState('offline')
        toast(t('auth.offline'), 'warn')
        return { kind: 'offline' }
      }
    },
    [gameId, mode, t, toast],
  )

  const answer = useCallback(async (index: number, option: number) => {
    const s = currentRef.current
    if (!s) return null
    try {
      return await api<AnswerResponse>(`/sessions/${s.sessionId}/answer`, {
        method: 'POST',
        body: { index, option },
      })
    } catch (err) {
      setError(err as ApiError)
      return null
    }
  }, [])

  const finish = useCallback(
    async (body: unknown) => {
      const s = currentRef.current
      if (!s) return null
      try {
        const res = await api<FinishResponse>(`/sessions/${s.sessionId}/finish`, {
          method: 'POST',
          body,
        })
        setResult(res)
        setState('finished')
        void qc.invalidateQueries({ queryKey: ['leaderboard'] })
        void qc.invalidateQueries({ queryKey: ['daily'] })
        void qc.invalidateQueries({ queryKey: ['me'] })
        return res
      } catch (err) {
        const e = err instanceof ApiError ? err : new ApiError(0, 'NETWORK', String(err))
        setError(e)
        setState(e.isNetwork ? 'offline' : 'idle')
        if (e.code === 'REJECTED') toast(t('games.shared.rejected', { reason: e.message }), 'warn')
        else if (e.isNetwork) toast(t('auth.offline'), 'warn')
        return null
      } finally {
        currentRef.current = null
      }
    },
    [qc, t, toast],
  )

  return useMemo(
    () => ({ state, mode, setMode, current, result, error, start, answer, finish }),
    [state, mode, current, result, error, start, answer, finish],
  )
}

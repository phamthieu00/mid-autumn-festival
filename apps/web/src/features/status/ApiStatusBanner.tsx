import { useQuery } from '@tanstack/react-query'
import { CloudOff } from 'lucide-react'
import { useT } from '@/i18n'
import { api, ApiError } from '@/lib/api'

interface Health {
  ok: boolean
  db: 'up' | 'down'
  redis: 'up' | 'down'
  degraded: boolean
}

/** Polls /api/health once a minute and warns when the server is unreachable or its database is down. */
export function ApiStatusBanner() {
  const { t } = useT()
  const q = useQuery({
    queryKey: ['health'],
    queryFn: () => api<Health>('/health', { timeoutMs: 4000 }),
    refetchInterval: 60_000,
    retry: 1,
    staleTime: 30_000,
  })
  // no banner when the API simply is not wired to this origin (games and wishes fall back to local storage)
  const notConfigured =
    q.isError && q.error instanceof ApiError && q.error.code === 'NOT_CONFIGURED'
  const down = (q.isError && !notConfigured) || (q.data && !q.data.ok)
  if (!down) return null
  return (
    <div
      role="status"
      className="bg-lantern-500/15 text-lantern-200 border-lantern-500/30 relative z-20 border-b px-4 py-2 text-center text-sm"
    >
      <CloudOff className="mr-1.5 inline size-4 align-text-bottom" />
      {t('status.apiDown')}
    </div>
  )
}

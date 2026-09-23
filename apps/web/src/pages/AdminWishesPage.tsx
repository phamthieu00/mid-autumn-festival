import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { WishItem } from '@maf/shared/api'
import { useT } from '@/i18n'
import { api } from '@/lib/api'
import { SEO } from '@/components/SEO'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'

type AdminWish = WishItem & { reportCount: number; userId: string | null }

export default function AdminWishesPage() {
  const { t } = useT()
  const { isAdmin, status } = useAuth()
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['admin', 'wishes', 'pending'],
    queryFn: () => api<{ items: AdminWish[] }>('/admin/wishes?status=pending'),
    enabled: isAdmin,
  })
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'visible' | 'hidden' }) =>
      api(`/admin/wishes/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'wishes'] }),
  })
  if (status === 'loading') return null
  if (!isAdmin) return <p className="text-cream/60 p-16 text-center">{t('admin.forbidden')}</p>
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SEO title={t('admin.title')} />
      <h1 className="font-display text-glow text-moon-500 mb-6 text-3xl">{t('admin.title')}</h1>
      {q.data?.items.length === 0 && <p className="text-cream/60">{t('admin.empty')}</p>}
      <ul className="space-y-3">
        {q.data?.items.map((w) => (
          <li key={w.id} className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm">{w.text}</p>
              <p className="text-cream/50 text-xs">
                — {w.displayName} · {new Date(w.createdAt).toLocaleString()} ·{' '}
                {t('admin.reports', { count: w.reportCount })}
              </p>
            </div>
            <Button size="sm" onClick={() => setStatus.mutate({ id: w.id, status: 'visible' })}>
              {t('admin.approve')}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setStatus.mutate({ id: w.id, status: 'hidden' })}
            >
              {t('admin.hide')}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

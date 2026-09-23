import { lazy, Suspense, useMemo, useState } from 'react'
import { useT } from '@/i18n'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { LanternReleaseCss } from './LanternReleaseCss'
import { isWebGLAvailable } from './three/webgl'
import type { Wish } from './types'

const Lantern3D = lazy(() => import('./LanternRelease3D'))

export function LanternRelease({
  wish,
  origin,
  onDone,
}: {
  wish: Wish
  origin: { x: number; y: number }
  onDone: () => void
}) {
  const { t } = useT()
  const reduced = usePrefersReducedMotion()
  const webgl = useMemo(() => isWebGLAvailable(), [])
  const [fallback, setFallback] = useState(false)
  const use3d = !reduced && webgl && !fallback

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[55]"
      role="presentation"
      aria-hidden={false}
    >
      <p className="sr-only" role="status">
        {t('wishes.releaseAria')}
      </p>
      {use3d ? (
        <Suspense fallback={null}>
          <Lantern3D wish={wish} origin={origin} onDone={onDone} onFail={() => setFallback(true)} />
        </Suspense>
      ) : (
        <LanternReleaseCss wish={wish} origin={origin} reduced={reduced} onDone={onDone} />
      )}
    </div>
  )
}

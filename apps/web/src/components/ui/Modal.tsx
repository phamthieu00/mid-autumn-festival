import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useT } from '@/i18n'

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  dismissible = true,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  className?: string
  dismissible?: boolean
}) {
  const { t } = useT()
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
    )
    ;(focusable ?? panelRef.current)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      ;(lastFocused.current as HTMLElement | null)?.focus?.()
    }
  }, [open, onClose, dismissible])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="bg-night-950/70 absolute inset-0 backdrop-blur-sm"
            onClick={dismissible ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={cn(
              'glass bg-night-800/90 relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 outline-none sm:p-8',
              className,
            )}
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {dismissible && (
              <button
                onClick={onClose}
                aria-label={t('common.close')}
                className="text-cream/60 hover:text-cream absolute top-4 right-4 rounded-full p-2 transition hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            )}
            {title && (
              <h3 className="font-display text-glow text-moon-500 mb-4 pr-8 text-2xl sm:text-3xl">
                {title}
              </h3>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

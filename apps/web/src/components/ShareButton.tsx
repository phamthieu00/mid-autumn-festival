import { Share2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useT } from '@/i18n'

export function ShareButton({
  text,
  url,
  children,
  ...props
}: ButtonProps & { text: string; url?: string }) {
  const { t } = useT()
  const { toast } = useToast()

  const share = async () => {
    const target = url ?? window.location.origin
    try {
      if (navigator.share) {
        await navigator.share({ text, url: target })
        return
      }
      await navigator.clipboard.writeText(`${text} ${target}`)
      toast(t('common.copied'), 'success')
    } catch {
      /* user cancelled */
    }
  }

  return (
    <Button variant="secondary" onClick={share} {...props}>
      <Share2 className="size-4" />
      {children ?? t('common.share')}
    </Button>
  )
}

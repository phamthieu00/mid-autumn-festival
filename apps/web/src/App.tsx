import { RouterProvider } from 'react-router-dom'
import { I18nProvider } from '@/i18n'
import { AudioProvider } from '@/lib/audio/AudioProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { router } from './router'

export default function App() {
  return (
    <I18nProvider>
      <AudioProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AudioProvider>
    </I18nProvider>
  )
}

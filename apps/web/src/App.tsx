import { RouterProvider } from 'react-router-dom'
import { I18nProvider } from '@/i18n'
import { AudioProvider } from '@/lib/audio/AudioProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { router } from './router'

export default function App() {
  return (
    <I18nProvider>
      <AudioProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </QueryClientProvider>
        </ToastProvider>
      </AudioProvider>
    </I18nProvider>
  )
}

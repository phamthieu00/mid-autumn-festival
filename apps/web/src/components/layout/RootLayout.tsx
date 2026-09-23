import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { NightSky } from '@/components/sky/NightSky'
import { Header } from './Header'
import { Footer } from './Footer'
import { PageSpinner } from '@/components/ui/Spinner'
import { SEO } from '@/components/SEO'
import { NicknameModal } from '@/features/auth/NicknameModal'
import { ApiStatusBanner } from '@/features/status/ApiStatusBanner'

export function RootLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <SEO />
      <NightSky />
      <Header />
      <ApiStatusBanner />
      <main className="relative z-10 flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <NicknameModal />
      <ScrollRestoration />
    </div>
  )
}

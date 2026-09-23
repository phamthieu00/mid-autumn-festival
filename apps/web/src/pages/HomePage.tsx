import { HeroSection } from '@/sections/HeroSection'
import { StorySection } from '@/sections/StorySection'
import { TraditionsSection } from '@/sections/TraditionsSection'
import { GamesPreviewSection } from '@/sections/GamesPreviewSection'
import { DailySection } from '@/features/daily/DailySection'
import { WishesSection } from '@/sections/WishesSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <TraditionsSection />
      <DailySection />
      <GamesPreviewSection />
      <WishesSection />
    </>
  )
}

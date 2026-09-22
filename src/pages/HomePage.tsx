import { HeroSection } from '@/sections/HeroSection'
import { StorySection } from '@/sections/StorySection'
import { TraditionsSection } from '@/sections/TraditionsSection'
import { GamesPreviewSection } from '@/sections/GamesPreviewSection'
import { WishesSection } from '@/sections/WishesSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <TraditionsSection />
      <GamesPreviewSection />
      <WishesSection />
    </>
  )
}

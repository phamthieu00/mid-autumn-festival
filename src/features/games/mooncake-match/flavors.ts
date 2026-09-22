import { Bean, Cherry, Coffee, Cookie, Egg, Leaf, Nut, Sprout, type LucideIcon } from 'lucide-react'
import type { TranslationKey } from '@/i18n'

export interface Flavor {
  id: string
  labelKey: TranslationKey
  color: string
  icon: LucideIcon
}

export const FLAVORS: Flavor[] = [
  { id: 'thapCam', labelKey: 'games.match.flavors.thapCam', color: '#c8862a', icon: Nut },
  { id: 'dauXanh', labelKey: 'games.match.flavors.dauXanh', color: '#7ab35a', icon: Bean },
  { id: 'trungMuoi', labelKey: 'games.match.flavors.trungMuoi', color: '#e8a33d', icon: Egg },
  { id: 'khoaiMon', labelKey: 'games.match.flavors.khoaiMon', color: '#9b7bd1', icon: Sprout },
  { id: 'hatSen', labelKey: 'games.match.flavors.hatSen', color: '#f0d9a8', icon: Cookie },
  { id: 'tra', labelKey: 'games.match.flavors.tra', color: '#4f9a6a', icon: Leaf },
  { id: 'sauRieng', labelKey: 'games.match.flavors.sauRieng', color: '#e9d05a', icon: Cherry },
  { id: 'socola', labelKey: 'games.match.flavors.socola', color: '#6b3f2a', icon: Coffee },
]

export const flavorById = (id: string) => FLAVORS.find((f) => f.id === id)!

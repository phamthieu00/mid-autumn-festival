import { Bean, Cherry, Coffee, Cookie, Egg, Leaf, Nut, Sprout, type LucideIcon } from 'lucide-react'
import { FLAVOR_IDS, type FlavorId } from '@maf/shared/games/match/flavorIds'
import type { TranslationKey } from '@/i18n'

export interface Flavor {
  id: FlavorId
  labelKey: TranslationKey
  color: string
  icon: LucideIcon
}

const META: Record<FlavorId, Omit<Flavor, 'id'>> = {
  thapCam: { labelKey: 'games.match.flavors.thapCam', color: '#c8862a', icon: Nut },
  dauXanh: { labelKey: 'games.match.flavors.dauXanh', color: '#7ab35a', icon: Bean },
  trungMuoi: { labelKey: 'games.match.flavors.trungMuoi', color: '#e8a33d', icon: Egg },
  khoaiMon: { labelKey: 'games.match.flavors.khoaiMon', color: '#9b7bd1', icon: Sprout },
  hatSen: { labelKey: 'games.match.flavors.hatSen', color: '#f0d9a8', icon: Cookie },
  tra: { labelKey: 'games.match.flavors.tra', color: '#4f9a6a', icon: Leaf },
  sauRieng: { labelKey: 'games.match.flavors.sauRieng', color: '#e9d05a', icon: Cherry },
  socola: { labelKey: 'games.match.flavors.socola', color: '#6b3f2a', icon: Coffee },
}

export const FLAVORS: Flavor[] = FLAVOR_IDS.map((id) => ({ id, ...META[id] }))

export const flavorById = (id: string) => FLAVORS.find((f) => f.id === id)!

import type { LanternColor } from '@/components/ui/lanternColors'

export interface Wish {
  id: string
  name?: string
  text: string
  color: LanternColor
  createdAt: number
}

export interface WishesStorage {
  version: 1
  items: Wish[]
}

export const WISH_TEXT_MAX = 120
export const WISH_NAME_MAX = 20
export const WISHES_CAP = 100
export const WISHES_VISIBLE = 30

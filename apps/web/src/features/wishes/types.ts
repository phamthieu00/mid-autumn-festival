import type { LanternColor } from '@maf/shared/wishes'
export { WISH_NAME_MAX, WISH_TEXT_MAX, WISHES_CAP, WISHES_VISIBLE } from '@maf/shared/wishes'

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

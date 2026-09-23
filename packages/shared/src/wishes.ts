export const LANTERN_COLOR_IDS = ['red', 'gold', 'orange', 'pink'] as const
export type LanternColor = (typeof LANTERN_COLOR_IDS)[number]

export const WISH_TEXT_MAX = 120
export const WISH_NAME_MAX = 20
export const WISHES_CAP = 100
export const WISHES_VISIBLE = 30

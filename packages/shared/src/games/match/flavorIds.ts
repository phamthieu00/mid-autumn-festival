/** Mooncake flavour ids in canonical order; decks are built from this list on both client and server. */
export const FLAVOR_IDS = [
  'thapCam',
  'dauXanh',
  'trungMuoi',
  'khoaiMon',
  'hatSen',
  'tra',
  'sauRieng',
  'socola',
] as const
export type FlavorId = (typeof FLAVOR_IDS)[number]

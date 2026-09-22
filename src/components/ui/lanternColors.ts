export type LanternColor = 'red' | 'gold' | 'orange' | 'pink'

export const LANTERN_COLORS: Record<LanternColor, { body: string; light: string; glow: string }> = {
  red: { body: '#e63946', light: '#ff8c8c', glow: 'rgba(230,57,70,0.7)' },
  gold: { body: '#f4c15d', light: '#fff1b8', glow: 'rgba(244,193,93,0.7)' },
  orange: { body: '#ff6b35', light: '#ffc194', glow: 'rgba(255,107,53,0.7)' },
  pink: { body: '#ff8fb1', light: '#ffd6e3', glow: 'rgba(255,143,177,0.7)' },
}

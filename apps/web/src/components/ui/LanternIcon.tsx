import type { SVGProps } from 'react'

import { LANTERN_COLORS, type LanternColor } from './lanternColors'

export type { LanternColor }

export function LanternIcon({
  color = 'red',
  glow = true,
  ...props
}: SVGProps<SVGSVGElement> & { color?: LanternColor; glow?: boolean }) {
  const c = LANTERN_COLORS[color]
  const id = `lg-${color}`
  return (
    <svg
      viewBox="0 0 64 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={glow ? { filter: `drop-shadow(0 0 10px ${c.glow})` } : undefined}
      {...props}
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="60%" stopColor={c.body} />
          <stop offset="100%" stopColor={c.body} stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <line x1="32" y1="0" x2="32" y2="10" stroke="#f4c15d" strokeWidth="2" />
      <rect x="20" y="10" width="24" height="7" rx="2" fill="#b8860b" />
      <ellipse cx="32" cy="48" rx="26" ry="31" fill={`url(#${id})`} />
      <path d="M18 22 Q14 48 18 74" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      <path d="M32 17 Q30 48 32 79" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      <path d="M46 22 Q50 48 46 74" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      <rect x="20" y="78" width="24" height="7" rx="2" fill="#b8860b" />
      <line x1="26" y1="85" x2="24" y2="100" stroke="#f4c15d" strokeWidth="2" />
      <line x1="32" y1="85" x2="32" y2="100" stroke="#f4c15d" strokeWidth="2" />
      <line x1="38" y1="85" x2="40" y2="100" stroke="#f4c15d" strokeWidth="2" />
    </svg>
  )
}

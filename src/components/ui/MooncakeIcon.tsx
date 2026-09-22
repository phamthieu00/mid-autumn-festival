import type { SVGProps } from 'react'

export function MooncakeIcon({
  color = '#e0a52a',
  ...props
}: SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <radialGradient id="mc-shade" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <path
        d="M50 6 L58 12 L68 10 L73 19 L83 22 L84 32 L92 39 L88 48 L92 58 L84 65 L83 75 L73 78 L68 87 L58 85 L50 92 L42 85 L32 87 L27 78 L17 75 L16 65 L8 58 L12 48 L8 39 L16 32 L17 22 L27 19 L32 10 L42 12 Z"
        fill={color}
      />
      <path
        d="M50 6 L58 12 L68 10 L73 19 L83 22 L84 32 L92 39 L88 48 L92 58 L84 65 L83 75 L73 78 L68 87 L58 85 L50 92 L42 85 L32 87 L27 78 L17 75 L16 65 L8 58 L12 48 L8 39 L16 32 L17 22 L27 19 L32 10 L42 12 Z"
        fill="url(#mc-shade)"
      />
      <circle cx="50" cy="49" r="26" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
      <circle cx="50" cy="49" r="16" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
      <path d="M50 33 L54 45 L66 49 L54 53 L50 65 L46 53 L34 49 L46 45 Z" fill="rgba(0,0,0,0.3)" />
    </svg>
  )
}

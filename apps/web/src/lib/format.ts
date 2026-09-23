export const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0')

export function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`
}

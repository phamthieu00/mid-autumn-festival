/** Map a screen pixel to world coordinates on the z=0 plane for a perspective camera at (0,0,camZ). */
export function screenToWorld(
  x: number,
  y: number,
  vw: number,
  vh: number,
  camZ: number,
  fovDeg: number,
): { x: number; y: number } {
  const halfH = camZ * Math.tan((fovDeg * Math.PI) / 360)
  const halfW = halfH * (vw / vh)
  return { x: ((x / vw) * 2 - 1) * halfW, y: (1 - (y / vh) * 2) * halfH }
}

import * as THREE from 'three'

function emberTexture() {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,240,200,1)')
  g.addColorStop(0.4, 'rgba(255,176,114,0.8)')
  g.addColorStop(1, 'rgba(255,107,53,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function buildEmbers(count = 80) {
  const positions = new Float32Array(count * 3)
  const alphas = new Float32Array(count)
  const vel = new Float32Array(count * 3)
  const life = new Float32Array(count)
  const maxLife = new Float32Array(count)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const tex = emberTexture()
  const mat = new THREE.PointsMaterial({
    size: 0.09,
    map: tex,
    color: 0xffb072,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  let acc = 0

  for (let i = 0; i < count; i++) positions[i * 3 + 1] = -100

  return {
    points,
    update(dt: number, emitter: THREE.Vector3, rate: number, alpha: number) {
      acc += rate * dt
      for (let i = 0; i < count; i++) {
        if (life[i] > 0) {
          life[i] -= dt
          positions[i * 3] += vel[i * 3] * dt
          positions[i * 3 + 1] += vel[i * 3 + 1] * dt
          positions[i * 3 + 2] += vel[i * 3 + 2] * dt
          vel[i * 3] *= 0.98
          alphas[i] = Math.max(0, life[i] / maxLife[i])
          if (life[i] <= 0) positions[i * 3 + 1] = -100
        } else if (acc >= 1) {
          acc -= 1
          const a = Math.random() * Math.PI * 2
          const rr = Math.random() * 0.15
          positions[i * 3] = emitter.x + Math.cos(a) * rr
          positions[i * 3 + 1] = emitter.y - 0.6 + Math.random() * 0.2
          positions[i * 3 + 2] = emitter.z + Math.sin(a) * rr
          vel[i * 3] = (Math.random() - 0.5) * 0.3
          vel[i * 3 + 1] = 0.3 + Math.random() * 0.3
          vel[i * 3 + 2] = (Math.random() - 0.5) * 0.2
          maxLife[i] = 0.8 + Math.random() * 0.8
          life[i] = maxLife[i]
        }
      }
      ;(geo.attributes.position as THREE.BufferAttribute).needsUpdate = true
      mat.opacity = alpha
    },
    dispose() {
      geo.dispose()
      mat.dispose()
      tex.dispose()
    },
  }
}

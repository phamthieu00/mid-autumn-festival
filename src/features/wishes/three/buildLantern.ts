import * as THREE from 'three'

export interface LanternColors {
  body: string
  light: string
  glow: string
}

function glowTexture(color: string) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, color)
  g.addColorStop(0.4, color.replace(/[\d.]+\)$/, '0.35)'))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function buildLantern(colors: LanternColors) {
  const group = new THREE.Group()
  const disposables: { dispose(): void }[] = []

  // paper body: lathe profile with gentle ribs
  const profile: THREE.Vector2[] = []
  const steps = 22
  for (let i = 0; i <= steps; i++) {
    const v = i / steps // 0 bottom -> 1 top
    const y = (v - 0.5) * 1.5
    const r = 0.62 * Math.sin(Math.PI * v) ** 0.55 + 0.02
    profile.push(new THREE.Vector2(r, y))
  }
  const bodyGeo = new THREE.LatheGeometry(profile, 48)
  const pos = bodyGeo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const theta = Math.atan2(z, x)
    const k = 1 + 0.025 * Math.sin(12 * theta)
    pos.setX(i, x * k)
    pos.setZ(i, z * k)
  }
  bodyGeo.computeVertexNormals()
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.body),
    emissive: new THREE.Color(colors.body),
    emissiveIntensity: 0.55,
    roughness: 0.75,
    metalness: 0,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  group.add(body)
  disposables.push(bodyGeo, bodyMat)

  const capGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.06, 24)
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xb8860b,
    metalness: 0.6,
    roughness: 0.4,
    transparent: true,
  })
  const capTop = new THREE.Mesh(capGeo, capMat)
  capTop.position.y = 0.78
  const capBottom = new THREE.Mesh(capGeo, capMat)
  capBottom.position.y = -0.78
  capBottom.rotation.x = Math.PI
  group.add(capTop, capBottom)
  disposables.push(capGeo, capMat)

  const lineMat = new THREE.LineBasicMaterial({ color: 0xf4c15d, transparent: true })
  disposables.push(lineMat)
  const hangerGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.81, 0),
    new THREE.Vector3(0, 1.06, 0),
  ])
  group.add(new THREE.Line(hangerGeo, lineMat))
  disposables.push(hangerGeo)

  const tassels: THREE.Line[] = []
  for (const dx of [-0.08, 0, 0.08]) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(dx, -0.81, 0),
      new THREE.Vector3(dx * 1.6, -1.16, 0),
    ])
    const line = new THREE.Line(geo, lineMat)
    group.add(line)
    tassels.push(line)
    disposables.push(geo)
  }

  const light = new THREE.PointLight(new THREE.Color(colors.light), 2.5, 6, 2)
  group.add(light)

  const glowTex = glowTexture(colors.glow)
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: new THREE.Color(
      colors.glow.replace(/rgba?\(([^)]+)\)/, (_, inner: string) => {
        const [r, g, b] = inner.split(',').map((v) => Number(v.trim()))
        return `rgb(${r},${g},${b})`
      }),
    ),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.8,
  })
  const glow = new THREE.Sprite(glowMat)
  glow.scale.set(2.4, 2.4, 1)
  group.add(glow)
  disposables.push(glowTex, glowMat)

  return {
    group,
    light,
    setOpacity(o: number) {
      bodyMat.opacity = 0.95 * o
      capMat.opacity = o
      lineMat.opacity = o
      glowMat.opacity = 0.8 * o
    },
    swayTassels(t: number) {
      tassels.forEach((line, i) => {
        line.rotation.z = Math.sin(t * 3 + i) * 0.08
      })
    },
    dispose() {
      for (const d of disposables) d.dispose()
    },
  }
}

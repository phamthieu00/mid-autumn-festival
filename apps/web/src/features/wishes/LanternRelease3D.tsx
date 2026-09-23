import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { LANTERN_COLORS } from '@/components/ui/lanternColors'
import type { Wish } from './types'
import { buildLantern } from './three/buildLantern'
import { buildEmbers } from './three/buildEmbers'
import { lanternPose, RELEASE_DURATION } from './three/timeline'
import { screenToWorld } from './three/screenToWorld'

const CAM_Z = 8
const FOV = 45

export default function LanternRelease3D({
  wish,
  origin,
  onDone,
  onFail,
}: {
  wish: Wish
  origin: { x: number; y: number }
  onDone: () => void
  onFail: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onDone)
  const failRef = useRef(onFail)
  useEffect(() => {
    doneRef.current = onDone
    failRef.current = onFail
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      failRef.current()
      return
    }
    let vw = window.innerWidth
    let vh = window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(vw, vh)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(FOV, vw / vh, 0.1, 100)
    camera.position.z = CAM_Z
    scene.add(new THREE.AmbientLight(0x1f2a5c, 0.6))

    const lantern = buildLantern(LANTERN_COLORS[wish.color])
    scene.add(lantern.group)
    const embers = buildEmbers(80)
    scene.add(embers.points)

    const start = screenToWorld(origin.x, origin.y, vw, vh, CAM_Z, FOV)
    let topY = screenToWorld(vw / 2, -60, vw, vh, CAM_Z, FOV).y

    const onResize = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      renderer.setSize(vw, vh)
      camera.aspect = vw / vh
      camera.updateProjectionMatrix()
      topY = screenToWorld(vw / 2, -60, vw, vh, CAM_Z, FOV).y
    }
    window.addEventListener('resize', onResize)

    const emitter = new THREE.Vector3()
    let raf = 0
    let last = performance.now()
    const t0 = last
    let finished = false

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = (now - t0) / 1000
      const pose = lanternPose(t, start, topY)
      lantern.group.position.set(pose.x, pose.y, 0)
      lantern.group.scale.setScalar(Math.max(0.0001, pose.scale * 0.8))
      lantern.group.rotation.set(pose.tiltX, pose.rotY, 0)
      lantern.light.intensity = pose.light
      lantern.setOpacity(pose.opacity)
      lantern.swayTassels(t)
      emitter.set(pose.x, pose.y, 0)
      embers.update(dt, emitter, pose.emberRate * pose.scale, pose.opacity)
      renderer.render(scene, camera)
      if (t < RELEASE_DURATION + 0.6) raf = requestAnimationFrame(frame)
      else if (!finished) {
        finished = true
        doneRef.current()
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      lantern.dispose()
      embers.dispose()
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [wish.color, origin.x, origin.y])

  return <div ref={ref} className="absolute inset-0" />
}

import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useHQ, volatile } from '../../store/useGame'
import { puffTexture } from '../textures'

interface Props {
  id: string
  position: [number, number, number]
}

const BASE = new THREE.Color('#c29a5e')
const HOT = new THREE.Color('#ff6a1a')

export function DustCloud({ id, position }: Props) {
  const group = useRef<THREE.Group>(null)
  const mats = useRef<THREE.SpriteMaterial[]>([])
  const light = useRef<THREE.PointLight>(null)
  const map = useMemo(() => puffTexture(), [])
  const hq = useHQ()

  const puffs = useMemo(() => {
    let seed = position[0] * 5 + position[2] * 3 + 23
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    return Array.from({ length: 9 }).map(() => ({
      x: (rnd() - 0.5) * 1.5,
      y: 0.45 + rnd() * 1.2,
      z: (rnd() - 0.5) * 1.5,
      s: 1.1 + rnd() * 1.3,
      rot: rnd() * Math.PI * 2,
      spin: (rnd() - 0.5) * 0.5,
      bob: 0.3 + rnd() * 0.5,
    }))
  }, [position])

  useFrame(({ clock }, dt) => {
    const dmg = volatile.damage[id] ?? 0
    const t = clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.y = t * 0.12
      group.current.scale.setScalar(1 + dmg * 0.25 - dmg * dmg * 0.5)
      group.current.children.forEach((c, i) => {
        const p = puffs[i]
        if (!p) return
        c.position.y = p.y + Math.sin(t * p.bob + i) * 0.08
      })
    }
    mats.current.forEach((m, i) => {
      if (!m) return
      m.rotation = puffs[i].rot + t * puffs[i].spin
      m.color.copy(BASE).lerp(HOT, Math.min(1, dmg * 1.4))
      m.opacity += ((0.78 - dmg * 0.5) - m.opacity) * Math.min(1, dt * 8)
    })
    if (light.current) light.current.intensity = dmg * 14
  })

  return (
    <group position={position}>
      <group ref={group}>
        {puffs.map((p, i) => (
          <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.s, p.s, 1]}>
            <spriteMaterial
              ref={(m) => {
                if (m) mats.current[i] = m
              }}
              map={map}
              color="#c29a5e"
              transparent
              opacity={0.78}
              depthWrite={false}
              rotation={p.rot}
            />
          </sprite>
        ))}
      </group>
      <Sparkles count={40} scale={[1.8, 1.8, 1.8]} position={[0, 1, 0]} size={3} speed={0.6} color="#ffd79a" opacity={0.7} />
      <pointLight visible={hq} ref={light} color="#ff7a1a" intensity={0} distance={5} position={[0, 1, 0]} />
    </group>
  )
}

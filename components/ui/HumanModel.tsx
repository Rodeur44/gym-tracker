'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { MuscleGroup } from '@/types'
import * as THREE from 'three'

const ACTIVE = '#A78BFA'
const ACTIVE_EMISSIVE = '#4C1D95'
const BASE = '#1E1E2E'
const BASE_EMISSIVE = '#000000'

type BodyZone = 'torso' | 'arms' | 'legs'

const ZONE_MAP: Record<MuscleGroup, BodyZone[]> = {
  pec: ['torso'],
  dos: ['torso'],
  bras: ['arms'],
  jambes: ['legs'],
  cardio: ['torso', 'arms', 'legs'],
}

function Part({ active, position, rotation, children }: {
  active: boolean
  position: [number, number, number]
  rotation?: [number, number, number]
  children: React.ReactNode
}) {
  return (
    <mesh position={position} rotation={rotation as THREE.Euler | undefined}>
      {children}
      <meshStandardMaterial
        color={active ? ACTIVE : BASE}
        emissive={active ? ACTIVE_EMISSIVE : BASE_EMISSIVE}
        emissiveIntensity={active ? 0.6 : 0}
        roughness={0.55}
        metalness={0.15}
      />
    </mesh>
  )
}

function Head({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.17, 14, 14]} />
      <meshStandardMaterial color={BASE} roughness={0.6} metalness={0.1} />
    </mesh>
  )
}

function Figure({ muscles }: { muscles: MuscleGroup[] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.6
  })

  const zones = new Set(muscles.flatMap(m => ZONE_MAP[m] ?? []))
  const torso = zones.has('torso')
  const arms = zones.has('arms')
  const legs = zones.has('legs')

  return (
    <group ref={groupRef} position={[0, -0.75, 0]}>
      {/* Head */}
      <Head position={[0, 1.72, 0]} />

      {/* Neck */}
      <mesh position={[0, 1.49, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.14, 8]} />
        <meshStandardMaterial color={BASE} roughness={0.6} />
      </mesh>

      {/* Torso */}
      <Part active={torso} position={[0, 1.05, 0]}>
        <boxGeometry args={[0.46, 0.56, 0.22]} />
      </Part>

      {/* Left upper arm */}
      <Part active={arms} position={[-0.34, 1.07, 0]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.07, 0.062, 0.38, 8]} />
      </Part>

      {/* Right upper arm */}
      <Part active={arms} position={[0.34, 1.07, 0]} rotation={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.07, 0.062, 0.38, 8]} />
      </Part>

      {/* Left forearm */}
      <Part active={arms} position={[-0.37, 0.68, 0]} rotation={[0, 0, 0.14]}>
        <cylinderGeometry args={[0.055, 0.048, 0.34, 8]} />
      </Part>

      {/* Right forearm */}
      <Part active={arms} position={[0.37, 0.68, 0]} rotation={[0, 0, -0.14]}>
        <cylinderGeometry args={[0.055, 0.048, 0.34, 8]} />
      </Part>

      {/* Left upper leg */}
      <Part active={legs} position={[-0.13, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.088, 0.44, 8]} />
      </Part>

      {/* Right upper leg */}
      <Part active={legs} position={[0.13, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.088, 0.44, 8]} />
      </Part>

      {/* Left lower leg */}
      <Part active={legs} position={[-0.13, 0.04, 0]}>
        <cylinderGeometry args={[0.078, 0.062, 0.4, 8]} />
      </Part>

      {/* Right lower leg */}
      <Part active={legs} position={[0.13, 0.04, 0]}>
        <cylinderGeometry args={[0.078, 0.062, 0.4, 8]} />
      </Part>

      {/* Feet */}
      <mesh position={[-0.13, -0.2, 0.06]}>
        <boxGeometry args={[0.1, 0.055, 0.22]} />
        <meshStandardMaterial color={BASE} roughness={0.7} />
      </mesh>
      <mesh position={[0.13, -0.2, 0.06]}>
        <boxGeometry args={[0.1, 0.055, 0.22]} />
        <meshStandardMaterial color={BASE} roughness={0.7} />
      </mesh>
    </group>
  )
}

export default function HumanModel({ muscles }: { muscles: MuscleGroup[] }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 2.6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 4, 3]} intensity={1.2} />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#A78BFA" />
      <Figure muscles={muscles} />
    </Canvas>
  )
}

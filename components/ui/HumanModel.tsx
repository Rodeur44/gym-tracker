'use client'

import { useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFBX, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import type { MuscleGroup } from '@/types'

// As more animations are downloaded, add them here
const MODEL_PATH: Partial<Record<MuscleGroup, string>> = {
  pec: '/models/pushup.fbx',
}

const DEFAULT_MODEL = '/models/pushup.fbx'

function Scene({ path }: { path: string }) {
  const fbx = useFBX(path)
  const { actions, names } = useAnimations(fbx.animations, fbx)

  useEffect(() => {
    fbx.traverse(obj => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#A78BFA',
          roughness: 0.4,
          metalness: 0.2,
          emissive: '#3B0764',
          emissiveIntensity: 0.15,
        })
        mesh.castShadow = true
      }
    })
    const first = names[0]
    if (first && actions[first]) {
      actions[first]!.reset().play()
    }
  }, [fbx, actions, names])

  return <primitive object={fbx} scale={0.013} position={[0, -1.3, 0]} />
}

function Placeholder() {
  return (
    <mesh>
      <sphereGeometry args={[0.25, 12, 12]} />
      <meshStandardMaterial color="#1E1E2E" />
    </mesh>
  )
}

export default function HumanModel({ muscles }: { muscles: MuscleGroup[] }) {
  const path = MODEL_PATH[muscles[0]] ?? DEFAULT_MODEL

  return (
    <Canvas
      camera={{ position: [2.2, 1.6, 3.2], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} />
      <pointLight position={[-1, 2, 2]} intensity={1} color="#A78BFA" />
      <Suspense fallback={<Placeholder />}>
        <Scene path={path} />
      </Suspense>
    </Canvas>
  )
}

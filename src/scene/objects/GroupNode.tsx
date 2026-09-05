import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { type ReactNode, useRef } from 'react'
import type { SceneObject } from '../../types/scene'
import { registerObjectRef } from './objectRefs'

interface GroupNodeProps {
  object: SceneObject
  children?: ReactNode
}

/** A pure organisational/transform node for "group" objects — no geometry of
 * its own. Because children render as actual nested Object3Ds inside this
 * group, moving/rotating/scaling the group moves every child with it via
 * ordinary Three.js matrix composition. */
export function GroupNode({ object, children }: GroupNodeProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    group.position.set(object.position[0], object.position[1], object.position[2])
    group.rotation.set(
      THREE.MathUtils.degToRad(object.rotation[0]),
      THREE.MathUtils.degToRad(object.rotation[1]),
      THREE.MathUtils.degToRad(object.rotation[2]),
    )
    group.scale.set(object.scale[0], object.scale[1], object.scale[2])
  })

  if (!object.visible) return null

  return (
    <group
      ref={(g) => {
        groupRef.current = g
        registerObjectRef(object.id, g)
      }}
      userData={{ objectId: object.id }}
    >
      {children}
    </group>
  )
}

import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import { type ReactNode, useMemo, useRef, useState } from 'react'
import type { SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { useTimelineStore } from '../../state/timelineStore'
import { useResolvedGeometry } from './useResolvedGeometry'
import { useMaterialProps } from '../materials/useMaterialProps'
import { useObjectTexture } from '../materials/useObjectTexture'
import { ImportedMesh } from './ImportedMesh'
import { computeInstanceTransforms } from './instanceTransforms'
import { evaluateAnimationPreset } from '../../animation/presets'
import { sampleKeyframes } from '../../animation/keyframes'
import { registerObjectRef } from './objectRefs'
import { runInteractionAction } from '../interactions/runAction'

interface ObjectMeshProps {
  object: SceneObject
  allObjects: SceneObject[]
  children?: ReactNode
}

export function ObjectMesh({ object, allObjects, children: nestedChildren }: ObjectMeshProps) {
  const select = useProjectStore((s) => s.select)
  const selection = useProjectStore((s) => s.selection)
  const openContextMenu = useUIStore((s) => s.openContextMenu)
  const isSelected = selection.includes(object.id)
  const isPrimary = selection[selection.length - 1] === object.id

  const isImported = object.kind === 'imported'
  const geometry = useResolvedGeometry(object, allObjects)
  const materialPropsBase = useMaterialProps(object.material)
  const texture = useObjectTexture(object.material.textureUrl)
  const materialProps = texture ? { ...materialPropsBase, map: texture } : materialPropsBase
  const instances = useMemo(() => computeInstanceTransforms(object.modifiers), [object.modifiers])

  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [activated, setActivated] = useState(false)

  const hoverAction = object.interactions.find((i) => i.trigger === 'hover')
  const clickAction = object.interactions.find((i) => i.trigger === 'click')

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    let posDelta: [number, number, number] = [0, 0, 0]
    let rotDelta: [number, number, number] = [0, 0, 0]
    let scaleMul: [number, number, number] = [1, 1, 1]
    let opacityMul = 1
    let keyframeColor: string | undefined

    if (object.animation.keyframes.length > 0) {
      const time = useTimelineStore.getState().currentTime
      const sample = sampleKeyframes(object.animation, time)
      if (sample.position) posDelta = sample.position
      if (sample.rotation) rotDelta = sample.rotation
      if (sample.scale) scaleMul = sample.scale
      if (sample.opacity !== undefined) opacityMul = sample.opacity
      keyframeColor = sample.color
    } else if (object.animation.preset !== 'none') {
      const anim = evaluateAnimationPreset(object.animation.preset, state.clock.elapsedTime, object.animation.duration)
      posDelta = anim.positionDelta
      rotDelta = anim.rotationDelta
      scaleMul = anim.scaleMultiplier
      opacityMul = anim.opacityMultiplier
    }

    if (hoverAction?.action.type === 'move' && hovered) posDelta = hoverAction.action.delta
    if (hoverAction?.action.type === 'scale' && hovered) scaleMul = [hoverAction.action.amount, hoverAction.action.amount, hoverAction.action.amount]
    if (clickAction?.action.type === 'scale' && (pressed || activated)) {
      const s = clickAction.action.amount
      scaleMul = [scaleMul[0] * s, scaleMul[1] * s, scaleMul[2] * s]
    }
    if (clickAction?.action.type === 'move' && activated) posDelta = clickAction.action.delta

    group.position.set(
      object.position[0] + posDelta[0],
      object.position[1] + posDelta[1],
      object.position[2] + posDelta[2],
    )
    group.rotation.set(
      THREE.MathUtils.degToRad(object.rotation[0] + rotDelta[0]),
      THREE.MathUtils.degToRad(object.rotation[1] + rotDelta[1]),
      THREE.MathUtils.degToRad(object.rotation[2] + rotDelta[2]),
    )
    group.scale.set(object.scale[0] * scaleMul[0], object.scale[1] * scaleMul[1], object.scale[2] * scaleMul[2])

    if (materialRef.current) {
      const targetOpacity = object.material.opacity * opacityMul
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, Math.min(1, delta * 10))
      materialRef.current.transparent = object.material.transparent || targetOpacity < 0.99
      if (hoverAction?.action.type === 'colorChange' && hovered) {
        materialRef.current.color.set(hoverAction.action.color)
      } else if (clickAction?.action.type === 'colorChange' && activated) {
        materialRef.current.color.set(clickAction.action.color)
      } else {
        materialRef.current.color.set(keyframeColor ?? object.material.color)
      }
    }
  })

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (object.locked) return
    e.stopPropagation()
    select(object.id, e.shiftKey)
    setPressed(true)
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (clickAction) {
      setActivated((a) => !a)
      runInteractionAction(clickAction.action, object.id)
    }
  }

  function handleContextMenu(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    e.nativeEvent.preventDefault()
    select(object.id)
    openContextMenu(e.nativeEvent.clientX, e.nativeEvent.clientY, object.id)
  }

  if (!object.visible) return null

  return (
    <group
      ref={(g) => {
        groupRef.current = g
        registerObjectRef(object.id, g)
      }}
      userData={{ objectId: object.id }}
    >
      {isImported ? (
        <ImportedMesh
          object={object}
          selected={isSelected}
          primary={isPrimary}
          onPointerDown={handlePointerDown}
          onPointerUp={() => setPressed(false)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        />
      ) : (
        instances.map((inst, i) => (
        <mesh
          key={i}
          geometry={geometry}
          position={inst.position}
          scale={inst.scale}
          castShadow
          receiveShadow
          onPointerDown={handlePointerDown}
          onPointerUp={() => setPressed(false)}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
            <meshPhysicalMaterial ref={i === 0 ? materialRef : undefined} {...materialProps} />
            {isSelected && (
              // Note: despite its name, drei's `screenspace` prop set to true offsets
              // outline vertices by `thickness` in raw local/object-space units (not
              // pixels) — for a unit-sized primitive that balloons into a shape many
              // times the object's own size. Leaving it false (the default) uses the
              // shader's other branch, which divides by clip-space w and viewport size
              // to produce a thin, constant-pixel-width outline that hugs the mesh.
              <Outlines thickness={isPrimary ? 3 : 1.5} color={isPrimary ? '#6c8cff' : '#a3aefc'} transparent opacity={0.95} />
            )}
          </mesh>
        ))
      )}
      {nestedChildren}
    </group>
  )
}

import * as THREE from 'three'
import { TransformControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { TransformControls as TransformControlsImpl } from 'three-stdlib'
import { useProjectStore } from '../../state/projectStore'
import { useUIStore } from '../../state/uiStore'
import { useObjectRef } from './objectRefs'
import type { TransformMode } from '../../state/projectStore'

const MODE_MAP: Record<TransformMode, 'translate' | 'rotate' | 'scale'> = {
  move: 'translate',
  rotate: 'rotate',
  scale: 'scale',
}

export function TransformGizmo() {
  const selection = useProjectStore((s) => s.selection)
  const transformMode = useProjectStore((s) => s.transformMode)
  const updateObject = useProjectStore((s) => s.updateObject)
  const commit = useProjectStore((s) => s.commit)
  const snapEnabled = useUIStore((s) => s.snapEnabled)
  const primaryId = selection[selection.length - 1]
  const target = useObjectRef(primaryId)
  const controlsRef = useRef<TransformControlsImpl>(null)

  useEffect(() => {
    const controls = controlsRef.current as unknown as THREE.EventDispatcher<Record<string, { value?: unknown }>> | null
    if (!controls || !target) return

    const onDraggingChanged = (e: { value?: unknown }) => {
      if (Boolean(e.value)) commit()
    }
    const onObjectChange = () => {
      if (!primaryId) return
      const euler = target.rotation
      updateObject(primaryId, {
        position: [target.position.x, target.position.y, target.position.z],
        rotation: [THREE.MathUtils.radToDeg(euler.x), THREE.MathUtils.radToDeg(euler.y), THREE.MathUtils.radToDeg(euler.z)],
        scale: [target.scale.x, target.scale.y, target.scale.z],
      })
    }

    controls.addEventListener('dragging-changed', onDraggingChanged)
    controls.addEventListener('objectChange', onObjectChange)
    return () => {
      controls.removeEventListener('dragging-changed', onDraggingChanged)
      controls.removeEventListener('objectChange', onObjectChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryId, target])

  if (!target || !primaryId) return null

  const obj = useProjectStore.getState().project.objects.find((o) => o.id === primaryId)
  if (obj?.locked) return null

  return (
    <TransformControls
      ref={controlsRef}
      object={target}
      mode={MODE_MAP[transformMode]}
      translationSnap={snapEnabled ? 0.25 : null}
      rotationSnap={snapEnabled ? THREE.MathUtils.degToRad(15) : null}
      scaleSnap={snapEnabled ? 0.1 : null}
      space="local"
    />
  )
}

import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Suspense, useCallback, useRef } from 'react'
import { useProjectStore } from '../../state/projectStore'
import { SceneRoot } from '../../scene/objects/SceneRoot'
import { SceneLighting } from '../../scene/lighting/SceneLighting'
import { CameraRig } from '../../scene/camera/CameraRig'
import { TransformGizmo } from '../../scene/objects/TransformGizmo'
import { friendlyName } from '../../types/factories'
import type { ObjectKind } from '../../types/scene'
import { ViewportOverlay } from './ViewportOverlay'
import { RenderContextCapture } from '../../scene/viewport/RenderContextCapture'
import { TimelineTicker } from '../../scene/viewport/TimelineTicker'

function DropPlane() {
  return (
    <mesh rotation-x={-Math.PI / 2} visible={false} name="drop-plane">
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial />
    </mesh>
  )
}

function SceneContents() {
  const showGrid = useProjectStore((s) => s.project.environment.showGrid)
  const showShadows = useProjectStore((s) => s.project.environment.showShadows)
  return (
    <>
      <RenderContextCapture />
      <TimelineTicker />
      <CameraRig />
      <SceneLighting />
      {showGrid && (
        <Grid
          infiniteGrid
          cellSize={0.5}
          cellThickness={0.5}
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#a3aefc"
          cellColor="#d5d9e3"
          fadeDistance={30}
          fadeStrength={1.2}
          position={[0, -0.001, 0]}
        />
      )}
      {showShadows && <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={12} blur={2} far={4} />}
      <Suspense fallback={null}>
        <SceneRoot />
      </Suspense>
      <TransformGizmo />
      <DropPlane />
    </>
  )
}

function DropHandler({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { camera, raycaster, size } = useThree()
  const addObject = useProjectStore((s) => s.addObject)

  const handleDrop = useCallback(
    (kind: ObjectKind, clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const point = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, point)
      addObject(kind, { position: [point.x || 0, kind === 'plane' ? 0 : 0.5, point.z || 0], name: friendlyName(kind) })
    },
    [addObject, camera, raycaster, containerRef],
  )

  dropHandlerRef.current = handleDrop
  void size
  return null
}

export const dropHandlerRef: { current: ((kind: ObjectKind, x: number, y: number) => void) | null } = { current: null }

export function Viewport() {
  const containerRef = useRef<HTMLDivElement>(null)
  const clearSelection = useProjectStore((s) => s.clearSelection)
  const background = useProjectStore((s) => s.project.environment.background)

  function onDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('application/threesy-shape')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  function onDrop(e: React.DragEvent) {
    const kind = e.dataTransfer.getData('application/threesy-shape') as ObjectKind
    if (!kind) return
    e.preventDefault()
    dropHandlerRef.current?.(kind, e.clientX, e.clientY)
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ background }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onPointerMissed={() => clearSelection()}
      >
        <SceneContents />
        <DropHandler containerRef={containerRef} />
        <GizmoHelper alignment="bottom-right" margin={[64, 64]}>
          <GizmoViewport axisColors={['#ff5c5c', '#33c17a', '#4f7dff']} labelColor="white" />
        </GizmoHelper>
      </Canvas>
      <ViewportOverlay />
    </div>
  )
}

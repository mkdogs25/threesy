import * as THREE from 'three'
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useProjectStore } from '../../state/projectStore'
import { getObjectRef } from '../objects/objectRefs'
import { CAMERA_VIEWS, type CameraViewId } from './views'
import { registerCameraActions } from './cameraActions'

export function CameraRig() {
  const orthographic = useProjectStore((s) => s.project.environment.orthographic)
  const camera = useProjectStore((s) => s.project.camera)
  const selection = useProjectStore((s) => s.selection)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { size } = useThree()

  useEffect(() => {
    const frameSelected = () => {
      const controls = controlsRef.current
      if (!controls) return
      const id = selection[selection.length - 1]
      const obj = id ? getObjectRef(id) : undefined
      const box = new THREE.Box3()
      if (obj) {
        box.setFromObject(obj)
      } else {
        box.setFromCenterAndSize(new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(2, 2, 2))
      }
      if (box.isEmpty()) return
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const radius = Math.max(size.length() * 0.6, 1)
      const dir = controls.object.position.clone().sub(controls.target).normalize()
      controls.target.copy(center)
      controls.object.position.copy(center.clone().add(dir.multiplyScalar(radius * 1.8)))
      controls.update()
    }

    const setView = (id: CameraViewId) => {
      const controls = controlsRef.current
      if (!controls) return
      const target = controls.target.clone()
      const [x, y, z] = CAMERA_VIEWS[id]
      controls.object.position.set(target.x + x, target.y + y, target.z + z)
      controls.update()
    }

    registerCameraActions({ frameSelected, setView })
    return () => registerCameraActions(null)
  }, [selection])

  return (
    <>
      {orthographic ? (
        <OrthographicCamera makeDefault position={camera.position} zoom={size.height / 5.5} near={-50} far={100} />
      ) : (
        <PerspectiveCamera makeDefault position={camera.position} fov={camera.fov} near={0.1} far={100} />
      )}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={camera.target}
        enableDamping
        dampingFactor={0.12}
        minDistance={1.5}
        maxDistance={40}
        maxPolarAngle={Math.PI * 0.98}
      />
    </>
  )
}

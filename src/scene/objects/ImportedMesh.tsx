import * as THREE from 'three'
import { useEffect, useMemo, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { SceneObject } from '../../types/scene'
import { getAsset } from '../../persistence/db'
import { loadImportedGeometry } from '../../import/loadImportedGeometry'

interface ImportedMeshProps {
  object: SceneObject
  selected: boolean
  primary: boolean
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp: () => void
  onPointerOver: () => void
  onPointerOut: () => void
  onClick: (e: ThreeEvent<MouseEvent>) => void
  onContextMenu: (e: ThreeEvent<MouseEvent>) => void
}

const cache = new Map<string, Promise<THREE.Object3D>>()

export function ImportedMesh({ object, selected, primary, ...handlers }: ImportedMeshProps) {
  const [loaded, setLoaded] = useState<THREE.Object3D | null>(null)
  const [failed, setFailed] = useState(false)
  const assetId = object.importedAssetId
  const format = object.importedFormat

  useEffect(() => {
    let cancelled = false
    if (!assetId || !format) return
    const cacheKey = `${assetId}:${format}`
    let promise = cache.get(cacheKey)
    if (!promise) {
      promise = getAsset(assetId).then((dataUrl) => {
        if (!dataUrl) throw new Error('missing asset')
        return loadImportedGeometry(dataUrl, format)
      })
      cache.set(cacheKey, promise)
    }
    promise.then((obj) => {
      if (!cancelled) setLoaded(obj.clone(true))
    }).catch(() => {
      if (!cancelled) setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [assetId, format])

  const normalized = useMemo(() => {
    if (!loaded) return null
    const box = new THREE.Box3().setFromObject(loaded)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 0.001)
    const scale = 1.4 / maxDim
    const wrapper = new THREE.Group()
    loaded.position.set(-center.x, -center.y + size.y / 2, -center.z)
    wrapper.add(loaded)
    wrapper.scale.setScalar(scale)
    return wrapper
  }, [loaded])

  if (failed) {
    return (
      <mesh {...handlers}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#e2e5ec" wireframe />
      </mesh>
    )
  }

  if (!normalized) return null

  return (
    <group
      {...handlers}
      onPointerDown={(e) => {
        e.stopPropagation()
        handlers.onPointerDown(e)
      }}
    >
      <primitive object={normalized} castShadow receiveShadow />
      {selected && (
        <lineSegments position={[0, 0.7, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(1.5, 1.5, 1.5)]} />
          <lineBasicMaterial color={primary ? '#6c8cff' : '#a3aefc'} />
        </lineSegments>
      )}
    </group>
  )
}

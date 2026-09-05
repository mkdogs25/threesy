import { useMemo } from 'react'
import type { MaterialSpec } from '../../types/scene'

/** Maps a beginner-friendly MaterialSpec onto MeshPhysicalMaterial props. */
export function useMaterialProps(material: MaterialSpec) {
  return useMemo(
    () => ({
      color: material.color,
      roughness: material.roughness,
      metalness: material.metalness,
      opacity: material.opacity,
      transparent: material.transparent || material.opacity < 1,
      emissive: material.emissive,
      emissiveIntensity: material.emissiveIntensity,
      clearcoat: material.preset === 'glossy' || material.preset === 'ceramic' ? 0.6 : 0,
      transmission: material.preset === 'glass' ? 0.9 : 0,
      ior: material.preset === 'glass' ? 1.5 : 1.4,
      thickness: material.preset === 'glass' ? 0.5 : 0,
    }),
    [material],
  )
}

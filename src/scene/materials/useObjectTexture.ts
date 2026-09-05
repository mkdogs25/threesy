import { useTexture } from '@react-three/drei'
import type * as THREE from 'three'

const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

/** Loads a texture only when a URL is provided, otherwise returns null.
 * Always calls the hook (with a 1x1 placeholder) to satisfy rules-of-hooks. */
export function useObjectTexture(url?: string): THREE.Texture | null {
  const texture = useTexture(url || BLANK_PIXEL)
  return url ? texture : null
}

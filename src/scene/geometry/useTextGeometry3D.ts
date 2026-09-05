import * as THREE from 'three'
import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { useEffect, useMemo, useState } from 'react'

let fontPromise: Promise<Font> | null = null

function loadFont(): Promise<Font> {
  if (!fontPromise) {
    const loader = new FontLoader()
    fontPromise = loader.loadAsync(`${import.meta.env.BASE_URL}fonts/helvetiker_regular.typeface.json`)
  }
  return fontPromise
}

/** Builds real extruded 3D text geometry (bevelled, given depth/thickness)
 * from a bundled typeface font — loaded once and cached, since it's fetched
 * asynchronously but every text object shares the same font. Returns null
 * until the font has loaded, and falls back to a small placeholder mark if
 * the font fails to load so an object always renders something selectable. */
export function useTextGeometry3D(text: string, size: number, depth: number, bevel: number): THREE.BufferGeometry | null {
  const [font, setFont] = useState<Font | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadFont()
      .then((f) => {
        if (!cancelled) setFont(f)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => {
    if (failed) {
      const geo = new THREE.BoxGeometry(size, size, Math.max(depth, 0.02))
      return geo
    }
    if (!font) return null
    const safeText = text.trim().length > 0 ? text : ' '
    const geo = new TextGeometry(safeText, {
      font,
      size,
      depth: Math.max(depth, 0.01),
      curveSegments: 6,
      bevelEnabled: bevel > 0.01,
      bevelThickness: bevel * size * 0.18,
      bevelSize: bevel * size * 0.1,
      bevelSegments: 3,
    })
    geo.computeBoundingBox()
    geo.center()
    return geo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [font, failed, text, size, depth, bevel])
}

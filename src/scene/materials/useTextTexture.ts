import * as THREE from 'three'
import { useMemo } from 'react'

/** Renders text to a canvas and returns it as a texture, so "Add Text"
 * doesn't require shipping font geometry assets. */
export function useTextTexture(text: string, color: string): THREE.CanvasTexture {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 320
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '700 160px Inter, ui-sans-serif, system-ui, sans-serif'
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text || 'Text', canvas.width / 2, canvas.height / 2)
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [text, color])
}

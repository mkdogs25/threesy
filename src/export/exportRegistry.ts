import type * as THREE from 'three'

interface RenderContext {
  gl: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.Camera
}

let current: RenderContext | null = null

export function registerRenderContext(ctx: RenderContext | null) {
  current = ctx
}

export function getRenderContext(): RenderContext | null {
  return current
}

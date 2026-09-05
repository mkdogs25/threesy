import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import type { SceneObject } from '../types/scene'

const DEFAULT_MATERIAL = new THREE.MeshPhysicalMaterial({ color: '#8fa0ff', roughness: 0.5, metalness: 0.05 })

function dataUrlToBlobUrl(dataUrl: string): string {
  const [, base64] = dataUrl.split(',')
  const mimeMatch = dataUrl.match(/^data:([^;]+);/)
  const mime = mimeMatch?.[1] ?? 'application/octet-stream'
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return URL.createObjectURL(new Blob([arr], { type: mime }))
}

export async function loadImportedGeometry(dataUrl: string, format: NonNullable<SceneObject['importedFormat']>): Promise<THREE.Object3D> {
  if (format === 'glb' || format === 'gltf') {
    const blobUrl = dataUrlToBlobUrl(dataUrl)
    try {
      const loader = new GLTFLoader()
      const gltf = await loader.loadAsync(blobUrl)
      return gltf.scene
    } finally {
      URL.revokeObjectURL(blobUrl)
    }
  }

  if (format === 'obj') {
    const text = await (await fetch(dataUrl)).text()
    const loader = new OBJLoader()
    const obj = loader.parse(text)
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.material) child.material = DEFAULT_MATERIAL
    })
    return obj
  }

  if (format === 'stl') {
    const buffer = await (await fetch(dataUrl)).arrayBuffer()
    const loader = new STLLoader()
    const geometry = loader.parse(buffer)
    geometry.computeVertexNormals()
    return new THREE.Mesh(geometry, DEFAULT_MATERIAL)
  }

  if (format === 'svg') {
    const text = await (await fetch(dataUrl)).text()
    const loader = new SVGLoader()
    const svgData = loader.parse(text)
    const group = new THREE.Group()
    for (const path of svgData.paths) {
      const shapes = SVGLoader.createShapes(path)
      const color = new THREE.Color().setStyle(path.color ? `#${path.color.getHexString()}` : '#8fa0ff')
      for (const shape of shapes) {
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: false })
        const mesh = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color, roughness: 0.5 }))
        group.add(mesh)
      }
    }
    group.rotation.x = Math.PI
    group.scale.multiplyScalar(0.01)
    return group
  }

  throw new Error(`Unsupported import format: ${format}`)
}

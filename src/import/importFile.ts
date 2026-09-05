import { v4 as uuid } from 'uuid'
import { saveAsset } from '../persistence/db'
import type { ObjectKind, SceneObject } from '../types/scene'
import { createSceneObject } from '../types/factories'

export class ImportError extends Error {}

const EXT_FORMAT: Record<string, SceneObject['importedFormat']> = {
  glb: 'glb',
  gltf: 'gltf',
  obj: 'obj',
  stl: 'stl',
  svg: 'svg',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  webp: 'image',
}

const SUPPORTED_EXTENSIONS = Object.keys(EXT_FORMAT)

function extensionOf(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Reads a dropped/selected file, stores it as an asset, and returns a new
 * SceneObject ready to be added to the project. Throws ImportError with a
 * friendly message for unsupported or unreadable files. */
export async function importFileToObject(file: File): Promise<SceneObject> {
  const ext = extensionOf(file.name)
  const format = EXT_FORMAT[ext]
  if (!format) {
    throw new ImportError(`.${ext || '?'} files aren't supported yet. Try one of: ${SUPPORTED_EXTENSIONS.join(', ')}.`)
  }

  let dataUrl: string
  try {
    dataUrl = await readAsDataUrl(file)
  } catch {
    throw new ImportError('This file could not be read.')
  }

  const assetId = uuid()
  try {
    await saveAsset(assetId, dataUrl)
  } catch {
    throw new ImportError('This file could not be saved to your project.')
  }

  const kind: ObjectKind = format === 'image' ? 'plane' : 'imported'
  const name = file.name.replace(/\.[^.]+$/, '')

  return createSceneObject(kind, {
    name,
    importedAssetId: assetId,
    importedFormat: format,
    material:
      format === 'image'
        ? { ...createSceneObject('plane').material, textureUrl: dataUrl }
        : createSceneObject('imported').material,
  })
}

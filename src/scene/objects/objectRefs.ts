import type * as THREE from 'three'
import { useSyncExternalStore } from 'react'

type Listener = () => void
const refs = new Map<string, THREE.Object3D>()
const listeners = new Set<Listener>()

export function registerObjectRef(id: string, obj: THREE.Object3D | null) {
  if (obj) refs.set(id, obj)
  else refs.delete(id)
  listeners.forEach((l) => l())
}

export function getObjectRef(id: string): THREE.Object3D | undefined {
  return refs.get(id)
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useObjectRef(id: string | undefined | null): THREE.Object3D | undefined {
  return useSyncExternalStore(subscribe, () => (id ? refs.get(id) : undefined))
}

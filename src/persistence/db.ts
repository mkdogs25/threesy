import { type DBSchema, type IDBPDatabase, openDB } from 'idb'
import type { ProjectData } from '../types/scene'

interface ThreesyDB extends DBSchema {
  projects: {
    key: string
    value: ProjectData
    indexes: { 'by-updatedAt': number }
  }
  assets: {
    key: string
    value: { id: string; dataUrl: string }
  }
}

let dbPromise: Promise<IDBPDatabase<ThreesyDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ThreesyDB>('threesy', 1, {
      upgrade(db) {
        const store = db.createObjectStore('projects', { keyPath: 'id' })
        store.createIndex('by-updatedAt', 'updatedAt')
        db.createObjectStore('assets', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function saveProjectToDb(project: ProjectData): Promise<void> {
  const db = await getDb()
  await db.put('projects', project)
}

export async function listProjects(): Promise<ProjectData[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('projects', 'by-updatedAt')
  return all.reverse()
}

export async function getProject(id: string): Promise<ProjectData | undefined> {
  const db = await getDb()
  return db.get('projects', id)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('projects', id)
}

export async function saveAsset(id: string, dataUrl: string): Promise<void> {
  const db = await getDb()
  await db.put('assets', { id, dataUrl })
}

export async function getAsset(id: string): Promise<string | undefined> {
  const db = await getDb()
  const rec = await db.get('assets', id)
  return rec?.dataUrl
}

import { type DBSchema, type IDBPDatabase, openDB } from 'idb'
import type { AppBuilderProject } from '../schema/types'

interface AppBuilderDB extends DBSchema {
  projects: {
    key: string
    value: AppBuilderProject
    indexes: { 'by-updatedAt': number }
  }
}

let dbPromise: Promise<IDBPDatabase<AppBuilderDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<AppBuilderDB>('threesy-appbuilder', 1, {
      upgrade(db) {
        const store = db.createObjectStore('projects', { keyPath: 'id' })
        store.createIndex('by-updatedAt', 'updatedAt')
      },
    })
  }
  return dbPromise
}

export async function saveAppBuilderProject(project: AppBuilderProject): Promise<void> {
  const db = await getDb()
  await db.put('projects', project)
}

export async function listAppBuilderProjects(): Promise<AppBuilderProject[]> {
  const db = await getDb()
  return (await db.getAllFromIndex('projects', 'by-updatedAt')).reverse()
}

export async function deleteAppBuilderProject(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('projects', id)
}

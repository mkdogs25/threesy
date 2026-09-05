import { useMemo } from 'react'
import type { SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { ObjectMesh } from './ObjectMesh'
import { GroupNode } from './GroupNode'

const NON_RENDERABLE_KINDS = new Set(['light', 'camera'])

function SceneNode({
  object,
  childrenByParent,
  allObjects,
}: {
  object: SceneObject
  childrenByParent: Map<string | null, SceneObject[]>
  allObjects: SceneObject[]
}) {
  const kids = childrenByParent.get(object.id) ?? []
  const renderedKids = kids.map((child) => (
    <SceneNode key={child.id} object={child} childrenByParent={childrenByParent} allObjects={allObjects} />
  ))

  if (object.kind === 'group') {
    return <GroupNode object={object}>{renderedKids}</GroupNode>
  }
  return (
    <ObjectMesh object={object} allObjects={allObjects}>
      {renderedKids}
    </ObjectMesh>
  )
}

export function SceneRoot() {
  const objects = useProjectStore((s) => s.project.objects)

  const { roots, childrenByParent } = useMemo(() => {
    const renderable = objects.filter((o) => !NON_RENDERABLE_KINDS.has(o.kind))
    const idSet = new Set(renderable.map((o) => o.id))
    const map = new Map<string | null, SceneObject[]>()
    for (const o of renderable) {
      const parentKey = o.parentId && idSet.has(o.parentId) ? o.parentId : null
      const list = map.get(parentKey) ?? []
      list.push(o)
      map.set(parentKey, list)
    }
    return { roots: map.get(null) ?? [], childrenByParent: map }
  }, [objects])

  return (
    <>
      {roots.map((o) => (
        <SceneNode key={o.id} object={o} childrenByParent={childrenByParent} allObjects={objects} />
      ))}
    </>
  )
}

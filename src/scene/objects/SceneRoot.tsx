import { useProjectStore } from '../../state/projectStore'
import { ObjectMesh } from './ObjectMesh'

export function SceneRoot() {
  const objects = useProjectStore((s) => s.project.objects)
  const renderable = objects.filter((o) => o.kind !== 'group' && o.kind !== 'light' && o.kind !== 'camera')

  return (
    <>
      {renderable.map((o) => (
        <ObjectMesh key={o.id} object={o} allObjects={objects} />
      ))}
    </>
  )
}

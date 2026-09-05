import { Environment } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useMemo } from 'react'
import { useProjectStore } from '../../state/projectStore'
import { getLightingPreset } from './presets'

// A procedurally generated environment map (no network fetch) so Threesy's
// lighting stays fully local-first — nothing depends on a CDN being reachable.
export function SceneLighting() {
  const presetId = useProjectStore((s) => s.project.environment.lightingPreset)
  const preset = getLightingPreset(presetId)
  const roomEnv = useMemo(() => new RoomEnvironment(), [])

  return (
    <>
      <Environment environmentIntensity={preset.environmentIntensity} background={false} frames={1} resolution={64}>
        <primitive object={roomEnv} />
      </Environment>
      {preset.lights.map((light, i) => {
        if (light.type === 'ambient') return <ambientLight key={i} color={light.color} intensity={light.intensity} />
        if (light.type === 'point')
          return <pointLight key={i} position={light.position} color={light.color} intensity={light.intensity} castShadow />
        return (
          <directionalLight
            key={i}
            position={light.position}
            color={light.color}
            intensity={light.intensity}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0005}
          >
            <orthographicCamera attach="shadow-camera" args={[-6, 6, 6, -6, 0.1, 30]} />
          </directionalLight>
        )
      })}
    </>
  )
}

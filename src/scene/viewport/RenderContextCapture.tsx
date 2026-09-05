import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { registerRenderContext } from '../../export/exportRegistry'

/** Publishes the live R3F renderer/scene/camera so export & screenshot
 * utilities (which run outside the Canvas) can reach them. */
export function RenderContextCapture() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    registerRenderContext({ gl, scene, camera })
    return () => registerRenderContext(null)
  }, [gl, scene, camera])
  return null
}

import { Play, Plus, Square, Trash2 } from 'lucide-react'
import type { AnimationPresetId, EasingId, SceneObject } from '../../types/scene'
import { useProjectStore } from '../../state/projectStore'
import { useTimelineStore } from '../../state/timelineStore'
import { useUIStore } from '../../state/uiStore'
import { Section } from '../common/Section'
import { Slider } from '../common/Slider'

const PRESETS: { id: AnimationPresetId; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'float', label: 'Float' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'rotate', label: 'Rotate' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'shake', label: 'Shake' },
  { id: 'slide', label: 'Slide' },
  { id: 'fade', label: 'Fade' },
]

const EASINGS: EasingId[] = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'bounce']

export function AnimationSection({ object }: { object: SceneObject }) {
  const updateObject = useProjectStore((s) => s.updateObject)
  const commit = useProjectStore((s) => s.commit)
  const isPlaying = useTimelineStore((s) => s.isPlaying)
  const toggle = useTimelineStore((s) => s.toggle)
  const currentTime = useTimelineStore((s) => s.currentTime)
  const setTimelineOpen = useUIStore((s) => s.setTimelineOpen)
  const anim = object.animation

  function setPreset(preset: AnimationPresetId) {
    commit()
    updateObject(object.id, { animation: { ...anim, preset, keyframes: [] } })
  }

  function addKeyframe() {
    commit()
    setTimelineOpen(true)
    const kf = {
      id: crypto.randomUUID(),
      time: currentTime,
      position: object.position,
      rotation: object.rotation,
      scale: object.scale,
      opacity: object.material.opacity,
      easing: 'easeInOut' as EasingId,
    }
    updateObject(object.id, { animation: { ...anim, preset: 'none', keyframes: [...anim.keyframes, kf] } })
  }

  function removeKeyframes() {
    commit()
    updateObject(object.id, { animation: { ...anim, keyframes: [] } })
  }

  return (
    <Section title="Animation" defaultOpen={false}>
      <div className="grid grid-cols-4 gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`rounded-lg border py-1.5 text-[11px] font-medium ${
              anim.preset === p.id && anim.keyframes.length === 0
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-ink-200 text-ink-600 hover:border-brand-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Slider
        label="Duration (seconds)"
        value={anim.duration}
        min={0.5}
        max={10}
        step={0.1}
        onChange={(v) => updateObject(object.id, { animation: { ...anim, duration: v } })}
        onCommit={commit}
        format={(v) => `${v.toFixed(1)}s`}
      />

      <label className="flex items-center gap-2 text-xs text-ink-600">
        <input type="checkbox" checked={anim.loop} onChange={(e) => updateObject(object.id, { animation: { ...anim, loop: e.target.checked } })} />
        Loop
      </label>

      <div className="flex items-center justify-between rounded-lg bg-ink-50 p-2">
        <span className="text-[11px] text-ink-500">
          {anim.keyframes.length > 0 ? `${anim.keyframes.length} keyframes` : 'No custom keyframes'}
        </span>
        <div className="flex gap-1">
          <button type="button" onClick={addKeyframe} className="btn-icon h-7 w-7" title="Add keyframe at playhead">
            <Plus size={14} />
          </button>
          {anim.keyframes.length > 0 && (
            <button type="button" onClick={removeKeyframes} className="btn-icon h-7 w-7" title="Clear keyframes">
              <Trash2 size={14} />
            </button>
          )}
          <button type="button" onClick={toggle} className="btn-icon h-7 w-7" title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Square size={13} /> : <Play size={13} />}
          </button>
        </div>
      </div>
    </Section>
  )
}

export { EASINGS }

import { ChevronDown, Pause, Play, SkipBack } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { useProjectStore } from '../../state/projectStore'
import { useTimelineStore } from '../../state/timelineStore'
import { useUIStore } from '../../state/uiStore'

const PIXELS_PER_SECOND = 90

export function Timeline() {
  const open = useUIStore((s) => s.timelineOpen)
  const setOpen = useUIStore((s) => s.setTimelineOpen)
  const objects = useProjectStore((s) => s.project.objects)
  const selection = useProjectStore((s) => s.selection)
  const updateObject = useProjectStore((s) => s.updateObject)
  const commit = useProjectStore((s) => s.commit)
  const isPlaying = useTimelineStore((s) => s.isPlaying)
  const toggle = useTimelineStore((s) => s.toggle)
  const setTime = useTimelineStore((s) => s.setTime)
  const currentTime = useTimelineStore((s) => s.currentTime)
  const trackRef = useRef<HTMLDivElement>(null)

  const object = objects.find((o) => o.id === selection[selection.length - 1])
  const duration = object?.animation.duration ?? 4
  const width = Math.max(duration * PIXELS_PER_SECOND, 300)

  const keyframes = useMemo(() => object?.animation.keyframes ?? [], [object])

  function scrub(clientX: number) {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const t = Math.max(0, Math.min((clientX - rect.left) / PIXELS_PER_SECOND, duration))
    setTime(t)
  }

  return (
    <div className="panel flex w-full flex-col">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-ink-600"
      >
        <span>Timeline{object ? ` · ${object.name}` : ''}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="flex items-stretch gap-3 border-t border-ink-100 px-4 py-3">
          <div className="flex flex-col items-center gap-2">
            <button type="button" onClick={() => setTime(0)} className="btn-icon h-8 w-8" title="Restart">
              <SkipBack size={14} />
            </button>
            <button
              type="button"
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <span className="text-[10px] tabular-nums text-ink-400">{currentTime.toFixed(1)}s</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {!object ? (
              <div className="flex h-16 items-center justify-center text-xs text-ink-400">Select an object to animate it</div>
            ) : (
              <div
                ref={trackRef}
                className="relative h-16 cursor-pointer rounded-lg bg-ink-50"
                style={{ width }}
                onPointerDown={(e) => {
                  scrub(e.clientX)
                  const move = (ev: PointerEvent) => scrub(ev.clientX)
                  const up = () => {
                    window.removeEventListener('pointermove', move)
                    window.removeEventListener('pointerup', up)
                  }
                  window.addEventListener('pointermove', move)
                  window.addEventListener('pointerup', up)
                }}
              >
                {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                  <div key={i} className="absolute top-0 h-full border-l border-ink-200" style={{ left: i * PIXELS_PER_SECOND }}>
                    <span className="absolute -top-0.5 left-1 text-[9px] text-ink-400">{i}s</span>
                  </div>
                ))}

                {keyframes.map((kf) => (
                  <button
                    key={kf.id}
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation()
                      setTime(kf.time)
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      commit()
                      updateObject(object.id, {
                        animation: { ...object.animation, keyframes: object.animation.keyframes.filter((k) => k.id !== kf.id) },
                      })
                    }}
                    title={`t=${kf.time.toFixed(1)}s (double-click to remove)`}
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-brand-500 shadow hover:scale-125"
                    style={{ left: kf.time * PIXELS_PER_SECOND }}
                  />
                ))}

                <div
                  className="absolute top-0 h-full w-px bg-red-500"
                  style={{ left: Math.min(currentTime, duration) * PIXELS_PER_SECOND }}
                >
                  <div className="absolute -top-1 -left-[5px] h-2.5 w-2.5 rotate-45 bg-red-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

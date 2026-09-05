import { useProjectStore } from '../../state/projectStore'
import { LIGHTING_PRESETS } from '../../scene/lighting/presets'
import { Section } from '../common/Section'

export function EnvironmentSection() {
  const environment = useProjectStore((s) => s.project.environment)
  const updateEnvironment = useProjectStore((s) => s.updateEnvironment)

  return (
    <Section title="Lighting">
      <div className="grid grid-cols-2 gap-1.5">
        {LIGHTING_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => updateEnvironment({ lightingPreset: p.id, background: p.background })}
            className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[11px] font-medium ${
              environment.lightingPreset === p.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-brand-300'
            }`}
          >
            <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: p.background }} />
            {p.label}
          </button>
        ))}
      </div>
    </Section>
  )
}

import { ChevronDown } from 'lucide-react'
import { type ReactNode, useState } from 'react'

interface SectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  icon?: ReactNode
}

export function Section({ title, children, defaultOpen = true, icon }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-ink-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-semibold text-ink-700 hover:bg-ink-50"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <ChevronDown size={14} className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="flex flex-col gap-3 px-3 pb-3">{children}</div>}
    </div>
  )
}

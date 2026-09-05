import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useUIStore } from '../../state/uiStore'
import { useCommands } from './commands'

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const commands = useCommands()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query],
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  useEffect(() => setActiveIndex(0), [query])

  if (!open) return null

  function run(index: number) {
    const cmd = filtered[index]
    if (!cmd) return
    cmd.run()
    setOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-ink-950/40 pt-[15vh] backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div className="w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
          <Search size={16} className="text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                run(activeIndex)
              } else if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
            placeholder="Type a command…"
            className="flex-1 text-sm outline-none placeholder:text-ink-400"
          />
          <kbd className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-400">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {filtered.length === 0 && <p className="px-3 py-6 text-center text-xs text-ink-400">No matching commands</p>}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => run(i)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                i === activeIndex ? 'bg-brand-50 text-brand-700' : 'text-ink-700'
              }`}
            >
              <cmd.icon size={15} className="opacity-70" />
              <span className="flex-1">{cmd.label}</span>
              <span className="text-[10px] uppercase text-ink-400">{cmd.group}</span>
              {cmd.shortcut && <kbd className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500">{cmd.shortcut}</kbd>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

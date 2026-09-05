import { type ReactNode, useState } from 'react'

interface TooltipProps {
  label: string
  shortcut?: string
  children: ReactNode
}

export function Tooltip({ label, shortcut, children }: TooltipProps) {
  const [show, setShow] = useState(false)
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg animate-fade-in"
        >
          {label}
          {shortcut && <span className="ml-1.5 text-neutral-400">{shortcut}</span>}
        </span>
      )}
    </span>
  )
}

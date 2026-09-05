import type { ButtonHTMLAttributes } from 'react'
import { Tooltip } from './Tooltip'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  shortcut?: string
  active?: boolean
}

export function IconButton({ label, shortcut, active, className = '', children, ...rest }: IconButtonProps) {
  return (
    <Tooltip label={label} shortcut={shortcut}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        className={`btn-icon h-8 w-8 disabled:opacity-40 disabled:pointer-events-none ${
          active ? 'bg-brand-100 text-brand-700 hover:bg-brand-100' : ''
        } ${className}`}
        {...rest}
      >
        {children}
      </button>
    </Tooltip>
  )
}

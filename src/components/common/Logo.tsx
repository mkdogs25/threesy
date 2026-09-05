interface LogoProps {
  size?: number
  className?: string
  animated?: boolean
}

/**
 * The Threesy mark: an isometric cube with three shaded faces, giving it
 * depth without excess detail. Used everywhere the brand appears — favicon,
 * welcome screen, top-left nav, loading states.
 */
export function Logo({ size = 32, className = '', animated = false }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Threesy"
    >
      <g className={animated ? 'origin-center animate-[logo-spin_6s_ease-in-out_infinite]' : ''}>
        {/* top face */}
        <path d="M24 3 L43 13.5 L24 24 L5 13.5 Z" fill="url(#threesy-top)" />
        {/* left face */}
        <path d="M5 13.5 L24 24 L24 45 L5 34.5 Z" fill="url(#threesy-left)" />
        {/* right face */}
        <path d="M43 13.5 L24 24 L24 45 L43 34.5 Z" fill="url(#threesy-right)" />
        {/* silhouette edge */}
        <path
          d="M24 3 L43 13.5 L43 34.5 L24 45 L5 34.5 L5 13.5 Z"
          stroke="#ffffff"
          strokeOpacity="0.08"
          strokeWidth="1"
          fill="none"
        />
      </g>
      <defs>
        <linearGradient id="threesy-top" x1="5" y1="3" x2="43" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9db4ff" />
          <stop offset="1" stopColor="#6c8cff" />
        </linearGradient>
        <linearGradient id="threesy-left" x1="5" y1="13.5" x2="24" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b6ef0" />
          <stop offset="1" stopColor="#4638d6" />
        </linearGradient>
        <linearGradient id="threesy-right" x1="24" y1="13.5" x2="43" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7b8cf7" />
          <stop offset="1" stopColor="#5749e0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

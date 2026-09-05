import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Threesy is deployed as a GitHub Pages project site at
  // mkdogs25.github.io/threesy, so production builds need this subpath as
  // the base. Keep the dev server at "/" for convenience.
  base: command === 'build' ? '/threesy/' : '/',
  plugins: [react(), tailwindcss()],
}))

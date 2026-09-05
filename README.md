# Threesy

**Three dimensions. Zero headaches.**

Threesy is a fast, friendly, browser-based 3D modelling app — Canva/Figma for
3D. It gives you much of the creative power of tools like Spline, without
requiring you to learn vertices, edges, topology, or node graphs.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. No account or server is required — projects are
created and saved entirely in your browser (IndexedDB), with optional
"Save to Computer" / "Open from Computer" for `.threesy` project files.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

## Architecture

```
src/
├── app/            # App-level wiring (editor shell, keyboard shortcuts)
├── components/     # UI: layout, viewport chrome, toolbar, inspector,
│                     hierarchy, library, timeline, dialogs, welcome screen
├── scene/          # Rendering: objects, geometry, materials, lighting,
│                     camera, interactions — the Three.js/R3F layer
├── animation/      # Keyframe sampling + built-in animation presets
├── import/         # GLB/GLTF/OBJ/STL/SVG/image import
├── export/         # GLB/GLTF/OBJ/image export
├── persistence/    # IndexedDB projects, autosave, .threesy file I/O
├── state/          # Zustand stores (project + history, UI, timeline, app)
├── templates/       # Starter template scenes
├── types/          # Shared scene data model
└── utils/
```

The scene data model (`src/types/scene.ts`) is plain, JSON-serialisable data
— no Three.js instances — so it can be saved directly into a `.threesy`
project file or IndexedDB. All 3D rendering is derived from that data inside
`src/scene/`, keeping UI state and rendering cleanly separated.

## Tech stack

React, TypeScript, Vite, Three.js, React Three Fiber, drei, Tailwind CSS,
Zustand, IndexedDB (via `idb`), Lucide icons, and `three-bvh-csg` for boolean
modelling.

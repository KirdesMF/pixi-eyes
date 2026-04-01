# Pixi Eyes Prototype

Prototype stack for an instance-heavy eye animation ported from Rive to Pixi.js before embedding it in an Astro hero section.

## Stack

- Bun
- Vite `8.0.3`
- TypeScript `6.0.2`
- Pixi.js `8.17.1`
- Tailwind CSS `4`
- Oxc (`oxfmt`, `oxlint`)

## Why this stack

Use a standalone Vite app first. It gives the fastest feedback loop for:

- update-loop tuning
- instance-count stress testing
- renderer selection and profiling
- matching the Rive motion before Astro integration adds any framework noise

Once the behavior is correct, the Pixi canvas can be mounted inside an Astro island with a thin wrapper.

## Scripts

```bash
bun install
bun run dev
bun run fmt
bun run lint
bun run check
bun run build
```

## Current prototype

- Responsive Pixi hero canvas with a left-side tuning panel
- Mixed round and cat eyes in the same field
- Pointer-driven gaze, repulsion, click wave, and idle shared-attention behavior
- Procedural cat pupil morph and blink system
- Live JSON export for tuned settings
- Shared generated textures for the static globe layers, with procedural inner eye motion preserved

## Integration note

This prototype is meant to tune motion and rendering in isolation. Once the values feel right, the canvas can be mounted inside an Astro island with a thin wrapper and the exported JSON can be used as the initial runtime config.

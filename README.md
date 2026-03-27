# Pixi Eyes Prototype

Prototype stack for porting an instance-heavy eye animation from Rive to Pixi.js before embedding it in an Astro hero section.

## Stack

- Vite `8.0.3`
- TypeScript `6.0.2`
- Pixi.js `8.17.1`

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
bun run check
bun run build
```

## Current prototype

- A Pixi 8 hero scene with a responsive canvas mount
- Shared vector contexts for repeated eye geometry
- Pointer-driven gaze updates
- Basic blink timing and lightweight visibility culling
- Instance slider and live FPS readout

## Next step

Add the Rive Luau source here:

`./rive-scripts/EyeInstance`

That file is not present in the current workspace yet, so the current motion is a scaffold rather than a behavioral port.

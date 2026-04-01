# Visual Baseline Notes

Captured before starting the `refactor-main-foundation` branch.

## How to capture

### Visual captures (screenshots)

```
bun run dev
```

Then open `http://localhost:5173/?capture=1`.

This will automatically download 9 PNG files:

- `round-eye-rest.png` — 1 round eye, no tracking
- `round-eye-track.png` — 1 round eye, tracking offset
- `cat-eye-rest.png` — 1 cat eye, morph=0
- `cat-eye-morph-mid.png` — 1 cat eye, morph≈0.5
- `cat-eye-morph-max.png` — 1 cat eye, morph=1.0
- `cat-eye-blink-closed.png` — 1 cat eye, fully closed
- `cat-eye-blink-half.png` — 1 cat eye, half closed
- `dense-scene.png` — 50 eyes mixed, no tracking
- `dense-scene-track.png` — 50 eyes mixed, tracking active

Save these files in `refactor-baseline/screenshots/`.

### Performance benchmark

```
bun run dev
```

Then open `http://localhost:5173/?benchmark=1`.

This runs a 5-second benchmark after 2s warmup and downloads a JSON file:

- `perf-chrome.json` on Chrome
- `perf-safari.json` on Safari

The JSON contains:

- `fpsAvg` — average FPS
- `fpsP5` — 5th percentile FPS
- `fpsP95` — 95th percentile FPS
- `frameTimeAvg` — average frame time (ms)
- `frameTimeMax` — max frame time (ms)
- `drawCallsAvg` — average batch flushes per frame

## Baseline perf numbers

### Chrome (fill after first capture)

- fpsAvg: 68
- fpsP5: 47.4
- fpsP95: 85.5
- frameTimeAvg: 15.2ms
- frameTimeMax: 24.7ms
- drawCallsAvg: \_ (metric not yet reliable)

### Safari (fill after manual capture)

- fpsAvg: \_
- fpsP5: \_
- fpsP95: \_
- frameTimeAvg: \_
- frameTimeMax: \_
- drawCallsAvg: \_

## Current Settings (defaults)

- instance-count: default
- layout-shape: circle
- layout-transition-duration: default
- layout-jitter: default
- min-eye-size: default
- max-eye-size: default
- cat-mix: default
- cat-morph-radius: default
- repulsion-radius: default
- click-repulse-radius: default
- click-repulse-strength: default
- click-repulse-ease: out-elastic
- stagger-seconds: default
- shadow-opacity: default
- round-inner-shadow-color: default
- cat-inner-shadow-color: default
- drop-shadow-color: default
- drop-shadow-opacity: default
- drop-shadow-blur: default
- drop-shadow-spread: default
- iris-color: default
- cat-eye-color: default
- round-translate-strength: default
- cat-translate-strength: default
- round-highlight-scale: default
- round-highlight-offset-x: default
- round-highlight-offset-y: default
- round-highlight-rotation: default
- round-highlight-opacity: default
- cat-highlight-scale: default
- cat-highlight-offset-x: default
- cat-highlight-offset-y: default
- cat-highlight-rotation: default
- cat-highlight-opacity: default
- cat-pupil-highlight-morph-scale: default
- cat-blink-side-color: default
- cat-blink-side-opacity: default
- cat-blink-side-stroke-color: default
- cat-blink-side-stroke-width: default
- cat-blink-side-stroke-opacity: default
- cat-blink-bottom-color: default
- cat-blink-bottom-opacity: default
- cat-blink-bottom-stroke-color: default
- cat-blink-bottom-stroke-width: default
- cat-blink-bottom-stroke-opacity: default
- cat-blink-min-delay: default
- cat-blink-max-delay: default
- cat-blink-in-duration: default
- cat-blink-hold-duration: default
- cat-blink-out-duration: default
- cat-blink-side-delay: default
- cat-blink-ease-in: out-cubic
- cat-blink-ease-out: out-cubic
- background-color: default
- focus-scale: default
- focus-up-duration: default
- focus-down-duration: default
- focus-min-delay: default
- focus-max-delay: default
- focus-ease-up: out-cubic
- focus-ease-down: out-cubic

## Visual Elements to Verify

- [ ] Single eye isolated
- [ ] Group of eyes
- [ ] Mouse tracking behavior
- [ ] Blink animation (human + cat)
- [ ] Highlight / reflection on eyes
- [ ] Shadow rendering (inner + drop)

## Interactions

- Mouse movement: eyes follow cursor
- Click: repulse effect

## Notes

This baseline serves as the reference for all subsequent refactor steps.
Each step must maintain identical visual output and behavior.

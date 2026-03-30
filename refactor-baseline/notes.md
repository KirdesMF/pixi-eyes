# Visual Baseline Notes

Captured before starting the `refactor-main-foundation` branch.

## Current Settings (defaults)

- instance-count: default
- layout-shape: circle
- layout-transition-duration: default
- layout-transition-ease: out-cubic
- scroll-fall-enter-top-factor: default
- scroll-fall-exit-top-factor: default
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
- [ ] Fall / squash behavior on scroll
- [ ] Highlight / reflection on eyes
- [ ] Shadow rendering (inner + drop)

## Interactions

- Mouse movement: eyes follow cursor
- Click: repulse effect
- Scroll: fall animation when leaving viewport

## Notes

This baseline serves as the reference for all subsequent refactor steps.
Each step must maintain identical visual output and behavior.

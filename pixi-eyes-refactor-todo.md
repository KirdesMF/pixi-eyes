# PIXI Eyes Refactor Todo

## Goal
- Keep the same perceived look
- Keep blink, cursor tracking, cat morph, and motion behavior
- Remove runtime masking from the final render path
- Improve Safari and mobile performance
- Make progress step by step with screenshot and perf validation

## Working rules
- Do not change the design first
- Do not jump to full shader rendering first
- Keep Bézier-driven morph logic as the source of truth
- Replace dynamic `Graphics` rendering with mesh-based rendering where shapes morph
- Replace static layers with shared textures
- Every step must be testable before moving on

## Phase 0 — Baseline
- [ ] Add a reproducible benchmark mode
- [ ] Add a deterministic visual capture mode
- [ ] Capture round eye reference poses
- [ ] Capture cat eye reference poses
- [ ] Capture dense scene reference images
- [ ] Measure Chrome FPS / frame time / draw calls
- [ ] Measure Safari FPS / frame time / draw calls
- [ ] Save all baseline artifacts in a dedicated folder

### Validation
- [ ] I can reproduce the same captures twice
- [ ] I have “before refactor” screenshots for all critical poses
- [ ] I have “before refactor” perf numbers for Chrome and Safari

## Phase 1 — Extract geometry model from rendering
- [ ] Create a pure eye shape model module
- [ ] Create a pure blink shape model module
- [ ] Create a pure cat pupil shape model module
- [ ] Move Bézier control point logic out of Pixi `Graphics`
- [ ] Keep the current animation parameters unchanged

### Validation
- [ ] I can compute blink and cat pupil shapes without using Pixi `Graphics`
- [ ] The extracted model outputs the same control points as before

## Phase 2 — Build Bézier to mesh pipeline
- [ ] Add a Bézier sampling utility
- [ ] Add contour building utilities
- [ ] Add triangulation utilities
- [ ] Add a dynamic eye mesh abstraction
- [ ] Build a prototype for one round eye interior
- [ ] Build a prototype for one cat pupil shape

### Validation
- [ ] One round eye can render without dynamic `Graphics`
- [ ] One cat pupil can render without dynamic `Graphics`
- [ ] The prototype matches the baseline poses visually

## Phase 3 — Static shared texture buckets
- [ ] Define texture size buckets: small / medium / large
- [ ] Generate shared shadow textures per bucket
- [ ] Generate shared sclera textures per bucket
- [ ] Generate shared outline textures per bucket
- [ ] Generate shared globe highlight textures per bucket
- [ ] Add bucket selection based on rendered eye size

### Validation
- [ ] Static shell layers no longer depend on live `Graphics`
- [ ] No visible pixelation appears in the real display size range
- [ ] Bucket switching does not visibly pop

## Phase 4 — Rebuild one eye assembly without masks
- [ ] Replace per-eye mask assembly with layered objects
- [ ] Assemble one eye with: shadow / shell / dynamic interior / cover / highlight
- [ ] Remove `mask` usage from the test eye
- [ ] Remove dynamic `Graphics.clear()` from the test eye path

### Validation
- [ ] The rebuilt eye renders correctly with no runtime mask
- [ ] The rebuilt eye matches the baseline screenshots

## Phase 5 — Blink as geometry, not masking
- [ ] Port blink curves to the geometry model
- [ ] Render blink via mesh or cover geometry
- [ ] Preserve timing, easing, and silhouette
- [ ] Validate half-open and fully closed poses

### Validation
- [ ] Blink progression matches the original reference images
- [ ] No runtime mask is used for blink

## Phase 6 — Cat pupil morph as geometry
- [ ] Port cat pupil morph output to mesh geometry
- [ ] Preserve morph range and timing
- [ ] Preserve highlight relationship if needed
- [ ] Validate min / mid / max morph poses

### Validation
- [ ] Cat pupil morph matches the original reference images
- [ ] No runtime mask is used for cat pupil clipping

## Phase 7 — Add lightweight shader only where useful
- [ ] Add internal shading shader for iris / shadow / AA if needed
- [ ] Keep shape generation CPU-side for now
- [ ] Use shader only for finish, not for core shape definition
- [ ] Validate color and edge quality against baseline

### Validation
- [ ] Shader improves polish without changing silhouette
- [ ] No full analytic Bézier shader is required at this stage

## Phase 8 — Rebuild full eye field
- [ ] Replace old eye factory path with the new layered eye path
- [ ] Integrate new eye instances into `eye-field`
- [ ] Preserve tracking behavior
- [ ] Preserve shared attention behavior
- [ ] Preserve fall / return behavior if still desired

### Validation
- [ ] A full field works with the new eyes only
- [ ] The old masked path is no longer used in the final scene

## Phase 9 — Scene layering and batching
- [ ] Evaluate grouping by render layer
- [ ] Consider separate global layers for shadow / shell / interior / cover / highlight
- [ ] Reduce state changes and batch breaks
- [ ] Re-measure draw calls

### Validation
- [ ] Draw calls are reduced or stabilized
- [ ] Safari performance is better than baseline

## Phase 10 — Adaptive quality
- [ ] Add segment count adaptation based on eye screen size
- [ ] Add bucket selection based on DPR and eye size
- [ ] Add device tier caps for eye count if needed
- [ ] Add throttling for very small eyes if visually safe

### Validation
- [ ] Style stays consistent across devices
- [ ] Performance becomes more predictable on low-end hardware

## Phase 11 — Final regression gate
- [ ] Run screenshot diff on all reference poses
- [ ] Run scene diff on dense layouts
- [ ] Re-benchmark Chrome
- [ ] Re-benchmark Safari
- [ ] Remove dead code from the old masked implementation
- [ ] Document the final render architecture

### Final acceptance checklist
- [ ] Same perceived render quality
- [ ] Same blink feel
- [ ] Same tracking feel
- [ ] Same cat morph feel
- [ ] No runtime masks in final render path
- [ ] No dynamic `Graphics.clear()` in ticker path
- [ ] Safari performs materially better than baseline

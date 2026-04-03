# Fix Animation Glitch & CPU Performance

## Problem Summary

1. **Visual glitch during fall animation** (and subtle in normal state)
2. **CPU performance** - 400 eyes at 60-80 FPS, should be better

## Root Causes Identified

### Glitch Causes

1. **`root.sortableChildren` never set** (`eye-factory.ts:132`)
   - `root.zIndex = renderScale` is set but `sortableChildren` is never enabled
   - `root.sortChildren()` in `eye-field.ts:104` has NO EFFECT without this flag
   - Eyes render in insertion order, not by size → overlap artifacts

2. **Stale z-order during animation**
   - Z-order only sorted once during `rebuildEyes()`
   - During fall, squash/stretch changes effective visual size
   - Eyes can render behind larger neighbors after squash

3. **Transform stacking during fall** (`eye-controller.ts:116-127`)
   - Root has both `scale` (squash/stretch) AND `rotation` (fall spin)
   - All children inherit this combined transform
   - When squashScaleX ≠ squashScaleY AND rotation ≠ 0, children get sheared

### CPU Performance (GC Pressure)

~3600+ object allocations per frame at 400 eyes = 216,000+ allocations/second:

| Source                            | File                        | Allocations/frame |
| --------------------------------- | --------------------------- | ----------------- |
| `totalOffset()`                   | `eye-tracking.ts:125-130`   | 400               |
| IIFE cursor look                  | `eye-controller.ts:151-163` | 400               |
| `clampMagnitude()` (3+ calls/eye) | Multiple files              | 1200+             |
| `calculateParallaxOffset()`       | `eye-floating.ts:40-55`     | 400               |
| `calculateRepulsionTarget()`      | `eye-floating.ts:57-95`     | 400               |
| `sampleEyeSharedAttentionLook()`  | `eye-tracking.ts:165-198`   | 400               |
| `desiredLook` literal             | `eye-controller.ts:170-173` | 400               |

## Proposed Fixes

### 1. Fix z-ordering glitch (`eye-factory.ts`)

**Change**: Add `root.sortableChildren = true` before setting `root.zIndex`

```typescript
// Before (line 132):
root.zIndex = renderScale;

// After:
root.sortableChildren = true;
root.zIndex = renderScale;
```

**Impact**: Fixes the primary visual glitch — eyes will now properly render smaller in front of larger.

### 2. Re-sort z-order during squash/stretch (`eye-controller.ts`)

**Change**: After applying squash scale, re-sort children when scale changes significantly

```typescript
// After setting root.scale (around line 121):
const newVisualScale = eye.renderScale * introScaleProgress * Math.max(squashScaleX, squashScaleY);
if (Math.abs(newVisualScale - eye.lastSortedScale) > 0.01) {
  eye.lastSortedScale = newVisualScale;
  eye.root.zIndex = newVisualScale;
  eye.root.sortChildren();
}
```

Add `lastSortedScale: number` to `EyeInstance` type, initialized to `renderScale`.

**Impact**: Prevents z-order artifacts during dynamic scale changes (fall squash, focus pulse).

### 3. Eliminate ALL per-frame object allocations

#### 3a. Inline `totalOffset()` (`eye-controller.ts`)

```typescript
// Before (line 123):
const interactionOffset = totalOffset(eye);
const interactionDrawX = eye.x + interactionOffset.x + eye.fallOffsetX;
const interactionDrawY = eye.y + interactionOffset.y + eye.fallOffsetY;

// After:
const interactionDrawX = eye.x + eye.parallaxX + eye.repelX + eye.fallOffsetX;
const interactionDrawY = eye.y + eye.parallaxY + eye.repelY + eye.fallOffsetY;
```

Remove `totalOffset()` export from `eye-tracking.ts` (or keep for external use but don't call in hot path).

#### 3b. Eliminate IIFE cursor look allocation (`eye-controller.ts`)

```typescript
// Before (lines 149-163):
const cursorLook = runtime.trackingBlend > 0.0001
  ? (() => {
      const rawCursorLook = clampMagnitude(...);
      return { x: rawCursorLook.x * runtime.trackingBlend, y: rawCursorLook.y * runtime.trackingBlend };
    })()
  : { x: 0, y: 0 };

// After:
let cursorLookX = 0;
let cursorLookY = 0;
if (runtime.trackingBlend > 0.0001) {
  const rawCursorLookX = (runtime.mouseX - interactionDrawX) / eye.scale;
  const rawCursorLookY = (runtime.mouseY - interactionDrawY) / eye.scale;
  const length = Math.hypot(rawCursorLookX, rawCursorLookY);
  if (length > MAX_LOOK && length > 0.0001) {
    const scale = MAX_LOOK / length;
    cursorLookX = rawCursorLookX * scale * runtime.trackingBlend;
    cursorLookY = rawCursorLookY * scale * runtime.trackingBlend;
  } else {
    cursorLookX = rawCursorLookX * runtime.trackingBlend;
    cursorLookY = rawCursorLookY * runtime.trackingBlend;
  }
}
```

#### 3c. Eliminate `desiredLook` allocation (`eye-controller.ts`)

```typescript
// Before (lines 170-173):
const desiredLook = {
  x: lerp(cursorLook.x, sharedAttentionLook.x, runtime.sharedAttentionBlend),
  y: lerp(cursorLook.y, sharedAttentionLook.y, runtime.sharedAttentionBlend),
};
eye.lookX = smoothTowards(eye.lookX, desiredLook.x, lookSpeed, eyeSeconds);
eye.lookY = smoothTowards(eye.lookY, desiredLook.y, lookSpeed, eyeSeconds);

// After:
const desiredLookX = lerp(cursorLookX, sharedAttentionLookX, runtime.sharedAttentionBlend);
const desiredLookY = lerp(cursorLookY, sharedAttentionLookY, runtime.sharedAttentionBlend);
eye.lookX = smoothTowards(eye.lookX, desiredLookX, lookSpeed, eyeSeconds);
eye.lookY = smoothTowards(eye.lookY, desiredLookY, lookSpeed, eyeSeconds);
```

#### 3d. Eliminate `clampMagnitude` allocations in hot path

Replace all `clampMagnitude()` calls with inline logic that returns scalars:

**In `eye-controller.ts`** (cursor look): Already handled in 3b above.

**In `human-eye-view.ts`** (`applyHumanPupilAppearance` and `updateHumanEyeDeformation`):

```typescript
// Before:
const pupilOffset = clampMagnitude(
  eye.lookX * PUPIL_INNER_TRAVEL,
  eye.lookY * PUPIL_INNER_TRAVEL,
  maxPupilTravel,
);
const pupilX = irisX + pupilOffset.x;
const pupilY = irisY + pupilOffset.y;

// After:
const pupilOffsetX = eye.lookX * PUPIL_INNER_TRAVEL;
const pupilOffsetY = eye.lookY * PUPIL_INNER_TRAVEL;
const pupilLength = Math.hypot(pupilOffsetX, pupilOffsetY);
if (pupilLength > maxPupilTravel && pupilLength > 0.0001) {
  const s = maxPupilTravel / pupilLength;
  pupilX = irisX + pupilOffsetX * s;
  pupilY = irisY + pupilOffsetY * s;
} else {
  pupilX = irisX + pupilOffsetX;
  pupilY = irisY + pupilOffsetY;
}
```

**In `cat-eye-view.ts`** (`applyCatPupilAppearance`): Same pattern.

**In `eye-floating.ts`** (`calculateRepulsionTarget`):

```typescript
// Already avoids clampMagnitude, but returns {x, y} object
// Change to write into output params or return via scalar
```

#### 3e. Eliminate `calculateParallaxOffset` and `calculateRepulsionTarget` allocations (`eye-floating.ts`)

Change these functions to write directly into eye state instead of returning objects:

```typescript
// Before:
const parallax = calculateParallaxOffset(runtime, eye);
eye.parallaxX = parallax.x;
eye.parallaxY = parallax.y;

const targetRepel = calculateRepulsionTarget(runtime, eye);

// After:
updateParallaxOffset(runtime, eye); // writes directly to eye.parallaxX/Y
const targetRepelX = calculateRepulsionTargetX(runtime, eye);
const targetRepelY = calculateRepulsionTargetY(runtime, eye);
```

Or better: inline the logic directly since these are simple calculations.

#### 3f. Eliminate `sampleEyeSharedAttentionLook` allocation (`eye-tracking.ts`)

Change to return scalars or write into output:

```typescript
// Before:
const sharedAttentionLook = sampleEyeSharedAttentionLook(runtime, eye, mode);

// After:
let sharedAttentionLookX = 0;
let sharedAttentionLookY = 0;
if (runtime.sharedAttentionBlend > 0.0001) {
  const mode = runtime.pointerActive ? "scattered" : "unified";
  computeSharedAttentionLook(runtime, eye, mode); // writes to lookX/Y vars
}
```

### 4. Remove duplicate code (`eye-floating.ts`)

The `calculateParallaxOffset` and `calculateRepulsionTarget` functions in `eye-floating.ts` are near-identical copies of `parallaxOffset` and `repulsionTarget` in `eye-tracking.ts`.

**Fix**: Import from `eye-tracking.ts` and use the inline versions, or remove the duplicates entirely.

### 5. Optimize visibility culling order (`eye-controller.ts`)

Currently visibility is checked AFTER computing fall physics, floating behavior, squash, position, and rotation. Move the cheap visibility check earlier:

```typescript
// Move visibility check BEFORE floating behavior and squash calculations
// Only need: eye.x, eye.y, renderScale, fallOffsetX/Y (already computed)
```

### 6. Skip unnecessary work during scroll-fall lock

When `isScrollFallLocked` is true, skip the entire cursor look calculation block (lines 149-177 in `eye-controller.ts`). Currently it still computes `cursorLook` and `sharedAttentionLook` even though they'll be zeroed out.

## Files to Modify

1. `src/eye/eye-factory.ts` - Add `sortableChildren = true`, add `lastSortedScale` field
2. `src/eye/eye-state.ts` - Add `lastSortedScale: number` to `EyeInstance`
3. `src/eye/eye-controller.ts` - Major refactor: inline all allocations, re-sort z-order, early-out optimizations
4. `src/eye/eye-field.ts` - Remove `root.sortChildren()` call (now handled per-eye)
5. `src/eye/render/human-eye-view.ts` - Inline `clampMagnitude`
6. `src/eye/render/cat-eye-view.ts` - Inline `clampMagnitude`
7. `src/eye/behaviors/eye-floating.ts` - Remove duplicate functions, inline calculations
8. `src/eye/behaviors/eye-tracking.ts` - Optionally remove `totalOffset` export if unused elsewhere

## Expected Results

- **Glitch fix**: Proper z-ordering eliminates overlap artifacts during fall and normal state
- **Performance**: Eliminating ~3600 allocations/frame should reduce GC pressure significantly
  - Estimated improvement: 60-80 FPS → 90-120+ FPS at 400 eyes
  - Lower CPU usage, less battery drain

## Tradeoffs

- **Readability vs Performance**: Inlining `clampMagnitude` and object-returning functions makes code more verbose but eliminates GC pressure. This is the right tradeoff for a tight animation loop.
- **Z-sort frequency**: Re-sorting on every scale change adds some CPU cost. The `0.01` threshold prevents excessive sorting. Could be tuned if needed.

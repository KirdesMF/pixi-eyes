// Main eye field module - orchestrates eye field creation and updates

import { Container, Rectangle, type Renderer } from "pixi.js";

import type { EyeFieldConfig, EyeFieldMetrics } from "./eye-types";
import type { EyeFieldRuntime } from "./eye-state";
import {
  createSharedContexts,
  createSharedTextures,
  createDropShadowTexture,
  destroySharedTextures,
  destroySharedContexts,
  selectBucket,
} from "./eye-assets";
import { packEyePositions, resolvePackedRadii, staggerDelay } from "./layout";
import { createEyeInstance } from "./eye-factory";
import { startLayoutTransition, applyStaticEyeSettings, updateSingleEye } from "./eye-controller";
import {
  sampleSharedAttentionTarget,
  sampleSharedAttentionDelay,
  clickWaveLifetime,
} from "./behaviors/eye-tracking";
import { resetScrollFallState } from "./behaviors/eye-fall";
import { smoothTowards } from "../shared/math";
import { updateConfig, applyAppearanceRefresh } from "./eye-field-config";
import { createRuntime } from "./eye-field-runtime";

type EyeFieldOptions = {
  count: number;
  renderer: Renderer;
  worldBounds: Rectangle;
};

export type EyeField = {
  root: Container;
  layout: (width: number, height: number) => void;
  syncCount: (nextCount: number) => void;
  setConfig: (config: EyeFieldConfig) => void;
  setPointer: (x: number, y: number, isActive: boolean) => void;
  setScrollFall: (isActive: boolean) => void;
  pointerDown: (x: number, y: number) => void;
  update: (dtSeconds: number) => EyeFieldMetrics;
  destroy: () => void;
  _runtime: EyeFieldRuntime;
};

export function createEyeField({ count, renderer, worldBounds }: EyeFieldOptions): EyeField {
  const root = new Container();
  const runtime = createRuntime(count);
  const contexts = createSharedContexts();
  let textures = createSharedTextures(renderer, contexts, runtime.dropShadowBlur);

  function refreshDropShadowTexture(): void {
    for (const bucket of Object.values(textures.buckets)) {
      bucket.dropShadowTexture.destroy(true);
      bucket.dropShadowTexture = createDropShadowTexture(renderer, runtime.dropShadowBlur);
    }
    runtime.eyes.forEach((eye) => {
      eye.dropShadow.texture = textures.buckets[selectBucket(eye.radius)].dropShadowTexture;
    });
  }

  function rebuildEyes(): void {
    runtime.eyes.forEach((eye) => eye.root.destroy({ children: true }));
    runtime.eyes = [];
    root.removeChildren();
    const minEyeRadius = runtime.minEyeSize * 0.5;
    const maxEyeRadius = runtime.maxEyeSize * 0.5;
    const radii = resolvePackedRadii(runtime.count, minEyeRadius, maxEyeRadius);

    const positions = packEyePositions(
      radii,
      runtime.clusterRadius,
      runtime.packAttempts,
      runtime.spiralStepDegrees,
      runtime.radialExponent,
      0.73,
      runtime.layoutShape,
    );

    positions.forEach((position, index) => {
      const eye = createEyeInstance(
        contexts,
        textures,
        position.x,
        position.y,
        position.r,
        maxEyeRadius,
        positions.length,
        index + 1,
      );
      eye.delay = staggerDelay(
        index + 1,
        positions.length,
        runtime.staggerSeconds,
        runtime.randomizeStagger,
      );
      applyStaticEyeSettings(eye, runtime);
      runtime.eyes.push(eye);
      root.addChild(eye.root);
      // Start with full scale - no scale-in animation
      eye.root.scale.set(eye.renderScale);
      eye.scaleInFinished = true;
    });
    root.sortChildren();
  }

  function relayoutEyes(): void {
    if (runtime.eyes.length === 0) {
      return;
    }

    const positions = packEyePositions(
      runtime.eyes.map((eye) => eye.radius),
      runtime.clusterRadius,
      runtime.packAttempts,
      runtime.spiralStepDegrees,
      runtime.radialExponent,
      0.73,
      runtime.layoutShape,
    );

    positions.forEach((position, index) => {
      const eye = runtime.eyes[index];
      if (!eye) {
        return;
      }

      startLayoutTransition(eye, position.x, position.y, runtime.layoutTransitionDuration);
    });
  }

  function layout(width: number, height: number): void {
    runtime.clusterRadius = Math.min(width, height) * 0.42;
    root.position.set(width * 0.5, height * 0.5);
    if (runtime.eyes.length === runtime.count && runtime.eyes.length > 0) {
      relayoutEyes();
      return;
    }

    rebuildEyes();
  }

  function syncCount(nextCount: number): void {
    runtime.count = Math.max(0, Math.floor(nextCount));
    rebuildEyes();
  }

  function setConfig(config: EyeFieldConfig): void {
    const result = updateConfig(runtime, config);

    if (result.shouldRefreshDropShadowTexture) {
      refreshDropShadowTexture();
    }

    if (result.shouldRebuild) {
      rebuildEyes();
    } else if (result.shouldRelayout) {
      relayoutEyes();
    } else if (result.shouldRefreshAppearance) {
      applyAppearanceRefresh(runtime);
    }
  }

  function setPointer(x: number, y: number, isActive: boolean): void {
    if (root.destroyed) {
      return;
    }

    if (!isActive) {
      runtime.pointerActive = false;
      runtime.scrollFallResumePointerActive = false;
      return;
    }

    const nextTargetMouseX = x - root.position.x;
    const nextTargetMouseY = y - root.position.y;

    if (runtime.scrollFallTarget > 0.5) {
      runtime.pointerActive = false;
      runtime.scrollFallResumePointerActive = true;
      runtime.targetMouseX = nextTargetMouseX;
      runtime.targetMouseY = nextTargetMouseY;
      return;
    }
    const movedDistance = Math.hypot(
      nextTargetMouseX - runtime.targetMouseX,
      nextTargetMouseY - runtime.targetMouseY,
    );
    const isNewPointerSession = !runtime.pointerActive;

    if (isNewPointerSession) {
      runtime.trackingBlend = 0;
      runtime.sharedAttentionBlend = 0;
      runtime.sharedAttentionX = 0;
      runtime.sharedAttentionY = 0;
      // Don't reset mouseX/Y - let them smooth towards target naturally
      // This prevents jump when mouse re-enters canvas
      runtime.targetMouseX = nextTargetMouseX;
      runtime.targetMouseY = nextTargetMouseY;
      runtime.eyes.forEach((eye) => {
        eye.parallaxX = 0;
        eye.parallaxY = 0;
        eye.repelX = 0;
        eye.repelY = 0;
        eye.lookX = 0;
        eye.lookY = 0;
        eye.currentScaleX = 1;
        eye.currentScaleY = 1;
        eye.currentAngle = 0;
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    }

    if (isNewPointerSession || movedDistance > 0.5) {
      runtime.lastPointerMoveAt = runtime.elapsed;
      runtime.nextSharedAttentionAt = runtime.elapsed + runtime.sharedAttentionDelay;
    }

    runtime.pointerActive = true;
    runtime.targetMouseX = nextTargetMouseX;
    runtime.targetMouseY = nextTargetMouseY;
  }

  function setScrollFall(isActive: boolean): void {
    if (root.destroyed) {
      return;
    }

    const nextTarget = isActive ? 1 : 0;
    if (runtime.scrollFallTarget === nextTarget) {
      return;
    }

    runtime.scrollFallTarget = nextTarget;
    runtime.scrollFallElapsed = 0;
    runtime.scrollReturnElapsed = nextTarget <= 0.5 ? 0 : Number.POSITIVE_INFINITY;
    runtime.waves.length = 0;
    if (isActive) {
      runtime.scrollFallResumePointerActive = runtime.pointerActive;
      runtime.pointerActive = false;
      runtime.eyes.forEach((eye) => {
        resetScrollFallState(eye);
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    } else {
      runtime.pointerActive = runtime.scrollFallResumePointerActive;
      runtime.eyes.forEach((eye) => {
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    }
  }

  function pointerDown(x: number, y: number): void {
    if (root.destroyed) {
      return;
    }

    if (runtime.scrollFallTarget > 0.5) {
      return;
    }

    setPointer(x, y, true);
    runtime.waves.push({
      x: runtime.mouseX,
      y: runtime.mouseY,
      elapsed: 0,
    });
  }

  function update(dtSeconds: number): EyeFieldMetrics {
    runtime.elapsed += Math.max(dtSeconds, 0);
    const isScrollFallLocked = runtime.scrollFallTarget > 0.5;
    const trackingTarget = runtime.pointerActive && !isScrollFallLocked ? 1 : 0;
    runtime.trackingBlend = smoothTowards(
      runtime.trackingBlend,
      trackingTarget,
      runtime.trackingBlendSpeed,
      dtSeconds,
    );
    runtime.mouseX = smoothTowards(
      runtime.mouseX,
      runtime.targetMouseX,
      runtime.pointerEaseSpeed,
      dtSeconds,
    );
    runtime.mouseY = smoothTowards(
      runtime.mouseY,
      runtime.targetMouseY,
      runtime.pointerEaseSpeed,
      dtSeconds,
    );
    const sharedAttentionIdle =
      !isScrollFallLocked &&
      runtime.elapsed - runtime.lastPointerMoveAt >= runtime.sharedAttentionDelay;

    if (sharedAttentionIdle && runtime.elapsed >= runtime.nextSharedAttentionAt) {
      const nextTarget = sampleSharedAttentionTarget(runtime);
      runtime.sharedAttentionX = nextTarget.x;
      runtime.sharedAttentionY = nextTarget.y;
      runtime.nextSharedAttentionAt = runtime.elapsed + sampleSharedAttentionDelay(runtime);
    }

    runtime.sharedAttentionBlend = smoothTowards(
      runtime.sharedAttentionBlend,
      sharedAttentionIdle ? 1 : 0,
      runtime.sharedAttentionBlendSpeed,
      dtSeconds,
    );
    runtime.scrollFallBlend = smoothTowards(
      runtime.scrollFallBlend,
      runtime.scrollFallTarget,
      runtime.scrollFallBlendSpeed,
      dtSeconds,
    );
    runtime.scrollFallElapsed =
      runtime.scrollFallTarget > 0.5 ? runtime.scrollFallElapsed + dtSeconds : 0;
    runtime.scrollReturnElapsed =
      runtime.scrollFallTarget <= 0.5
        ? runtime.scrollReturnElapsed + dtSeconds
        : Number.POSITIVE_INFINITY;
    for (let waveIndex = runtime.waves.length - 1; waveIndex >= 0; waveIndex -= 1) {
      const wave = runtime.waves[waveIndex];
      wave.elapsed += dtSeconds;
      if (wave.elapsed >= clickWaveLifetime(runtime.clickRepulseRadius)) {
        runtime.waves.splice(waveIndex, 1);
      }
    }

    let visibleCount = 0;

    runtime.eyes.forEach((eye) => {
      updateSingleEye(eye, runtime, worldBounds, dtSeconds, isScrollFallLocked);
      if (eye.root.visible) {
        visibleCount += 1;
      }
    });

    return {
      visibleCount,
    };
  }

  rebuildEyes();

  return {
    root,
    layout,
    syncCount,
    setConfig,
    setPointer,
    setScrollFall,
    pointerDown,
    update,
    _runtime: runtime,
    destroy: () => {
      if (root.destroyed) {
        return;
      }

      root.destroy({ children: true });
      destroySharedTextures(textures);
      destroySharedContexts(contexts);
    },
  };
}

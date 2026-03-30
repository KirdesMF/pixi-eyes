// Main eye field module

import { Container, Rectangle, type Renderer } from "pixi.js";

import type { EyeFieldConfig, EyeFieldMetrics } from "./eye-types";
import type { EyeInstance, EyeFieldRuntime } from "./eye-state";
import {
  createSharedContexts,
  createSharedTextures,
  createDropShadowTexture,
  destroySharedTextures,
  destroySharedContexts,
  DEFAULT_IRIS_COLOR,
  DEFAULT_CAT_EYE_COLOR,
} from "./eye-assets";
import {
  DEFAULT_PACK_ATTEMPTS,
  DEFAULT_SPIRAL_STEP_DEGREES,
  DEFAULT_RADIAL_EXPONENT,
  DEFAULT_EYE_SPIRAL_OFFSET,
  DEFAULT_CLUSTER_RADIUS,
  DEFAULT_LAYOUT_SHAPE,
  DEFAULT_LAYOUT_TRANSITION_DURATION,
  DEFAULT_LAYOUT_TRANSITION_EASE,
  DEFAULT_MIN_EYE_SIZE,
  DEFAULT_MAX_EYE_SIZE,
  DEFAULT_CAT_MIX,
  DEFAULT_CAT_MORPH_RADIUS,
  DEFAULT_STAGGER_SECONDS,
  DEFAULT_RANDOMIZE_STAGGER,
  DEFAULT_PARALLAX_STRENGTH,
  DEFAULT_REPULSION_RADIUS,
  DEFAULT_CLICK_REPULSE_RADIUS,
  DEFAULT_CLICK_REPULSE_STRENGTH,
  DEFAULT_CLICK_REPULSE_EASE,
  DEFAULT_REPULSION_STRENGTH,
  DEFAULT_REPULSION_RETURN_SPEED,
  DEFAULT_SMALL_EYE_LOOK_SPEED,
  DEFAULT_LARGE_EYE_LOOK_SPEED,
  DEFAULT_TRACKING_BLEND_SPEED,
  DEFAULT_POINTER_EASE_SPEED,
  DEFAULT_SHARED_ATTENTION_DELAY,
  DEFAULT_SHARED_ATTENTION_RETARGET_MIN_DELAY,
  DEFAULT_SHARED_ATTENTION_RETARGET_MAX_DELAY,
  DEFAULT_SHARED_ATTENTION_BLEND_SPEED,
  DEFAULT_SCROLL_FALL_BLEND_SPEED,
  DEFAULT_SHADOW_OPACITY,
  DEFAULT_DROP_SHADOW_COLOR,
  DEFAULT_DROP_SHADOW_OPACITY,
  DEFAULT_DROP_SHADOW_BLUR,
  DEFAULT_DROP_SHADOW_SPREAD,
  DEFAULT_ROUND_INNER_SHADOW_COLOR,
  DEFAULT_CAT_INNER_SHADOW_COLOR,
  DEFAULT_ROUND_TRANSLATE_STRENGTH,
  DEFAULT_CAT_TRANSLATE_STRENGTH,
  DEFAULT_ROUND_GLOBE_HIGHLIGHT_SCALE,
  DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_X,
  DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_Y,
  DEFAULT_ROUND_GLOBE_HIGHLIGHT_ROTATION_DEGREES,
  DEFAULT_ROUND_GLOBE_HIGHLIGHT_OPACITY,
  DEFAULT_CAT_GLOBE_HIGHLIGHT_ROTATION_DEGREES,
  DEFAULT_CAT_GLOBE_HIGHLIGHT_SCALE,
  DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_X_FACTOR,
  DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_Y_FACTOR,
  DEFAULT_CAT_GLOBE_HIGHLIGHT_OPACITY,
  DEFAULT_CAT_PUPIL_HIGHLIGHT_MORPH_SCALE,
  DEFAULT_CAT_BLINK_SIDE_COLOR,
  DEFAULT_CAT_BLINK_SIDE_OPACITY,
  DEFAULT_CAT_BLINK_SIDE_STROKE_COLOR,
  DEFAULT_CAT_BLINK_SIDE_STROKE_WIDTH,
  DEFAULT_CAT_BLINK_SIDE_STROKE_OPACITY,
  DEFAULT_CAT_BLINK_BOTTOM_COLOR,
  DEFAULT_CAT_BLINK_BOTTOM_OPACITY,
  DEFAULT_CAT_BLINK_BOTTOM_STROKE_COLOR,
  DEFAULT_CAT_BLINK_BOTTOM_STROKE_WIDTH,
  DEFAULT_CAT_BLINK_BOTTOM_STROKE_OPACITY,
  DEFAULT_CAT_BLINK_MIN_DELAY,
  DEFAULT_CAT_BLINK_MAX_DELAY,
  DEFAULT_CAT_BLINK_IN_DURATION,
  DEFAULT_CAT_BLINK_HOLD_DURATION,
  DEFAULT_CAT_BLINK_OUT_DURATION,
  DEFAULT_CAT_BLINK_SIDE_DELAY,
  DEFAULT_CAT_BLINK_EASE_IN,
  DEFAULT_CAT_BLINK_EASE_OUT,
  DEFAULT_FOCUS_SCALE,
  DEFAULT_FOCUS_UP_DURATION,
  DEFAULT_FOCUS_DOWN_DURATION,
  DEFAULT_FOCUS_MIN_DELAY,
  DEFAULT_FOCUS_MAX_DELAY,
  DEFAULT_FOCUS_EASE_UP,
  DEFAULT_FOCUS_EASE_DOWN,
} from "./eye-config";
import { packEyePositions, resolvePackedRadii, resolveEyeType, staggerDelay } from "./layout";
import { createEyeInstance, resolveScaleInProgress } from "./eye-factory";
import { startLayoutTransition, applyStaticEyeSettings, updateSingleEye } from "./eye-controller";
import {
  sampleSharedAttentionTarget,
  sampleSharedAttentionDelay,
  clickWaveLifetime,
} from "./behaviors/eye-tracking";
import { clamp, smoothTowards } from "../shared/math";

interface EyeFieldOptions {
  count: number;
  renderer: Renderer;
  worldBounds: Rectangle;
}

export function createEyeField({ count, renderer, worldBounds }: EyeFieldOptions) {
  const root = new Container();
  const runtime = createRuntime(count);
  const contexts = createSharedContexts();
  let textures = createSharedTextures(renderer, contexts, runtime.dropShadowBlur);

  const refreshDropShadowTexture = () => {
    const previousTexture = textures.dropShadowTexture;
    textures = {
      ...textures,
      dropShadowTexture: createDropShadowTexture(renderer, runtime.dropShadowBlur),
    };
    runtime.eyes.forEach((eye) => {
      eye.dropShadow.texture = textures.dropShadowTexture;
    });
    previousTexture.destroy(true);
  };

  const rebuildEyes = () => {
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
      DEFAULT_EYE_SPIRAL_OFFSET,
      runtime.layoutShape,
    );

    positions.forEach((position, index) => {
      const eyeType = resolveEyeType(index + 1, positions.length, runtime.catMix);
      const eye = createEyeInstance(
        contexts,
        textures,
        eyeType,
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
      eye.root.scale.set(eye.renderScale * resolveScaleInProgress(eye, runtime.elapsed));
    });
    root.sortChildren();
  };

  const relayoutEyes = () => {
    if (runtime.eyes.length === 0) {
      return;
    }

    const positions = packEyePositions(
      runtime.eyes.map((eye) => eye.radius),
      runtime.clusterRadius,
      runtime.packAttempts,
      runtime.spiralStepDegrees,
      runtime.radialExponent,
      DEFAULT_EYE_SPIRAL_OFFSET,
      runtime.layoutShape,
    );

    positions.forEach((position, index) => {
      const eye = runtime.eyes[index];
      if (!eye) {
        return;
      }

      startLayoutTransition(eye, position.x, position.y, runtime.layoutTransitionDuration);
    });
  };

  const layout = (width: number, height: number) => {
    runtime.clusterRadius = Math.max(Math.min(width, height) * 0.42, runtime.maxEyeSize * 0.5 + 40);
    root.position.set(width * 0.5, height * 0.5);
    if (runtime.eyes.length === runtime.count && runtime.eyes.length > 0) {
      relayoutEyes();
      return;
    }

    rebuildEyes();
  };

  const syncCount = (nextCount: number) => {
    runtime.count = Math.max(0, Math.floor(nextCount));
    rebuildEyes();
  };

  const setConfig = ({
    layoutShape,
    layoutTransitionDuration,
    layoutTransitionEase,
    minEyeSize,
    maxEyeSize,
    catMix,
    catMorphRadius,
    repulsionRadius,
    clickRepulseRadius,
    clickRepulseStrength,
    clickRepulseEase,
    staggerSeconds,
    shadowOpacity,
    dropShadowColor,
    dropShadowOpacity,
    dropShadowBlur,
    dropShadowSpread,
    roundInnerShadowColor,
    catInnerShadowColor,
    irisColor,
    catEyeColor,
    roundTranslateStrength,
    catTranslateStrength,
    roundHighlightScale,
    roundHighlightOffsetX,
    roundHighlightOffsetY,
    roundHighlightRotationDegrees,
    roundHighlightOpacity,
    catHighlightScale,
    catHighlightOffsetX,
    catHighlightOffsetY,
    catHighlightRotationDegrees,
    catHighlightOpacity,
    catPupilHighlightMorphScale,
    catBlinkSideColor,
    catBlinkSideOpacity,
    catBlinkSideStrokeColor,
    catBlinkSideStrokeWidth,
    catBlinkSideStrokeOpacity,
    catBlinkBottomColor,
    catBlinkBottomOpacity,
    catBlinkBottomStrokeColor,
    catBlinkBottomStrokeWidth,
    catBlinkBottomStrokeOpacity,
    catBlinkMinDelay,
    catBlinkMaxDelay,
    catBlinkInDuration,
    catBlinkHoldDuration,
    catBlinkOutDuration,
    catBlinkSideDelay,
    catBlinkEaseIn,
    catBlinkEaseOut,
    focusScale,
    focusUpDuration,
    focusDownDuration,
    focusMinDelay,
    focusMaxDelay,
    focusEaseUp,
    focusEaseDown,
  }: EyeFieldConfig) => {
    let shouldRebuild = false;
    let shouldRefreshDropShadowTexture = false;
    let shouldRefreshAppearance = false;
    let shouldRelayout = false;

    if (typeof layoutShape === "string" && layoutShape !== runtime.layoutShape) {
      runtime.layoutShape = layoutShape;
      shouldRelayout = true;
    }

    if (typeof layoutTransitionDuration === "number") {
      runtime.layoutTransitionDuration = Math.max(layoutTransitionDuration, 0);
    }

    if (typeof layoutTransitionEase === "string") {
      runtime.layoutTransitionEase = layoutTransitionEase;
    }

    if (typeof catMix === "number") {
      const nextCatMix = clamp(catMix, 0, 1);
      if (nextCatMix !== runtime.catMix) {
        runtime.catMix = nextCatMix;
        shouldRebuild = true;
      }
    }

    if (typeof catMorphRadius === "number") {
      runtime.catMorphRadius = Math.max(catMorphRadius, 0);
    }

    if (typeof catEyeColor === "number" && Number.isFinite(catEyeColor)) {
      runtime.catEyeColor = catEyeColor;
    }

    if (typeof minEyeSize === "number") {
      runtime.minEyeSize = Math.max(1, minEyeSize);
      shouldRebuild = true;
    }

    if (typeof maxEyeSize === "number") {
      runtime.maxEyeSize = Math.max(8, maxEyeSize);
      shouldRebuild = true;
    }

    if (runtime.minEyeSize > runtime.maxEyeSize) {
      const adjusted = runtime.minEyeSize;
      runtime.minEyeSize = runtime.maxEyeSize;
      runtime.maxEyeSize = adjusted;
    }

    if (typeof repulsionRadius === "number") {
      runtime.repulsionRadius = Math.max(0, repulsionRadius);
    }

    if (typeof clickRepulseRadius === "number") {
      runtime.clickRepulseRadius = Math.max(0, clickRepulseRadius);
    }

    if (typeof clickRepulseStrength === "number") {
      runtime.clickRepulseStrength = Math.max(0, clickRepulseStrength);
    }

    if (typeof clickRepulseEase === "string") {
      runtime.clickRepulseEase = clickRepulseEase;
    }

    if (typeof staggerSeconds === "number") {
      runtime.staggerSeconds = Math.max(0, staggerSeconds);
      shouldRebuild = true;
    }

    if (typeof shadowOpacity === "number") {
      runtime.shadowOpacity = clamp(shadowOpacity, 0, 1);
    }

    if (typeof dropShadowColor === "number" && Number.isFinite(dropShadowColor)) {
      runtime.dropShadowColor = dropShadowColor;
    }

    if (typeof dropShadowOpacity === "number") {
      runtime.dropShadowOpacity = clamp(dropShadowOpacity, 0, 1);
    }

    if (typeof dropShadowBlur === "number") {
      const nextDropShadowBlur = Math.max(dropShadowBlur, 0);
      if (nextDropShadowBlur !== runtime.dropShadowBlur) {
        runtime.dropShadowBlur = nextDropShadowBlur;
        shouldRefreshDropShadowTexture = true;
      }
    }

    if (typeof dropShadowSpread === "number") {
      runtime.dropShadowSpread = Math.max(dropShadowSpread, 0);
    }

    if (typeof roundInnerShadowColor === "number" && Number.isFinite(roundInnerShadowColor)) {
      runtime.roundInnerShadowColor = roundInnerShadowColor;
    }

    if (typeof catInnerShadowColor === "number" && Number.isFinite(catInnerShadowColor)) {
      runtime.catInnerShadowColor = catInnerShadowColor;
    }

    if (typeof irisColor === "number" && Number.isFinite(irisColor)) {
      runtime.irisColor = irisColor;
    }

    if (typeof roundTranslateStrength === "number") {
      runtime.roundTranslateStrength = clamp(roundTranslateStrength, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catTranslateStrength === "number") {
      runtime.catTranslateStrength = clamp(catTranslateStrength, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightScale === "number") {
      runtime.roundHighlightScale = Math.max(roundHighlightScale, 0);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightOffsetX === "number") {
      runtime.roundHighlightOffsetX = clamp(roundHighlightOffsetX, -100, 100);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightOffsetY === "number") {
      runtime.roundHighlightOffsetY = clamp(roundHighlightOffsetY, -100, 100);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightRotationDegrees === "number") {
      runtime.roundHighlightRotationDegrees = clamp(roundHighlightRotationDegrees, -180, 180);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightOpacity === "number") {
      runtime.roundHighlightOpacity = clamp(roundHighlightOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightScale === "number") {
      runtime.catHighlightScale = Math.max(catHighlightScale, 0);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightOffsetX === "number") {
      runtime.catHighlightOffsetX = clamp(catHighlightOffsetX, -1, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightOffsetY === "number") {
      runtime.catHighlightOffsetY = clamp(catHighlightOffsetY, -1, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightRotationDegrees === "number") {
      runtime.catHighlightRotationDegrees = clamp(catHighlightRotationDegrees, -180, 180);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightOpacity === "number") {
      runtime.catHighlightOpacity = clamp(catHighlightOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catPupilHighlightMorphScale === "number") {
      runtime.catPupilHighlightMorphScale = clamp(catPupilHighlightMorphScale, 1, 8);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideColor === "number" && Number.isFinite(catBlinkSideColor)) {
      runtime.catBlinkSideColor = catBlinkSideColor;
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideOpacity === "number") {
      runtime.catBlinkSideOpacity = clamp(catBlinkSideOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideStrokeColor === "number" && Number.isFinite(catBlinkSideStrokeColor)) {
      runtime.catBlinkSideStrokeColor = catBlinkSideStrokeColor;
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideStrokeWidth === "number") {
      runtime.catBlinkSideStrokeWidth = clamp(catBlinkSideStrokeWidth, 0, 8);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideStrokeOpacity === "number") {
      runtime.catBlinkSideStrokeOpacity = clamp(catBlinkSideStrokeOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkBottomColor === "number" && Number.isFinite(catBlinkBottomColor)) {
      runtime.catBlinkBottomColor = catBlinkBottomColor;
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkBottomOpacity === "number") {
      runtime.catBlinkBottomOpacity = clamp(catBlinkBottomOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (
      typeof catBlinkBottomStrokeColor === "number" &&
      Number.isFinite(catBlinkBottomStrokeColor)
    ) {
      runtime.catBlinkBottomStrokeColor = catBlinkBottomStrokeColor;
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkBottomStrokeWidth === "number") {
      runtime.catBlinkBottomStrokeWidth = clamp(catBlinkBottomStrokeWidth, 0, 8);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkBottomStrokeOpacity === "number") {
      runtime.catBlinkBottomStrokeOpacity = clamp(catBlinkBottomStrokeOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkMinDelay === "number") {
      runtime.catBlinkMinDelay = Math.max(catBlinkMinDelay, 0);
    }

    if (typeof catBlinkMaxDelay === "number") {
      runtime.catBlinkMaxDelay = Math.max(catBlinkMaxDelay, 0);
    }

    if (runtime.catBlinkMinDelay > runtime.catBlinkMaxDelay) {
      const adjusted = runtime.catBlinkMinDelay;
      runtime.catBlinkMinDelay = runtime.catBlinkMaxDelay;
      runtime.catBlinkMaxDelay = adjusted;
    }

    if (typeof catBlinkInDuration === "number") {
      runtime.catBlinkInDuration = Math.max(catBlinkInDuration, 0.01);
    }

    if (typeof catBlinkHoldDuration === "number") {
      runtime.catBlinkHoldDuration = Math.max(catBlinkHoldDuration, 0);
    }

    if (typeof catBlinkOutDuration === "number") {
      runtime.catBlinkOutDuration = Math.max(catBlinkOutDuration, 0.01);
    }

    if (typeof catBlinkSideDelay === "number") {
      runtime.catBlinkSideDelay = Math.max(catBlinkSideDelay, 0);
    }

    if (typeof catBlinkEaseIn === "string") {
      runtime.catBlinkEaseIn = catBlinkEaseIn;
    }

    if (typeof catBlinkEaseOut === "string") {
      runtime.catBlinkEaseOut = catBlinkEaseOut;
    }

    if (typeof focusScale === "number") {
      runtime.focusScale = Math.max(focusScale, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof focusUpDuration === "number") {
      runtime.focusUpDuration = Math.max(focusUpDuration, 0.01);
      shouldRefreshAppearance = true;
    }

    if (typeof focusDownDuration === "number") {
      runtime.focusDownDuration = Math.max(focusDownDuration, 0.01);
      shouldRefreshAppearance = true;
    }

    if (typeof focusMinDelay === "number") {
      runtime.focusMinDelay = Math.max(focusMinDelay, 0);
      shouldRefreshAppearance = true;
    }

    if (typeof focusMaxDelay === "number") {
      runtime.focusMaxDelay = Math.max(focusMaxDelay, 0);
      shouldRefreshAppearance = true;
    }

    if (runtime.focusMinDelay > runtime.focusMaxDelay) {
      const adjusted = runtime.focusMinDelay;
      runtime.focusMinDelay = runtime.focusMaxDelay;
      runtime.focusMaxDelay = adjusted;
    }

    if (typeof focusEaseUp === "string") {
      runtime.focusEaseUp = focusEaseUp;
      shouldRefreshAppearance = true;
    }

    if (typeof focusEaseDown === "string") {
      runtime.focusEaseDown = focusEaseDown;
      shouldRefreshAppearance = true;
    }

    if (
      typeof shadowOpacity === "number" ||
      typeof dropShadowColor === "number" ||
      typeof dropShadowOpacity === "number" ||
      typeof dropShadowBlur === "number" ||
      typeof dropShadowSpread === "number" ||
      typeof roundInnerShadowColor === "number" ||
      typeof catInnerShadowColor === "number" ||
      typeof irisColor === "number" ||
      typeof catEyeColor === "number" ||
      typeof roundHighlightScale === "number" ||
      typeof roundHighlightOffsetX === "number" ||
      typeof roundHighlightOffsetY === "number" ||
      typeof roundHighlightRotationDegrees === "number" ||
      typeof roundHighlightOpacity === "number" ||
      typeof catHighlightScale === "number" ||
      typeof catHighlightOffsetX === "number" ||
      typeof catHighlightOffsetY === "number" ||
      typeof catHighlightRotationDegrees === "number" ||
      typeof catHighlightOpacity === "number" ||
      typeof catBlinkSideColor === "number" ||
      typeof catBlinkSideOpacity === "number" ||
      typeof catBlinkSideStrokeColor === "number" ||
      typeof catBlinkSideStrokeWidth === "number" ||
      typeof catBlinkSideStrokeOpacity === "number" ||
      typeof catBlinkBottomColor === "number" ||
      typeof catBlinkBottomOpacity === "number" ||
      typeof catBlinkBottomStrokeColor === "number" ||
      typeof catBlinkBottomStrokeWidth === "number" ||
      typeof catBlinkBottomStrokeOpacity === "number"
    ) {
      runtime.eyes.forEach((eye) => {
        applyStaticEyeSettings(eye, runtime);
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    }

    if (shouldRefreshDropShadowTexture) {
      refreshDropShadowTexture();
    }

    if (shouldRebuild) {
      rebuildEyes();
    } else if (shouldRelayout) {
      relayoutEyes();
    } else if (shouldRefreshAppearance) {
      runtime.eyes.forEach((eye) => {
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    }
  };

  const setPointer = (x: number, y: number, isActive: boolean) => {
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
      runtime.mouseX = nextTargetMouseX;
      runtime.mouseY = nextTargetMouseY;
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
        eye.catMorph = 0;
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
  };

  const setScrollFall = (isActive: boolean) => {
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
  };

  const pointerDown = (x: number, y: number) => {
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
  };

  const update = (dtSeconds: number): EyeFieldMetrics => {
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
  };

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

function createRuntime(count: number): EyeFieldRuntime {
  return {
    count,
    clusterRadius: DEFAULT_CLUSTER_RADIUS,
    layoutShape: DEFAULT_LAYOUT_SHAPE,
    layoutTransitionDuration: DEFAULT_LAYOUT_TRANSITION_DURATION,
    layoutTransitionEase: DEFAULT_LAYOUT_TRANSITION_EASE,
    minEyeSize: DEFAULT_MIN_EYE_SIZE,
    maxEyeSize: DEFAULT_MAX_EYE_SIZE,
    catMix: DEFAULT_CAT_MIX,
    catMorphRadius: DEFAULT_CAT_MORPH_RADIUS,
    packAttempts: DEFAULT_PACK_ATTEMPTS,
    spiralStepDegrees: DEFAULT_SPIRAL_STEP_DEGREES,
    radialExponent: DEFAULT_RADIAL_EXPONENT,
    staggerSeconds: DEFAULT_STAGGER_SECONDS,
    randomizeStagger: DEFAULT_RANDOMIZE_STAGGER,
    parallaxStrength: DEFAULT_PARALLAX_STRENGTH,
    repulsionRadius: DEFAULT_REPULSION_RADIUS,
    clickRepulseRadius: DEFAULT_CLICK_REPULSE_RADIUS,
    clickRepulseStrength: DEFAULT_CLICK_REPULSE_STRENGTH,
    clickRepulseEase: DEFAULT_CLICK_REPULSE_EASE,
    repulsionStrength: DEFAULT_REPULSION_STRENGTH,
    repulsionReturnSpeed: DEFAULT_REPULSION_RETURN_SPEED,
    smallEyeLookSpeed: DEFAULT_SMALL_EYE_LOOK_SPEED,
    largeEyeLookSpeed: DEFAULT_LARGE_EYE_LOOK_SPEED,
    trackingBlendSpeed: DEFAULT_TRACKING_BLEND_SPEED,
    pointerEaseSpeed: DEFAULT_POINTER_EASE_SPEED,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    pointerActive: false,
    scrollFallResumePointerActive: false,
    elapsed: 0,
    trackingBlend: 0,
    sharedAttentionDelay: DEFAULT_SHARED_ATTENTION_DELAY,
    sharedAttentionRetargetMinDelay: DEFAULT_SHARED_ATTENTION_RETARGET_MIN_DELAY,
    sharedAttentionRetargetMaxDelay: DEFAULT_SHARED_ATTENTION_RETARGET_MAX_DELAY,
    sharedAttentionBlend: 0,
    sharedAttentionBlendSpeed: DEFAULT_SHARED_ATTENTION_BLEND_SPEED,
    sharedAttentionX: 0,
    sharedAttentionY: 0,
    lastPointerMoveAt: 0,
    nextSharedAttentionAt: DEFAULT_SHARED_ATTENTION_DELAY,
    scrollFallBlend: 0,
    scrollFallTarget: 0,
    scrollFallElapsed: 0,
    scrollReturnElapsed: Number.POSITIVE_INFINITY,
    scrollFallBlendSpeed: DEFAULT_SCROLL_FALL_BLEND_SPEED,
    shadowOpacity: DEFAULT_SHADOW_OPACITY,
    dropShadowColor: DEFAULT_DROP_SHADOW_COLOR,
    dropShadowOpacity: DEFAULT_DROP_SHADOW_OPACITY,
    dropShadowBlur: DEFAULT_DROP_SHADOW_BLUR,
    dropShadowSpread: DEFAULT_DROP_SHADOW_SPREAD,
    roundInnerShadowColor: DEFAULT_ROUND_INNER_SHADOW_COLOR,
    catInnerShadowColor: DEFAULT_CAT_INNER_SHADOW_COLOR,
    irisColor: DEFAULT_IRIS_COLOR,
    catEyeColor: DEFAULT_CAT_EYE_COLOR,
    roundTranslateStrength: DEFAULT_ROUND_TRANSLATE_STRENGTH,
    catTranslateStrength: DEFAULT_CAT_TRANSLATE_STRENGTH,
    roundHighlightScale: DEFAULT_ROUND_GLOBE_HIGHLIGHT_SCALE,
    roundHighlightOffsetX: DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_X,
    roundHighlightOffsetY: DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_Y,
    roundHighlightRotationDegrees: DEFAULT_ROUND_GLOBE_HIGHLIGHT_ROTATION_DEGREES,
    roundHighlightOpacity: DEFAULT_ROUND_GLOBE_HIGHLIGHT_OPACITY,
    catHighlightScale: DEFAULT_CAT_GLOBE_HIGHLIGHT_SCALE,
    catHighlightOffsetX: DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_X_FACTOR,
    catHighlightOffsetY: DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_Y_FACTOR,
    catHighlightRotationDegrees: DEFAULT_CAT_GLOBE_HIGHLIGHT_ROTATION_DEGREES,
    catHighlightOpacity: DEFAULT_CAT_GLOBE_HIGHLIGHT_OPACITY,
    catPupilHighlightMorphScale: DEFAULT_CAT_PUPIL_HIGHLIGHT_MORPH_SCALE,
    catBlinkSideColor: DEFAULT_CAT_BLINK_SIDE_COLOR,
    catBlinkSideOpacity: DEFAULT_CAT_BLINK_SIDE_OPACITY,
    catBlinkSideStrokeColor: DEFAULT_CAT_BLINK_SIDE_STROKE_COLOR,
    catBlinkSideStrokeWidth: DEFAULT_CAT_BLINK_SIDE_STROKE_WIDTH,
    catBlinkSideStrokeOpacity: DEFAULT_CAT_BLINK_SIDE_STROKE_OPACITY,
    catBlinkBottomColor: DEFAULT_CAT_BLINK_BOTTOM_COLOR,
    catBlinkBottomOpacity: DEFAULT_CAT_BLINK_BOTTOM_OPACITY,
    catBlinkBottomStrokeColor: DEFAULT_CAT_BLINK_BOTTOM_STROKE_COLOR,
    catBlinkBottomStrokeWidth: DEFAULT_CAT_BLINK_BOTTOM_STROKE_WIDTH,
    catBlinkBottomStrokeOpacity: DEFAULT_CAT_BLINK_BOTTOM_STROKE_OPACITY,
    catBlinkMinDelay: DEFAULT_CAT_BLINK_MIN_DELAY,
    catBlinkMaxDelay: DEFAULT_CAT_BLINK_MAX_DELAY,
    catBlinkInDuration: DEFAULT_CAT_BLINK_IN_DURATION,
    catBlinkHoldDuration: DEFAULT_CAT_BLINK_HOLD_DURATION,
    catBlinkOutDuration: DEFAULT_CAT_BLINK_OUT_DURATION,
    catBlinkSideDelay: DEFAULT_CAT_BLINK_SIDE_DELAY,
    catBlinkEaseIn: DEFAULT_CAT_BLINK_EASE_IN,
    catBlinkEaseOut: DEFAULT_CAT_BLINK_EASE_OUT,
    focusScale: DEFAULT_FOCUS_SCALE,
    focusUpDuration: DEFAULT_FOCUS_UP_DURATION,
    focusDownDuration: DEFAULT_FOCUS_DOWN_DURATION,
    focusMinDelay: DEFAULT_FOCUS_MIN_DELAY,
    focusMaxDelay: DEFAULT_FOCUS_MAX_DELAY,
    focusEaseUp: DEFAULT_FOCUS_EASE_UP,
    focusEaseDown: DEFAULT_FOCUS_EASE_DOWN,
    eyes: [],
    waves: [],
  };
}

function resetScrollFallState(eye: EyeInstance): void {
  eye.fallStarted = false;
  eye.fallOffsetX = 0;
  eye.fallOffsetY = 0;
  eye.fallVelocityX = 0;
  eye.fallVelocityY = 0;
  eye.fallRotationDegrees = 0;
  eye.fallAngularVelocity = 0;
  eye.fallSquash = 0;
  eye.fallGrounded = false;
}

// Re-export types
export type { EyeFieldConfig, EyeFieldMetrics };

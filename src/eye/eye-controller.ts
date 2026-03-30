// Eye controller - update logic for individual eyes

import { Rectangle } from "pixi.js";

import { clamp, lerp, smoothTowards, applyFocusEase } from "../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "./eye-state";
import {
  SCLERA_RADIUS,
  MAX_LOOK,
  CAT_PUPIL_MORPH_SPEED,
  CAT_PUPIL_MORPH_RADIUS_FACTOR,
  CAT_PUPIL_MORPH_RADIUS_MIN,
} from "./eye-config";
import { updateScrollFallState } from "./behaviors/eye-fall";
import { resolveScaleInProgress } from "./eye-factory";
import { totalOffset, sampleEyeSharedAttentionLook, pupilFollowSpeed } from "./behaviors/eye-tracking";
import { applyHumanPupilAppearance, updateHumanEyeDeformation, updateHumanEyeFocusPulse } from "./render/human-eye-view";
import { applyCatPupilAppearance } from "./render/cat-eye-view";
import { updateCatBlink } from "./behaviors/eye-blink";

export function updateLayoutTransition(
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  dtSeconds: number,
): void {
  if (!eye.layoutTransitionActive) {
    return;
  }

  const duration = Math.max(runtime.layoutTransitionDuration, 0.001);
  eye.layoutTransitionElapsed = Math.min(eye.layoutTransitionElapsed + dtSeconds, duration);
  const progress = clamp(eye.layoutTransitionElapsed / duration, 0, 1);
  const easedProgress = applyFocusEase(runtime.layoutTransitionEase, progress);
  eye.x = lerp(eye.layoutStartX, eye.targetX, easedProgress);
  eye.y = lerp(eye.layoutStartY, eye.targetY, easedProgress);

  if (progress >= 0.999) {
    eye.x = eye.targetX;
    eye.y = eye.targetY;
    eye.layoutTransitionActive = false;
  }
}

export function startLayoutTransition(
  eye: EyeInstance,
  nextX: number,
  nextY: number,
  duration: number,
): void {
  eye.targetX = nextX;
  eye.targetY = nextY;

  if (duration <= 0.001 || (Math.abs(eye.x - nextX) <= 0.001 && Math.abs(eye.y - nextY) <= 0.001)) {
    eye.x = nextX;
    eye.y = nextY;
    eye.layoutStartX = nextX;
    eye.layoutStartY = nextY;
    eye.layoutTransitionElapsed = duration;
    eye.layoutTransitionActive = false;
    return;
  }

  eye.layoutStartX = eye.x;
  eye.layoutStartY = eye.y;
  eye.layoutTransitionElapsed = 0;
  eye.layoutTransitionActive = true;
}

export function applyStaticEyeSettings(eye: EyeInstance, runtime: EyeFieldRuntime): void {
  eye.dropShadow.tint = runtime.dropShadowColor;
  eye.dropShadow.alpha = runtime.dropShadowOpacity;
  eye.dropShadow.position.set(0, 0);
  eye.dropShadow.scale.set(0.92 + runtime.dropShadowSpread * 0.12);
  eye.eyeShadow.tint =
    eye.type === "cat" ? runtime.catInnerShadowColor : runtime.roundInnerShadowColor;
  eye.eyeShadow.alpha = runtime.shadowOpacity;
  eye.eyeFill.tint = eye.type === "cat" ? runtime.catEyeColor : 0xffffff;
  eye.iris.tint = runtime.irisColor;
  eye.globeHighlight.rotation =
    eye.type === "cat"
      ? (runtime.catHighlightRotationDegrees * Math.PI) / 180
      : (runtime.roundHighlightRotationDegrees * Math.PI) / 180;
  eye.globeHighlight.alpha =
    eye.type === "cat" ? runtime.catHighlightOpacity : runtime.roundHighlightOpacity;
  eye.iris.alpha = eye.type === "cat" ? 0 : 1;
  eye.irisMask.alpha = 0.001;
  eye.irisShadow.alpha = 0;
  eye.blinkGroup.visible = eye.type === "cat";
  eye.pupilGroup.mask = eye.type === "cat" ? null : eye.irisMask;
  eye.irisGroup.mask = eye.irisClipMask;
}

export function updateSingleEye(
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  worldBounds: Rectangle,
  dtSeconds: number,
  isScrollFallLocked: boolean,
): void {
  updateLayoutTransition(eye, runtime, dtSeconds);
  eye.appearanceAccumulator += dtSeconds;

  const eyeSeconds = dtSeconds;
  const introScaleProgress = resolveScaleInProgress(eye, runtime.elapsed);
  updateScrollFallState(eye, runtime, worldBounds, dtSeconds);
  const squashScaleX =
    eye.fallSquash >= 0 ? 1 + eye.fallSquash * 0.85 : 1 + eye.fallSquash * 0.4;
  const squashScaleY =
    eye.fallSquash >= 0 ? 1 - eye.fallSquash * 0.75 : 1 - eye.fallSquash * 0.5;
  eye.root.scale.set(
    eye.renderScale * introScaleProgress * squashScaleX,
    eye.renderScale * introScaleProgress * squashScaleY,
  );

  const interactionOffset = totalOffset(eye);
  const interactionDrawX = eye.x + interactionOffset.x + eye.fallOffsetX;
  const interactionDrawY = eye.y + interactionOffset.y + eye.fallOffsetY;
  eye.root.position.set(interactionDrawX, interactionDrawY);
  eye.root.rotation = (eye.fallRotationDegrees * Math.PI) / 180;

  const visibleRadius =
    renderedEyeRadius(eye) *
    introScaleProgress *
    Math.max(Math.abs(squashScaleX), Math.abs(squashScaleY), 0.001);
  const drawX = worldBounds.x + worldBounds.width * 0.5 + interactionDrawX;
  const drawY = worldBounds.y + worldBounds.height * 0.5 + interactionDrawY;
  const isVisible =
    drawX - visibleRadius < worldBounds.x + worldBounds.width &&
    drawX + visibleRadius > worldBounds.x &&
    drawY - visibleRadius < worldBounds.y + worldBounds.height &&
    drawY + visibleRadius > worldBounds.y;

  eye.root.visible = isVisible;

  if (!isVisible) {
    eye.needsAppearanceRefresh = true;
    eye.appearanceAccumulator = eye.appearanceUpdateInterval;
    return;
  }

  const cursorLook =
    runtime.trackingBlend > 0.0001
      ? (() => {
          const rawCursorLook = clampMagnitude(
            (runtime.mouseX - interactionDrawX) / eye.scale,
            (runtime.mouseY - interactionDrawY) / eye.scale,
            MAX_LOOK,
          );

          return {
            x: rawCursorLook.x * runtime.trackingBlend,
            y: rawCursorLook.y * runtime.trackingBlend,
          };
        })()
      : { x: 0, y: 0 };

  const sharedAttentionLook =
    runtime.sharedAttentionBlend > 0.0001
      ? sampleEyeSharedAttentionLook(
          runtime,
          eye,
          runtime.pointerActive ? "scattered" : "unified",
        )
      : { x: 0, y: 0 };

  const desiredLook = {
    x: lerp(cursorLook.x, sharedAttentionLook.x, runtime.sharedAttentionBlend),
    y: lerp(cursorLook.y, sharedAttentionLook.y, runtime.sharedAttentionBlend),
  };

  const lookSpeed = pupilFollowSpeed(runtime, eye);
  eye.lookX = smoothTowards(eye.lookX, desiredLook.x, lookSpeed, eyeSeconds);
  eye.lookY = smoothTowards(eye.lookY, desiredLook.y, lookSpeed, eyeSeconds);

  if (eye.type === "cat") {
    updateCatEye(eye, runtime, eyeSeconds, isScrollFallLocked);
  } else {
    updateHumanEye(eye, runtime, eyeSeconds, isScrollFallLocked);
  }

  const shouldThrottleAppearance = eye.lowDetail && runtime.scrollFallBlend <= 0.0001;
  if (
    shouldThrottleAppearance &&
    eye.scaleInFinished &&
    !eye.needsAppearanceRefresh &&
    eye.appearanceAccumulator < eye.appearanceUpdateInterval
  ) {
    return;
  }

  eye.appearanceAccumulator = 0;
  applyPupilAppearance(eye, runtime);
}

function updateCatEye(
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  eyeSeconds: number,
  isScrollFallLocked: boolean,
): void {
  if (isScrollFallLocked) {
    eye.catMorph = smoothTowards(eye.catMorph, 0, CAT_PUPIL_MORPH_SPEED, eyeSeconds);
    eye.catBlink = 0;
    eye.catBlinkBottom = 0;
    eye.catBlinkSide = 0;
    eye.currentScaleX = 1;
    eye.currentScaleY = 1;
    eye.currentAngle = 0;
    eye.focusPulseScale = 1;
  } else {
    const morphCenterX = eye.x + eye.parallaxX;
    const morphCenterY = eye.y + eye.parallaxY;
    const scaleRadius = Math.max(
      runtime.catMorphRadius * eye.scale,
      runtime.catMorphRadius * 0.6,
    );
    const morphRadius = Math.max(
      scaleRadius,
      SCLERA_RADIUS * eye.root.scale.x * CAT_PUPIL_MORPH_RADIUS_FACTOR,
      CAT_PUPIL_MORPH_RADIUS_MIN,
    );
    const pointerDistance = Math.hypot(
      runtime.mouseX - morphCenterX,
      runtime.mouseY - morphCenterY,
    );
    const morphTarget =
      runtime.trackingBlend <= 0.0001
        ? 0
        : smoothstep(1 - clamp(pointerDistance / morphRadius, 0, 1)) * runtime.trackingBlend;

    eye.catMorph = smoothTowards(
      eye.catMorph,
      morphTarget,
      CAT_PUPIL_MORPH_SPEED,
      eyeSeconds,
    );

    updateCatBlink(eye, runtime, eyeSeconds, isScrollFallLocked);

    eye.currentScaleX = 1;
    eye.currentScaleY = 1;
    eye.currentAngle = 0;
    eye.focusPulseScale = 1;
  }
}

function updateHumanEye(
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  eyeSeconds: number,
  isScrollFallLocked: boolean,
): void {
  eye.catMorph = smoothTowards(eye.catMorph, 0, CAT_PUPIL_MORPH_SPEED, eyeSeconds);
  eye.catBlink = 0;
  eye.catBlinkBottom = 0;
  eye.catBlinkSide = 0;

  updateHumanEyeDeformation(eye, eyeSeconds);
  updateHumanEyeFocusPulse(eye, runtime, isScrollFallLocked);
}

function applyPupilAppearance(eye: EyeInstance, runtime: EyeFieldRuntime): void {
  if (eye.type === "cat") {
    applyCatPupilAppearance(eye, runtime);
  } else {
    applyHumanPupilAppearance(eye, runtime);
  }
}

function renderedEyeRadius(eye: EyeInstance): number {
  return SCLERA_RADIUS * Math.max(eye.renderScale, 0.001);
}

function clampMagnitude(x: number, y: number, maxLength: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  if (length <= maxLength || length <= 0.0001) {
    return { x, y };
  }

  const scale = maxLength / length;
  return { x: x * scale, y: y * scale };
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

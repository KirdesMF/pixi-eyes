// Eye blink behavior

import { clamp, lerp, remap01 } from "../../shared/math";
import { applyFocusEase } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import { SCLERA_RADIUS, CIRCLE_KAPPA, CAT_PUPIL_MORPH_SPEED } from "../eye-config";
import type { Graphics } from "pixi.js";

export function drawCatBlinkBottomLid(
  graphics: Graphics,
  progress: number,
  style: {
    fillColor: number;
    fillOpacity: number;
    strokeColor: number;
    strokeOpacity: number;
    strokeWidth: number;
  },
): void {
  const t = clamp(progress, 0, 1);
  const arcRadius = SCLERA_RADIUS;
  const handleLength = arcRadius * CIRCLE_KAPPA;
  const curveY = lerp(arcRadius, -arcRadius, t);
  const edgeHandleY = lerp(handleLength, -handleLength, t);
  const fillBottomY = arcRadius * 2 + 12;

  graphics
    .clear()
    .moveTo(-arcRadius, 0)
    .bezierCurveTo(-arcRadius, edgeHandleY, -handleLength, curveY, 0, curveY)
    .bezierCurveTo(handleLength, curveY, arcRadius, edgeHandleY, arcRadius, 0)
    .lineTo(arcRadius, fillBottomY)
    .lineTo(-arcRadius, fillBottomY)
    .closePath()
    .fill({ color: style.fillColor, alpha: style.fillOpacity });

  if (style.strokeWidth > 0.001 && style.strokeOpacity > 0.001) {
    graphics.stroke({
      color: style.strokeColor,
      width: style.strokeWidth,
      alpha: style.strokeOpacity,
      alignment: 0.5,
    });
  }
}

export function drawCatBlinkSideLid(
  graphics: Graphics,
  progress: number,
  side: "left" | "right",
  style: {
    fillColor: number;
    fillOpacity: number;
    strokeColor: number;
    strokeOpacity: number;
    strokeWidth: number;
  },
): void {
  const t = clamp(progress, 0, 1);
  const arcRadius = SCLERA_RADIUS;
  const handleLength = arcRadius * CIRCLE_KAPPA;
  const curveX = side === "left" ? lerp(-arcRadius, 0, t) : lerp(arcRadius, 0, t);
  const edgeHandleX = side === "left" ? lerp(-handleLength, 0, t) : lerp(handleLength, 0, t);
  const fillX = side === "left" ? -arcRadius * 2 - 20 : arcRadius * 2 + 20;

  graphics
    .clear()
    .moveTo(0, -arcRadius)
    .bezierCurveTo(edgeHandleX, -arcRadius, curveX, -handleLength, curveX, 0)
    .bezierCurveTo(curveX, handleLength, edgeHandleX, arcRadius, 0, arcRadius)
    .lineTo(fillX, arcRadius)
    .lineTo(fillX, -arcRadius)
    .closePath()
    .fill({ color: style.fillColor, alpha: style.fillOpacity });

  if (style.strokeWidth > 0.001 && style.strokeOpacity > 0.001) {
    graphics.stroke({
      color: style.strokeColor,
      width: style.strokeWidth,
      alpha: style.strokeOpacity,
      alignment: 0.5,
    });
  }
}

export function applyCatBlinkAppearance(eye: EyeInstance, runtime: EyeFieldRuntime): void {
  const bottomProgress = eye.type === "cat" ? clamp(eye.catBlinkBottom, 0, 1) : 0;
  const sideProgress = eye.type === "cat" ? clamp(eye.catBlinkSide, 0, 1) : 0;
  const shouldRedrawBottom =
    eye.needsAppearanceRefresh || Math.abs(bottomProgress - eye.lastDrawnCatBlinkBottom) > 0.002;
  const shouldRedrawSide =
    eye.needsAppearanceRefresh || Math.abs(sideProgress - eye.lastDrawnCatBlinkSide) > 0.002;

  eye.blinkClipMask.position.set(0, 0);
  eye.blinkClipMask.scale.set(1);
  eye.blinkClipMask.rotation = 0;
  eye.blinkGroup.position.set(0, 0);
  eye.blinkGroup.scale.set(1);
  eye.blinkGroup.rotation = 0;
  eye.blinkGroup.visible = eye.type === "cat" && (bottomProgress > 0.0001 || sideProgress > 0.0001);
  if (shouldRedrawBottom) {
    drawCatBlinkBottomLid(eye.blinkBottom, bottomProgress, {
      fillColor: runtime.catBlinkBottomColor,
      fillOpacity: runtime.catBlinkBottomOpacity,
      strokeColor: runtime.catBlinkBottomStrokeColor,
      strokeOpacity: runtime.catBlinkBottomStrokeOpacity,
      strokeWidth: runtime.catBlinkBottomStrokeWidth,
    });
    eye.lastDrawnCatBlinkBottom = bottomProgress;
  }

  if (shouldRedrawSide) {
    drawCatBlinkSideLid(eye.blinkLeft, sideProgress, "left", {
      fillColor: runtime.catBlinkSideColor,
      fillOpacity: runtime.catBlinkSideOpacity,
      strokeColor: runtime.catBlinkSideStrokeColor,
      strokeOpacity: runtime.catBlinkSideStrokeOpacity,
      strokeWidth: runtime.catBlinkSideStrokeWidth,
    });
    drawCatBlinkSideLid(eye.blinkRight, sideProgress, "right", {
      fillColor: runtime.catBlinkSideColor,
      fillOpacity: runtime.catBlinkSideOpacity,
      strokeColor: runtime.catBlinkSideStrokeColor,
      strokeOpacity: runtime.catBlinkSideStrokeOpacity,
      strokeWidth: runtime.catBlinkSideStrokeWidth,
    });
    eye.lastDrawnCatBlinkSide = sideProgress;
  }

  eye.blinkBottom.position.set(0, 0);
  eye.blinkBottom.scale.set(1);
  eye.blinkBottom.rotation = 0;
  eye.blinkLeft.position.set(0, 0);
  eye.blinkLeft.scale.set(1);
  eye.blinkLeft.rotation = 0;
  eye.blinkRight.position.set(0, 0);
  eye.blinkRight.scale.set(1);
  eye.blinkRight.rotation = 0;
}

export function updateCatBlink(
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
    return;
  }

  const blinkIdleDelay =
    runtime.catBlinkMinDelay +
    eye.blinkDelayMix * Math.max(runtime.catBlinkMaxDelay - runtime.catBlinkMinDelay, 0);
  const blinkHoldDuration = runtime.catBlinkHoldDuration;
  const blinkCycle =
    blinkIdleDelay + runtime.catBlinkInDuration + blinkHoldDuration + runtime.catBlinkOutDuration;
  const blinkTime =
    (runtime.elapsed + eye.blinkCycleOffset * blinkCycle) / Math.max(blinkCycle, 0.001);
  const blinkPhase = (blinkTime - Math.floor(blinkTime)) * blinkCycle;

  const blinkCloseEnd = blinkIdleDelay + runtime.catBlinkInDuration;
  const blinkHoldEnd = blinkCloseEnd + blinkHoldDuration;
  const sideDelayIn = Math.min(
    runtime.catBlinkSideDelay,
    Math.max(runtime.catBlinkInDuration - 0.01, 0),
  );
  const sideDelayOut = Math.min(
    runtime.catBlinkSideDelay,
    Math.max(runtime.catBlinkOutDuration - 0.01, 0),
  );

  const blinkState = getBlinkState(
    blinkPhase,
    blinkIdleDelay,
    blinkCloseEnd,
    blinkHoldEnd,
    runtime,
    sideDelayIn,
    sideDelayOut,
  );

  eye.catBlink = blinkState.catBlink;
  eye.catBlinkBottom = blinkState.catBlinkBottom;
  eye.catBlinkSide = blinkState.catBlinkSide;
}

type BlinkState = {
  catBlink: number;
  catBlinkBottom: number;
  catBlinkSide: number;
};

function getBlinkState(
  blinkPhase: number,
  blinkIdleDelay: number,
  blinkCloseEnd: number,
  blinkHoldEnd: number,
  runtime: EyeFieldRuntime,
  sideDelayIn: number,
  sideDelayOut: number,
): BlinkState {
  // Closing phase
  if (blinkPhase > blinkIdleDelay && blinkPhase <= blinkCloseEnd) {
    return getClosingState(blinkPhase, blinkIdleDelay, runtime, sideDelayIn);
  }

  // Fully closed (hold) phase
  if (blinkPhase > blinkCloseEnd && blinkPhase <= blinkHoldEnd) {
    return { catBlink: 1, catBlinkBottom: 1, catBlinkSide: 1 };
  }

  // Opening phase
  if (blinkPhase > blinkHoldEnd && blinkPhase <= blinkHoldEnd + runtime.catBlinkOutDuration) {
    return getOpeningState(blinkPhase, blinkHoldEnd, runtime, sideDelayOut);
  }

  // Idle phase (eyes open)
  return { catBlink: 0, catBlinkBottom: 0, catBlinkSide: 0 };
}

function getClosingState(
  blinkPhase: number,
  blinkIdleDelay: number,
  runtime: EyeFieldRuntime,
  sideDelayIn: number,
): BlinkState {
  const t = (blinkPhase - blinkIdleDelay) / Math.max(runtime.catBlinkInDuration, 0.01);
  const catBlinkBottom = applyFocusEase(runtime.catBlinkEaseIn, t);
  const catBlinkSide =
    blinkPhase <= blinkIdleDelay + sideDelayIn
      ? 0
      : applyFocusEase(
          runtime.catBlinkEaseIn,
          remap01(blinkPhase - blinkIdleDelay, sideDelayIn, runtime.catBlinkInDuration),
        );

  return {
    catBlink: catBlinkBottom,
    catBlinkBottom,
    catBlinkSide,
  };
}

function getOpeningState(
  blinkPhase: number,
  blinkHoldEnd: number,
  runtime: EyeFieldRuntime,
  sideDelayOut: number,
): BlinkState {
  const t = (blinkPhase - blinkHoldEnd) / Math.max(runtime.catBlinkOutDuration, 0.01);
  const catBlinkSide = 1 - applyFocusEase(runtime.catBlinkEaseOut, t);
  const catBlinkBottom =
    blinkPhase <= blinkHoldEnd + sideDelayOut
      ? 1
      : 1 -
        applyFocusEase(
          runtime.catBlinkEaseOut,
          remap01(blinkPhase - blinkHoldEnd, sideDelayOut, runtime.catBlinkOutDuration),
        );

  return {
    catBlink: Math.max(catBlinkBottom, catBlinkSide),
    catBlinkBottom,
    catBlinkSide,
  };
}

function smoothTowards(current: number, target: number, speed: number, dt: number): number {
  const t = 1 - Math.exp(-Math.max(speed, 0) * dt);
  return current + (target - current) * t;
}

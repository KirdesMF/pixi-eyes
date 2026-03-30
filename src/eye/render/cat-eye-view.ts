// Cat eye rendering

import { Graphics } from "pixi.js";

import { clamp, lerp, smoothstep } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import {
  SCLERA_RADIUS,
  IRIS_RADIUS,
  PUPIL_CLIP_MARGIN,
  CIRCLE_KAPPA,
  CAT_PUPIL_HALF_WIDTH,
  CAT_PUPIL_HALF_HEIGHT,
  CAT_PUPIL_HIGHLIGHT_SCALE,
  CAT_IRIS_SCALE,
} from "../eye-config";
import { applyCatBlinkAppearance } from "../behaviors/eye-blink";

export function catPupilShape(morph: number): {
  halfWidth: number;
  halfHeight: number;
  sideHandleY: number;
  capHandleX: number;
} {
  const t = smoothstep(clamp(morph, 0, 1));
  const halfWidth = lerp(CAT_PUPIL_HALF_WIDTH, CAT_PUPIL_HALF_HEIGHT, t);
  const halfHeight = CAT_PUPIL_HALF_HEIGHT;
  const sideHandleY = lerp(
    CAT_PUPIL_HALF_HEIGHT * CAT_PUPIL_SLIT_HANDLE_FACTOR,
    halfHeight * CIRCLE_KAPPA,
    t,
  );
  const capHandleX = lerp(0, halfWidth * CIRCLE_KAPPA, t);

  return {
    halfWidth,
    halfHeight,
    sideHandleY,
    capHandleX,
  };
}

export function drawCatPupil(graphics: Graphics, morph: number): void {
  const shape = catPupilShape(morph);

  graphics
    .clear()
    .moveTo(0, -shape.halfHeight)
    .bezierCurveTo(
      shape.capHandleX,
      -shape.halfHeight,
      shape.halfWidth,
      -shape.sideHandleY,
      shape.halfWidth,
      0,
    )
    .bezierCurveTo(
      shape.halfWidth,
      shape.sideHandleY,
      shape.capHandleX,
      shape.halfHeight,
      0,
      shape.halfHeight,
    )
    .bezierCurveTo(
      -shape.capHandleX,
      shape.halfHeight,
      -shape.halfWidth,
      shape.sideHandleY,
      -shape.halfWidth,
      0,
    )
    .bezierCurveTo(
      -shape.halfWidth,
      -shape.sideHandleY,
      -shape.capHandleX,
      -shape.halfHeight,
      0,
      -shape.halfHeight,
    )
    .closePath()
    .fill(0x17110d);
}

export function applyCatPupilAppearance(eye: EyeInstance, runtime: EyeFieldRuntime): void {
  const variant = catEyeVariantMetrics();
  const rotation = 0;
  const effectiveIrisRadius = IRIS_RADIUS * variant.irisScale;
  const catShape = catPupilShape(eye.catMorph);
  const maxPupilTravel = Math.max(
    effectiveIrisRadius - catShape.halfWidth - PUPIL_CLIP_MARGIN,
    0,
  );
  const pupilOffset = clampMagnitude(
    eye.lookX * runtime.catTranslateStrength,
    eye.lookY * runtime.catTranslateStrength,
    maxPupilTravel,
  );
  const pupilX = pupilOffset.x;
  const pupilY = pupilOffset.y;

  eye.iris.position.set(0, 0);
  eye.eyeShadow.position.set(0, 0);
  eye.eyeShadow.scale.set(1);
  eye.eyeShadow.rotation = 0;
  eye.globeHighlight.position.set(
    SCLERA_RADIUS * runtime.catHighlightOffsetX,
    SCLERA_RADIUS * runtime.catHighlightOffsetY,
  );
  eye.globeHighlight.scale.set(runtime.catHighlightScale);
  eye.globeHighlight.rotation = (runtime.catHighlightRotationDegrees * Math.PI) / 180;
  eye.iris.scale.set(eye.currentScaleX * variant.irisScale, eye.currentScaleY * variant.irisScale);
  eye.iris.rotation = rotation;
  eye.irisMask.position.set(0, 0);
  eye.irisMask.scale.set(
    eye.currentScaleX * variant.irisScale,
    eye.currentScaleY * variant.irisScale,
  );
  eye.irisMask.rotation = rotation;
  eye.irisShadow.position.set(0, 0);
  eye.irisShadow.scale.set(
    eye.currentScaleX * variant.irisScale,
    eye.currentScaleY * variant.irisScale,
  );
  eye.irisShadow.rotation = rotation;
  eye.pupilGroup.position.set(0, 0);
  eye.pupil.position.set(pupilX, pupilY);
  if (
    eye.needsAppearanceRefresh ||
    Math.abs(eye.catMorph - eye.lastDrawnCatMorph) > 0.002
  ) {
    drawCatPupil(eye.pupil, eye.catMorph);
    eye.lastDrawnCatMorph = eye.catMorph;
  }
  eye.pupil.scale.set(1, 1);
  eye.pupil.rotation = rotation;
  eye.highlight.scale.set(
    CAT_PUPIL_HIGHLIGHT_SCALE *
      lerp(1, runtime.catPupilHighlightMorphScale, smoothstep(eye.catMorph)),
  );
  eye.highlight.position.set(
    pupilX - catShape.halfWidth * 0.28,
    pupilY - catShape.halfHeight * 0.54,
  );

  // Apply cat blink appearance
  applyCatBlinkAppearance(eye, runtime);

  eye.needsAppearanceRefresh = false;
}

function catEyeVariantMetrics(): { irisScale: number; pupilClipRadius: number } {
  return {
    irisScale: CAT_IRIS_SCALE,
    pupilClipRadius: CAT_PUPIL_HALF_WIDTH,
  };
}

function clampMagnitude(x: number, y: number, maxLength: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  if (length <= maxLength || length <= 0.0001) {
    return { x, y };
  }

  const scale = maxLength / length;
  return { x: x * scale, y: y * scale };
}

const CAT_PUPIL_SLIT_HANDLE_FACTOR = 0.74;

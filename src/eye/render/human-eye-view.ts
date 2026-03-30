// Human (round) eye rendering

import { clamp, smoothTowards, smoothRotateTowards, applyFocusEase } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import {
  IRIS_RADIUS,
  PUPIL_RADIUS,
  PUPIL_CLIP_MARGIN,
  PUPIL_INNER_TRAVEL,
  MAX_SQUASH,
  SQUEEZE_SPEED,
} from "../eye-config";

export function applyHumanPupilAppearance(eye: EyeInstance, runtime: EyeFieldRuntime): void {
  const variant = humanEyeVariantMetrics();
  const rotation = (eye.currentAngle * Math.PI) / 180;
  const effectiveIrisRadius = IRIS_RADIUS * variant.irisScale;
  const maxPupilTravel = Math.max(
    effectiveIrisRadius - variant.pupilClipRadius * eye.focusPulseScale - PUPIL_CLIP_MARGIN,
    0,
  );
  const pupilOffset = clampMagnitude(
    eye.lookX * PUPIL_INNER_TRAVEL,
    eye.lookY * PUPIL_INNER_TRAVEL,
    maxPupilTravel,
  );
  const irisX = eye.lookX * runtime.roundTranslateStrength;
  const irisY = eye.lookY * runtime.roundTranslateStrength;
  const pupilX = irisX + pupilOffset.x;
  const pupilY = irisY + pupilOffset.y;

  eye.iris.position.set(irisX, irisY);
  eye.eyeShadow.position.set(0, 0);
  eye.eyeShadow.scale.set(1);
  eye.eyeShadow.rotation = 0;
  eye.globeHighlight.position.set(runtime.roundHighlightOffsetX, runtime.roundHighlightOffsetY);
  eye.globeHighlight.scale.set(runtime.roundHighlightScale);
  eye.globeHighlight.rotation = (runtime.roundHighlightRotationDegrees * Math.PI) / 180;
  eye.iris.scale.set(eye.currentScaleX * variant.irisScale, eye.currentScaleY * variant.irisScale);
  eye.iris.rotation = rotation;
  eye.irisMask.position.set(irisX, irisY);
  eye.irisMask.scale.set(
    eye.currentScaleX * variant.irisScale,
    eye.currentScaleY * variant.irisScale,
  );
  eye.irisMask.rotation = rotation;
  eye.irisShadow.position.set(irisX, irisY);
  eye.irisShadow.scale.set(
    eye.currentScaleX * variant.irisScale,
    eye.currentScaleY * variant.irisScale,
  );
  eye.irisShadow.rotation = rotation;
  eye.pupilGroup.position.set(0, 0);
  eye.pupil.position.set(pupilX, pupilY);
  eye.pupil.scale.set(
    eye.currentScaleX * eye.focusPulseScale,
    eye.currentScaleY * eye.focusPulseScale,
  );
  eye.pupil.rotation = rotation;
  eye.highlight.scale.set(1);
  eye.highlight.position.set(pupilX - PUPIL_RADIUS * 0.3, pupilY - PUPIL_RADIUS * 0.4);

  eye.needsAppearanceRefresh = false;
}

export function updateHumanEyeDeformation(eye: EyeInstance, eyeSeconds: number): void {
  const variant = humanEyeVariantMetrics();
  const pupilOffsetForDeform = clampMagnitude(
    eye.lookX * PUPIL_INNER_TRAVEL,
    eye.lookY * PUPIL_INNER_TRAVEL,
    Math.max(
      IRIS_RADIUS * variant.irisScale -
        variant.pupilClipRadius * eye.focusPulseScale -
        PUPIL_CLIP_MARGIN,
      0,
    ),
  );
  const distance = Math.hypot(pupilOffsetForDeform.x, pupilOffsetForDeform.y);
  const deformRange = Math.max(
    IRIS_RADIUS * variant.irisScale - variant.pupilClipRadius * 0.92,
    0.001,
  );
  const deformT = clamp(distance / deformRange, 0, 1);
  const targetScaleX = 1 - deformT * MAX_SQUASH;
  const targetScaleY = 1 + deformT * MAX_SQUASH * 0.5;
  const targetAngle =
    Math.abs(eye.lookX) > 0.001 || Math.abs(eye.lookY) > 0.001
      ? (Math.atan2(eye.lookY, eye.lookX) * 180) / Math.PI
      : 0;

  eye.currentScaleX = smoothTowards(eye.currentScaleX, targetScaleX, SQUEEZE_SPEED, eyeSeconds);
  eye.currentScaleY = smoothTowards(eye.currentScaleY, targetScaleY, SQUEEZE_SPEED, eyeSeconds);
  eye.currentAngle = smoothRotateTowards(eye.currentAngle, targetAngle, SQUEEZE_SPEED, eyeSeconds);
}

export function updateHumanEyeFocusPulse(
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  isScrollFallLocked: boolean,
): void {
  if (isScrollFallLocked) {
    eye.focusPulseScale = 1;
    return;
  }

  const idleDelay =
    runtime.focusMinDelay +
    eye.focusDelayMix * Math.max(runtime.focusMaxDelay - runtime.focusMinDelay, 0);
  const pulseCycle = idleDelay + runtime.focusUpDuration + runtime.focusDownDuration;
  const pulseTime =
    (runtime.elapsed + eye.focusCycleOffset * pulseCycle) % Math.max(pulseCycle, 0.001);
  let nextFocusScale = 1;

  if (pulseTime > idleDelay && pulseTime <= idleDelay + runtime.focusUpDuration) {
    const t = (pulseTime - idleDelay) / Math.max(runtime.focusUpDuration, 0.01);
    nextFocusScale = 1 + (runtime.focusScale - 1) * applyFocusEase(runtime.focusEaseUp, t);
  } else if (
    pulseTime > idleDelay + runtime.focusUpDuration &&
    pulseTime <= idleDelay + runtime.focusUpDuration + runtime.focusDownDuration
  ) {
    const t =
      (pulseTime - idleDelay - runtime.focusUpDuration) / Math.max(runtime.focusDownDuration, 0.01);
    nextFocusScale = 1 + (runtime.focusScale - 1) * (1 - applyFocusEase(runtime.focusEaseDown, t));
  }

  eye.focusPulseScale = nextFocusScale;
}

function humanEyeVariantMetrics(): { irisScale: number; pupilClipRadius: number } {
  return {
    irisScale: 1,
    pupilClipRadius: PUPIL_RADIUS,
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

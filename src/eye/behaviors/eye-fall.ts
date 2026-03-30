// Eye floating/fall behavior

import { Rectangle } from "pixi.js";

import { clamp, lerp, smoothTowards } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import {
  SCLERA_RADIUS,
  SCROLL_FALL_BOTTOM_PADDING,
  SCROLL_FALL_GRAVITY,
  SCROLL_FALL_INITIAL_DRIFT,
  SCROLL_FALL_INITIAL_SPIN_DEGREES,
  SCROLL_FALL_AIR_DAMPING,
  SCROLL_FALL_SMALL_EYE_BOUNCE_RESTITUTION,
  SCROLL_FALL_LARGE_EYE_BOUNCE_RESTITUTION,
  SCROLL_FALL_SMALL_EYE_BOUNCE_CUTOFF,
  SCROLL_FALL_LARGE_EYE_BOUNCE_CUTOFF,
  SCROLL_FALL_GROUND_DAMPING,
  SCROLL_FALL_RETURN_POSITION_SPEED,
  SCROLL_FALL_RETURN_ROTATION_SPEED,
  SCROLL_FALL_RETURN_VELOCITY_SPEED,
  SCROLL_FALL_RETURN_DELAY_MAX,
  SCROLL_FALL_SQUASH_MAX,
  SCROLL_FALL_STRETCH_MAX,
  SCROLL_FALL_SQUASH_IMPACT_SPEED,
  SCROLL_FALL_SQUASH_RETURN_SPEED,
  SCROLL_FALL_DELAY_MAX,
} from "../eye-config";

export function renderedEyeRadius(eye: EyeInstance): number {
  return SCLERA_RADIUS * Math.max(eye.renderScale, 0.001);
}

export function scrollFallFloorOffset(eye: EyeInstance, worldBounds: Rectangle): number {
  return Math.max(
    worldBounds.height * 0.5 - eye.y - renderedEyeRadius(eye) - SCROLL_FALL_BOTTOM_PADDING,
    0,
  );
}

export function clampScrollFallOffsetX(
  eye: EyeInstance,
  worldBounds: Rectangle,
  offsetX: number,
): number {
  const radius = renderedEyeRadius(eye);
  const minOffsetX = radius - worldBounds.width * 0.5 - eye.x;
  const maxOffsetX = worldBounds.width * 0.5 - radius - eye.x;

  return clamp(offsetX, minOffsetX, maxOffsetX);
}

export function resetScrollFallState(eye: EyeInstance): void {
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

export function startScrollFall(eye: EyeInstance): void {
  const driftDirection = eye.fallDriftMix * 2 - 1;
  const rotationDirection = eye.fallRotationMix * 2 - 1;
  const scaleMix = clamp(eye.scale, 0, 1);
  const driftSpeed = lerp(
    SCROLL_FALL_INITIAL_DRIFT * 1.15,
    SCROLL_FALL_INITIAL_DRIFT * 0.72,
    scaleMix,
  );
  const spinSpeed = lerp(
    SCROLL_FALL_INITIAL_SPIN_DEGREES * 1.1,
    SCROLL_FALL_INITIAL_SPIN_DEGREES * 0.68,
    scaleMix,
  );

  eye.fallStarted = true;
  eye.fallGrounded = false;
  eye.fallVelocityX = driftDirection * driftSpeed;
  eye.fallVelocityY = 0;
  eye.fallAngularVelocity = rotationDirection * spinSpeed;
  eye.fallSquash = 0;
}

export function updateScrollFallState(
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  worldBounds: Rectangle,
  dtSeconds: number,
): void {
  const sizeMix = clamp(eye.scale, 0, 1);
  const bounceRestitution = lerp(
    SCROLL_FALL_SMALL_EYE_BOUNCE_RESTITUTION,
    SCROLL_FALL_LARGE_EYE_BOUNCE_RESTITUTION,
    sizeMix,
  );
  const bounceCutoff = lerp(
    SCROLL_FALL_SMALL_EYE_BOUNCE_CUTOFF,
    SCROLL_FALL_LARGE_EYE_BOUNCE_CUTOFF,
    sizeMix,
  );
  const squashTarget =
    runtime.scrollFallTarget > 0.5 && eye.fallVelocityY < -40
      ? -clamp(-eye.fallVelocityY / SCROLL_FALL_SQUASH_IMPACT_SPEED, 0, SCROLL_FALL_STRETCH_MAX)
      : 0;
  eye.fallSquash = smoothTowards(
    eye.fallSquash,
    squashTarget,
    SCROLL_FALL_SQUASH_RETURN_SPEED,
    dtSeconds,
  );

  if (runtime.scrollFallTarget <= 0.5) {
    eye.fallStarted = false;
    eye.fallGrounded = false;
    const returnDelay = eye.fallDelayMix * SCROLL_FALL_RETURN_DELAY_MAX;
    if (runtime.scrollReturnElapsed < returnDelay) {
      return;
    }

    eye.fallVelocityX = smoothTowards(
      eye.fallVelocityX,
      0,
      SCROLL_FALL_RETURN_VELOCITY_SPEED,
      dtSeconds,
    );
    eye.fallVelocityY = smoothTowards(
      eye.fallVelocityY,
      0,
      SCROLL_FALL_RETURN_VELOCITY_SPEED,
      dtSeconds,
    );
    eye.fallAngularVelocity = smoothTowards(
      eye.fallAngularVelocity,
      0,
      SCROLL_FALL_RETURN_ROTATION_SPEED,
      dtSeconds,
    );
    eye.fallOffsetX = smoothTowards(
      eye.fallOffsetX,
      0,
      SCROLL_FALL_RETURN_POSITION_SPEED,
      dtSeconds,
    );
    eye.fallOffsetY = smoothTowards(
      eye.fallOffsetY,
      0,
      SCROLL_FALL_RETURN_POSITION_SPEED,
      dtSeconds,
    );
    eye.fallRotationDegrees = smoothTowards(
      eye.fallRotationDegrees,
      0,
      SCROLL_FALL_RETURN_ROTATION_SPEED,
      dtSeconds,
    );

    return;
  }

  const fallDelay = eye.fallDelayMix * SCROLL_FALL_DELAY_MAX;
  if (!eye.fallStarted) {
    if (runtime.scrollFallElapsed < fallDelay) {
      return;
    }

    startScrollFall(eye);
  }

  const floorOffset = scrollFallFloorOffset(eye, worldBounds);
  if (!eye.fallGrounded) {
    eye.fallVelocityY += SCROLL_FALL_GRAVITY * dtSeconds;
    eye.fallVelocityX = smoothTowards(eye.fallVelocityX, 0, SCROLL_FALL_AIR_DAMPING, dtSeconds);
    eye.fallAngularVelocity = smoothTowards(
      eye.fallAngularVelocity,
      0,
      SCROLL_FALL_AIR_DAMPING,
      dtSeconds,
    );
    eye.fallOffsetX = clampScrollFallOffsetX(
      eye,
      worldBounds,
      eye.fallOffsetX + eye.fallVelocityX * dtSeconds,
    );
    eye.fallOffsetY += eye.fallVelocityY * dtSeconds;
    eye.fallRotationDegrees += eye.fallAngularVelocity * dtSeconds;

    if (eye.fallOffsetY < floorOffset) {
      return;
    }

    eye.fallOffsetY = floorOffset;
    if (eye.fallVelocityY > bounceCutoff) {
      const impactSquash = clamp(
        eye.fallVelocityY / SCROLL_FALL_SQUASH_IMPACT_SPEED,
        0,
        SCROLL_FALL_SQUASH_MAX,
      );
      eye.fallSquash = Math.max(eye.fallSquash, impactSquash);
      eye.fallVelocityY *= -bounceRestitution;
      eye.fallVelocityX *= 0.65;
      eye.fallAngularVelocity *= 0.45;
      return;
    }

    eye.fallGrounded = true;
  }

  eye.fallOffsetY = floorOffset;
  eye.fallVelocityX = 0;
  eye.fallVelocityY = 0;
  eye.fallAngularVelocity = smoothTowards(
    eye.fallAngularVelocity,
    0,
    SCROLL_FALL_GROUND_DAMPING,
    dtSeconds,
  );
}

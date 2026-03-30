// Eye floating behavior (parallax and repulsion)

import { clamp, smoothTowards } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import { clickWaveTarget } from "./eye-tracking";

export function updateFloatingBehavior(
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  dtSeconds: number,
  isScrollFallLocked: boolean,
): void {
  if (isScrollFallLocked) {
    eye.parallaxX = smoothTowards(eye.parallaxX, 0, runtime.pointerEaseSpeed, dtSeconds);
    eye.parallaxY = smoothTowards(eye.parallaxY, 0, runtime.pointerEaseSpeed, dtSeconds);
    eye.repelX = smoothTowards(eye.repelX, 0, runtime.repulsionReturnSpeed, dtSeconds);
    eye.repelY = smoothTowards(eye.repelY, 0, runtime.repulsionReturnSpeed, dtSeconds);
  } else {
    const parallax = calculateParallaxOffset(runtime, eye);
    eye.parallaxX = parallax.x;
    eye.parallaxY = parallax.y;

    const targetRepel = calculateRepulsionTarget(runtime, eye);
    const waveRepel = clickWaveTarget(runtime, eye);
    eye.repelX = smoothTowards(
      eye.repelX,
      targetRepel.x + waveRepel.x,
      runtime.repulsionReturnSpeed,
      dtSeconds,
    );
    eye.repelY = smoothTowards(
      eye.repelY,
      targetRepel.y + waveRepel.y,
      runtime.repulsionReturnSpeed,
      dtSeconds,
    );
  }
}

function calculateParallaxOffset(
  runtime: EyeFieldRuntime,
  eye: EyeInstance,
): { x: number; y: number } {
  const weight = runtime.trackingBlend;
  if (weight <= 0.0001) {
    return { x: 0, y: 0 };
  }

  const radius = Math.max(runtime.clusterRadius, 1);
  const normalizedX = clamp(runtime.mouseX / radius, -1, 1);
  const normalizedY = clamp(runtime.mouseY / radius, -1, 1);
  const distance = runtime.parallaxStrength * eye.scale * weight;

  return { x: -normalizedX * distance, y: -normalizedY * distance };
}

function calculateRepulsionTarget(
  runtime: EyeFieldRuntime,
  eye: EyeInstance,
): { x: number; y: number } {
  const weight = runtime.trackingBlend;
  if (weight <= 0.0001) {
    return { x: 0, y: 0 };
  }

  const mouseRadius = Math.max(runtime.repulsionRadius, 0);
  if (mouseRadius <= 0) {
    return { x: 0, y: 0 };
  }

  const baseX = eye.x + eye.parallaxX;
  const baseY = eye.y + eye.parallaxY;
  const dx = baseX - runtime.mouseX;
  const dy = baseY - runtime.mouseY;
  const distanceSquared = dx * dx + dy * dy;
  const reach = mouseRadius + eye.radius;

  if (distanceSquared >= reach * reach) {
    return { x: 0, y: 0 };
  }

  const pushStrength = Math.max(runtime.repulsionStrength, 0);
  if (pushStrength <= 0) {
    return { x: 0, y: 0 };
  }

  if (distanceSquared > 0.0001) {
    const distance = Math.sqrt(distanceSquared);
    const overlap = reach - distance;
    const push = overlap * pushStrength * weight;
    return { x: (dx / distance) * push, y: (dy / distance) * push };
  }

  return { x: reach * pushStrength * weight, y: 0 };
}

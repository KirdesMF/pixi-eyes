// Eye floating behavior (parallax and repulsion)

import { clamp, smoothstep, smoothTowards } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import { clickWaveTarget } from "./eye-tracking";

// Smoother parallax/repulsion constants
const PARALLAX_SMOOTHING = 8; // Higher = smoother but more lag
const REPULSION_SMOOTHING = 10; // Higher = smoother transition

export function updateFloatingBehavior(
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  dtSeconds: number,
  isScrollFallLocked: boolean,
): void {
  if (isScrollFallLocked) {
    // Smoothly return to center during scroll fall
    const returnSpeed = runtime.pointerEaseSpeed * 0.5; // Slower return during fall
    eye.parallaxX = smoothTowards(eye.parallaxX, 0, returnSpeed, dtSeconds);
    eye.parallaxY = smoothTowards(eye.parallaxY, 0, returnSpeed, dtSeconds);
    eye.repelX = smoothTowards(eye.repelX, 0, runtime.repulsionReturnSpeed, dtSeconds);
    eye.repelY = smoothTowards(eye.repelY, 0, runtime.repulsionReturnSpeed, dtSeconds);
  } else {
    // Smooth parallax interpolation
    const targetParallax = calculateParallaxOffset(runtime, eye);
    const parallaxSpeed = PARALLAX_SMOOTHING * eye.scale;
    eye.parallaxX = smoothTowards(eye.parallaxX, targetParallax.x, parallaxSpeed, dtSeconds);
    eye.parallaxY = smoothTowards(eye.parallaxY, targetParallax.y, parallaxSpeed, dtSeconds);

    // Smooth repulsion with distance-based falloff
    const targetRepel = calculateRepulsionTarget(runtime, eye);
    const waveRepel = clickWaveTarget(runtime, eye);
    const repelSpeed = REPULSION_SMOOTHING * eye.scale;
    eye.repelX = smoothTowards(
      eye.repelX,
      targetRepel.x + waveRepel.x,
      repelSpeed,
      dtSeconds,
    );
    eye.repelY = smoothTowards(
      eye.repelY,
      targetRepel.y + waveRepel.y,
      repelSpeed,
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

  // Smooth distance-based falloff instead of hard cutoff
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
    
    // Smooth falloff: stronger when closer, weaker at edge
    const falloff = smoothstep(1 - distance / reach);
    const push = overlap * pushStrength * weight * falloff;
    
    return { x: (dx / distance) * push, y: (dy / distance) * push };
  }

  // Very close to mouse - maximum repulsion
  return { x: reach * pushStrength * weight, y: 0 };
}

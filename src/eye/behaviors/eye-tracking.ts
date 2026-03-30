// Eye tracking behavior

import { clamp, lerp, hash01, applyEase } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import {
  MAX_LOOK,
  CLICK_WAVE_SPEED,
  CLICK_WAVE_WIDTH,
} from "../eye-config";

export function parallaxOffset(runtime: EyeFieldRuntime, eye: EyeInstance): { x: number; y: number } {
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

export function repulsionTarget(runtime: EyeFieldRuntime, eye: EyeInstance): { x: number; y: number } {
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

export function clickWaveTarget(runtime: EyeFieldRuntime, eye: EyeInstance): { x: number; y: number } {
  if (
    eye.lowDetail ||
    runtime.waves.length === 0 ||
    runtime.scrollFallTarget > 0.5 ||
    runtime.scrollFallBlend > 0.0001
  ) {
    return { x: 0, y: 0 };
  }

  const halfWidth = Math.max(CLICK_WAVE_WIDTH * 0.5, 0.001);
  const maxRadius = Math.max(runtime.clickRepulseRadius, 0);
  const strength = Math.max(runtime.clickRepulseStrength, 0);

  if (maxRadius <= 0 || strength <= 0) {
    return { x: 0, y: 0 };
  }

  let totalX = 0;
  let totalY = 0;
  const baseX = eye.x + eye.parallaxX;
  const baseY = eye.y + eye.parallaxY;

  for (const wave of runtime.waves) {
    const dx = baseX - wave.x;
    const dy = baseY - wave.y;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared <= 0.0001) {
      continue;
    }

    const distance = Math.sqrt(distanceSquared);
    if (distance > maxRadius + halfWidth) {
      continue;
    }

    const radius = wave.elapsed * CLICK_WAVE_SPEED;
    const bandDistance = Math.abs(distance - radius);
    if (bandDistance > halfWidth) {
      continue;
    }

    const t = 1 - bandDistance / halfWidth;
    const push = Math.max(applyEase(runtime.clickRepulseEase, t), 0) * strength;
    totalX += (dx / distance) * push;
    totalY += (dy / distance) * push;
  }

  return { x: totalX, y: totalY };
}

export function pupilFollowSpeed(runtime: EyeFieldRuntime, eye: EyeInstance): number {
  const smallSpeed = Math.max(runtime.smallEyeLookSpeed, 0);
  const largeSpeed = Math.max(runtime.largeEyeLookSpeed, 0);
  const t = clamp(eye.scale, 0, 1);
  return smallSpeed + (largeSpeed - smallSpeed) * t;
}

export function totalOffset(eye: EyeInstance): { x: number; y: number } {
  return {
    x: eye.parallaxX + eye.repelX,
    y: eye.parallaxY + eye.repelY,
  };
}

export function clickWaveLifetime(radius: number): number {
  return radius <= 0 ? 0 : (radius + CLICK_WAVE_WIDTH * 0.5) / CLICK_WAVE_SPEED;
}

export function sampleSharedAttentionTarget(runtime: EyeFieldRuntime): { x: number; y: number } {
  const seed =
    runtime.elapsed * 0.731 +
    runtime.lastPointerMoveAt * 1.913 +
    runtime.mouseX * 0.017 +
    runtime.mouseY * 0.023;
  const angle = hash01(seed) * Math.PI * 2;
  const magnitude = MAX_LOOK * lerp(0.58, 0.92, hash01(seed * 2.417 + 0.31));

  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

export function sampleSharedAttentionDelay(runtime: EyeFieldRuntime): number {
  const seed =
    runtime.elapsed * 1.271 +
    runtime.lastPointerMoveAt * 0.617 +
    runtime.sharedAttentionX * 0.11 +
    runtime.sharedAttentionY * 0.13;

  return lerp(
    runtime.sharedAttentionRetargetMinDelay,
    runtime.sharedAttentionRetargetMaxDelay,
    hash01(seed),
  );
}

export function sampleEyeSharedAttentionLook(
  runtime: EyeFieldRuntime,
  eye: EyeInstance,
  mode: "scattered" | "unified",
): { x: number; y: number } {
  const baseAngle =
    Math.abs(runtime.sharedAttentionX) > 0.001 || Math.abs(runtime.sharedAttentionY) > 0.001
      ? Math.atan2(runtime.sharedAttentionY, runtime.sharedAttentionX)
      : eye.focusCycleOffset * Math.PI * 2;
  const baseMagnitude = Math.hypot(runtime.sharedAttentionX, runtime.sharedAttentionY);

  if (mode === "unified") {
    return {
      x: Math.cos(baseAngle) * baseMagnitude,
      y: Math.sin(baseAngle) * baseMagnitude,
    };
  }

  const eyeSeed =
    runtime.sharedAttentionX * 0.173 +
    runtime.sharedAttentionY * 0.191 +
    eye.blinkCycleOffset * 7.913 +
    eye.focusCycleOffset * 11.417 +
    eye.x * 0.0031 +
    eye.y * 0.0023;
  const angleSpread = lerp(-Math.PI * 0.9, Math.PI * 0.9, hash01(eyeSeed));
  const angle = baseAngle + angleSpread;
  const magnitude = MAX_LOOK * lerp(0.32, 0.96, hash01(eyeSeed * 2.137 + 0.41));

  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

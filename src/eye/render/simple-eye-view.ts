// Simple eye rendering - large black iris

import { clamp } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import { SCLERA_RADIUS, IRIS_RADIUS, MAX_LOOK, MAX_SQUASH } from "../eye-config";

export function applySimpleEyeAppearance(eye: EyeInstance, runtime: EyeFieldRuntime): void {
  const irisScale = 1.15; // Slightly larger iris for simple eye
  const effectiveIrisRadius = IRIS_RADIUS * irisScale;

  const rawIrisX = eye.lookX * runtime.roundTranslateStrength;
  const rawIrisY = eye.lookY * runtime.roundTranslateStrength;
  const rawIrisDist = Math.sqrt(rawIrisX * rawIrisX + rawIrisY * rawIrisY);

  const irisMaxTravel = SCLERA_RADIUS - effectiveIrisRadius - 0.5;

  let irisCompression = 1;
  if (rawIrisDist > irisMaxTravel * 0.95) {
    const t = (rawIrisDist - irisMaxTravel * 0.95) / (irisMaxTravel * 0.05);
    irisCompression = 1 - Math.min(t, 1) * 0.2;
  }

  const irisX = rawIrisX * irisCompression;
  const irisY = rawIrisY * irisCompression;

  eye.iris.position.set(irisX, irisY);
  eye.iris.scale.set(
    eye.currentScaleX * irisScale,
    eye.currentScaleY * irisScale,
  );
  eye.iris.rotation = (eye.currentAngle * Math.PI) / 180;

  eye.pupil.position.set(irisX, irisY);
  eye.pupil.scale.set(
    eye.currentScaleX * irisScale,
    eye.currentScaleY * irisScale,
  );
  eye.pupil.rotation = (eye.currentAngle * Math.PI) / 180;

  eye.eyeShadow.position.set(0, 0);
  eye.eyeShadow.scale.set(1);
  eye.eyeShadow.rotation = 0;

  eye.globeHighlight.visible = false;

  eye.needsAppearanceRefresh = false;
}

export function updateSimpleEyeDeformation(eye: EyeInstance, _eyeSeconds: number): void {
  const lookDistance = Math.sqrt(eye.lookX * eye.lookX + eye.lookY * eye.lookY);
  const squeezeT = clamp(lookDistance / MAX_LOOK, 0, 1);

  eye.currentScaleX = 1 - squeezeT * MAX_SQUASH;
  eye.currentScaleY = 1 + squeezeT * MAX_SQUASH * 0.5;

  const lookAngle = eye.lookX !== 0 || eye.lookY !== 0 ? Math.atan2(eye.lookY, eye.lookX) : 0;
  eye.currentAngle = (lookAngle * 180) / Math.PI;
}

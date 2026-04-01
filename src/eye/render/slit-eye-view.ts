// Slit pupil eye rendering - vertical rounded rectangle pupil on white globe

import { clamp } from "../../shared/math";
import type { EyeInstance, EyeFieldRuntime } from "../eye-state";
import {
  SCLERA_RADIUS,
  IRIS_RADIUS,
  MAX_LOOK,
  MAX_SQUASH,
} from "../eye-config";

export function applySlitEyeAppearance(eye: EyeInstance, runtime: EyeFieldRuntime): void {
  const irisScale = 1.0;
  const effectiveIrisRadius = IRIS_RADIUS * irisScale;

  // Calculate raw iris position - iris should reach sclera boundary
  const rawIrisX = eye.lookX * runtime.roundTranslateStrength;
  const rawIrisY = eye.lookY * runtime.roundTranslateStrength;
  const rawIrisDist = Math.sqrt(rawIrisX * rawIrisX + rawIrisY * rawIrisY);

  // Max travel: iris edge can reach sclera boundary
  const irisMaxTravel = SCLERA_RADIUS - effectiveIrisRadius - 0.5;

  // Soft compression at very edge (last 5%)
  let irisCompression = 1;
  if (rawIrisDist > irisMaxTravel * 0.95) {
    const t = (rawIrisDist - irisMaxTravel * 0.95) / (irisMaxTravel * 0.05);
    irisCompression = 1 - Math.min(t, 1) * 0.2;
  }

  const irisX = rawIrisX * irisCompression;
  const irisY = rawIrisY * irisCompression;

  // Pupil slit moves with the iris (centered on iris)
  const pupilX = irisX;
  const pupilY = irisY;

  // Note: eyeFill.tint is set in eye-controller.ts for mouse proximity color effect

  eye.iris.position.set(irisX, irisY);
  eye.iris.scale.set(
    eye.currentScaleX * irisScale,
    eye.currentScaleY * irisScale,
  );
  // No rotation for slit pupil - it stays vertical
  eye.iris.rotation = 0;

  // Pupil slit is centered on iris, stays vertical (no rotation)
  // Scale pupil based on slit pupil width/height settings
  // Default values (0.25 width, 0.8 height) should give scale = 1.0
  eye.pupil.position.set(pupilX, pupilY);
  eye.pupil.scale.set(
    eye.currentScaleX * (runtime.slitPupilWidth / 0.25),
    eye.currentScaleY * (runtime.slitPupilHeight / 0.8),
  );
  eye.pupil.rotation = 0; // Slit pupil always vertical

  // Highlight (same as human eye)
  eye.highlight.position.set(
    pupilX - IRIS_RADIUS * 0.3,
    pupilY - IRIS_RADIUS * 0.4,
  );
  eye.highlight.scale.set(1);

  eye.eyeShadow.position.set(0, 0);
  eye.eyeShadow.scale.set(1);
  eye.eyeShadow.rotation = 0;

  eye.globeHighlight.position.set(runtime.roundHighlightOffsetX, runtime.roundHighlightOffsetY);
  eye.globeHighlight.scale.set(runtime.roundHighlightScale);
  eye.globeHighlight.rotation = (runtime.roundHighlightRotationDegrees * Math.PI) / 180;
  eye.globeHighlight.alpha = runtime.roundHighlightOpacity;
  eye.globeHighlight.tint = runtime.roundHighlightColor;

  eye.needsAppearanceRefresh = false;
}

export function updateSlitEyeDeformation(eye: EyeInstance, _eyeSeconds: number): void {
  // Calculate squeeze based on distance from center (radial)
  const lookDistance = Math.sqrt(eye.lookX * eye.lookX + eye.lookY * eye.lookY);
  const squeezeT = clamp(lookDistance / MAX_LOOK, 0, 1);

  // Base squeeze: compress along X axis, expand along Y axis
  eye.currentScaleX = 1 - squeezeT * MAX_SQUASH;
  eye.currentScaleY = 1 + squeezeT * MAX_SQUASH * 0.5;

  // No rotation for slit eyes - pupil stays vertical
  eye.currentAngle = 0;
}

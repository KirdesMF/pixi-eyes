import type { EyeFieldRuntime } from "./eye-state";
import type { EyeFieldConfig as EyeFieldConfigType } from "./eye-types";

export type UpdateConfigResult = {
  shouldRebuild: boolean;
  shouldRelayout: boolean;
  shouldRefreshAppearance: boolean;
  shouldRefreshDropShadowTexture: boolean;
};

export function updateConfig(
  runtime: EyeFieldRuntime,
  config: EyeFieldConfigType,
): UpdateConfigResult {
  const result: UpdateConfigResult = {
    shouldRebuild: false,
    shouldRelayout: false,
    shouldRefreshAppearance: false,
    shouldRefreshDropShadowTexture: false,
  };

  // Layout config
  if (config.layoutShape !== undefined && config.layoutShape !== runtime.layoutShape) {
    runtime.layoutShape = config.layoutShape;
    result.shouldRelayout = true;
  }
  if (config.layoutTransitionDuration !== undefined) {
    runtime.layoutTransitionDuration = Math.max(config.layoutTransitionDuration, 0);
  }
  if (config.layoutTransitionEase !== undefined) {
    runtime.layoutTransitionEase = config.layoutTransitionEase;
  }
  if (config.layoutJitter !== undefined) {
    runtime.layoutJitter = Math.max(0, Math.min(1, config.layoutJitter));
    result.shouldRelayout = true;
  }

  // Eye count and sizes
  if (config.instanceCount !== undefined) {
    runtime.count = Math.max(0, Math.floor(config.instanceCount));
    result.shouldRebuild = true;
  }
  if (config.minEyeSize !== undefined) {
    runtime.minEyeSize = Math.max(config.minEyeSize, 0);
    result.shouldRebuild = true;
  }
  if (config.maxEyeSize !== undefined) {
    runtime.maxEyeSize = Math.max(config.maxEyeSize, 0);
    result.shouldRebuild = true;
  }

  // Repulsion config
  if (config.repulsionRadius !== undefined) {
    runtime.repulsionRadius = Math.max(0, config.repulsionRadius);
  }
  if (config.repulsionVariation !== undefined) {
    runtime.repulsionVariation = Math.max(0, Math.min(1, config.repulsionVariation));
  }
  if (config.repulsionWobble !== undefined) {
    runtime.repulsionWobble = Math.max(2, Math.floor(config.repulsionWobble));
  }
  if (config.repulsionWobbleAmount !== undefined) {
    runtime.repulsionWobbleAmount = Math.max(0, Math.min(0.5, config.repulsionWobbleAmount));
  }
  if (config.repulsionMovementInfluence !== undefined) {
    runtime.repulsionMovementInfluence = Math.max(0, Math.min(1, config.repulsionMovementInfluence));
  }
  if (config.clickRepulseRadius !== undefined) {
    runtime.clickRepulseRadius = Math.max(0, config.clickRepulseRadius);
  }
  if (config.clickRepulseStrength !== undefined) {
    runtime.clickRepulseStrength = Math.max(0, config.clickRepulseStrength);
  }
  if (config.clickRepulseEase !== undefined) {
    runtime.clickRepulseEase = config.clickRepulseEase;
  }

  // Stagger config
  if (config.staggerSeconds !== undefined) {
    runtime.staggerSeconds = Math.max(0, config.staggerSeconds);
    result.shouldRebuild = true;
  }

  // Shadow config
  if (config.shadowOpacity !== undefined) {
    runtime.shadowOpacity = Math.max(0, Math.min(1, config.shadowOpacity));
    result.shouldRefreshAppearance = true;
  }
  if (config.dropShadowOpacity !== undefined) {
    runtime.dropShadowOpacity = Math.max(0, Math.min(1, config.dropShadowOpacity));
    result.shouldRefreshAppearance = true;
  }
  if (config.dropShadowBlur !== undefined) {
    const nextDropShadowBlur = Math.max(config.dropShadowBlur, 0);
    if (nextDropShadowBlur !== runtime.dropShadowBlur) {
      runtime.dropShadowBlur = nextDropShadowBlur;
      result.shouldRefreshDropShadowTexture = true;
    }
  }
  if (config.dropShadowSpread !== undefined) {
    runtime.dropShadowSpread = Math.max(0, config.dropShadowSpread);
    result.shouldRefreshAppearance = true;
  }

  // Translate strength
  if (config.roundTranslateStrength !== undefined) {
    runtime.roundTranslateStrength = Math.max(0, Math.min(1, config.roundTranslateStrength));
    result.shouldRefreshAppearance = true;
  }

  // Highlight config
  if (config.roundHighlightScale !== undefined) {
    runtime.roundHighlightScale = Math.max(0, config.roundHighlightScale);
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightOffsetX !== undefined) {
    runtime.roundHighlightOffsetX = config.roundHighlightOffsetX;
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightOffsetY !== undefined) {
    runtime.roundHighlightOffsetY = config.roundHighlightOffsetY;
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightRotationDegrees !== undefined) {
    runtime.roundHighlightRotationDegrees = config.roundHighlightRotationDegrees;
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightOpacity !== undefined) {
    runtime.roundHighlightOpacity = Math.max(0, Math.min(1, config.roundHighlightOpacity));
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightColor !== undefined && Number.isFinite(config.roundHighlightColor)) {
    runtime.roundHighlightColor = config.roundHighlightColor;
    result.shouldRefreshAppearance = true;
  }

  // Color config
  if (config.dropShadowColor !== undefined && Number.isFinite(config.dropShadowColor)) {
    runtime.dropShadowColor = config.dropShadowColor;
  }
  if (config.roundInnerShadowColor !== undefined && Number.isFinite(config.roundInnerShadowColor)) {
    runtime.roundInnerShadowColor = config.roundInnerShadowColor;
    result.shouldRefreshAppearance = true;
  }
  if (config.irisColor !== undefined && Number.isFinite(config.irisColor)) {
    runtime.irisColor = config.irisColor;
    result.shouldRefreshAppearance = true;
  }
  if (config.eyeShapeColor !== undefined && Number.isFinite(config.eyeShapeColor)) {
    runtime.eyeShapeColor = config.eyeShapeColor;
    result.shouldRefreshAppearance = true;
  }

  return result;
}

export function applyAppearanceRefresh(runtime: EyeFieldRuntime): void {
  runtime.eyes.forEach((eye) => {
    eye.needsAppearanceRefresh = true;
    eye.appearanceAccumulator = eye.appearanceUpdateInterval;
  });
}

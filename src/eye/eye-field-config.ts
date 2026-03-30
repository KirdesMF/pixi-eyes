// Eye field configuration handling

import { clamp } from "../shared/math";
import type { EyeFieldConfig } from "./eye-types";
import type { EyeFieldRuntime } from "./eye-state";
import { applyStaticEyeSettings } from "./eye-controller";

interface ConfigUpdateResult {
  shouldRebuild: boolean;
  shouldRelayout: boolean;
  shouldRefreshDropShadowTexture: boolean;
  shouldRefreshAppearance: boolean;
}

export function updateConfig(runtime: EyeFieldRuntime, config: EyeFieldConfig): ConfigUpdateResult {
  const result: ConfigUpdateResult = {
    shouldRebuild: false,
    shouldRelayout: false,
    shouldRefreshDropShadowTexture: false,
    shouldRefreshAppearance: false,
  };

  // String configs
  if (config.layoutShape && config.layoutShape !== runtime.layoutShape) {
    runtime.layoutShape = config.layoutShape;
    result.shouldRelayout = true;
  }
  if (config.layoutTransitionEase) {
    runtime.layoutTransitionEase = config.layoutTransitionEase;
  }
  if (config.clickRepulseEase) {
    runtime.clickRepulseEase = config.clickRepulseEase;
  }
  if (config.catBlinkEaseIn) {
    runtime.catBlinkEaseIn = config.catBlinkEaseIn;
  }
  if (config.catBlinkEaseOut) {
    runtime.catBlinkEaseOut = config.catBlinkEaseOut;
  }
  if (config.focusEaseUp) {
    runtime.focusEaseUp = config.focusEaseUp;
    result.shouldRefreshAppearance = true;
  }
  if (config.focusEaseDown) {
    runtime.focusEaseDown = config.focusEaseDown;
    result.shouldRefreshAppearance = true;
  }

  // Number configs
  if (config.layoutTransitionDuration !== undefined) {
    runtime.layoutTransitionDuration = Math.max(config.layoutTransitionDuration, 0);
  }
  if (config.catMorphRadius !== undefined) {
    runtime.catMorphRadius = Math.max(config.catMorphRadius, 0);
  }
  if (config.repulsionRadius !== undefined) {
    runtime.repulsionRadius = Math.max(0, config.repulsionRadius);
  }
  if (config.clickRepulseRadius !== undefined) {
    runtime.clickRepulseRadius = Math.max(0, config.clickRepulseRadius);
  }
  if (config.clickRepulseStrength !== undefined) {
    runtime.clickRepulseStrength = Math.max(0, config.clickRepulseStrength);
  }
  if (config.staggerSeconds !== undefined) {
    runtime.staggerSeconds = Math.max(0, config.staggerSeconds);
    result.shouldRebuild = true;
  }
  if (config.shadowOpacity !== undefined) {
    runtime.shadowOpacity = clamp(config.shadowOpacity, 0, 1);
  }
  if (config.dropShadowOpacity !== undefined) {
    runtime.dropShadowOpacity = clamp(config.dropShadowOpacity, 0, 1);
  }
  if (config.dropShadowBlur !== undefined) {
    const nextDropShadowBlur = Math.max(config.dropShadowBlur, 0);
    if (nextDropShadowBlur !== runtime.dropShadowBlur) {
      runtime.dropShadowBlur = nextDropShadowBlur;
      result.shouldRefreshDropShadowTexture = true;
    }
  }
  if (config.dropShadowSpread !== undefined) {
    runtime.dropShadowSpread = Math.max(config.dropShadowSpread, 0);
  }
  if (config.roundTranslateStrength !== undefined) {
    runtime.roundTranslateStrength = clamp(config.roundTranslateStrength, 0, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catTranslateStrength !== undefined) {
    runtime.catTranslateStrength = clamp(config.catTranslateStrength, 0, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightScale !== undefined) {
    runtime.roundHighlightScale = Math.max(config.roundHighlightScale, 0);
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightOffsetX !== undefined) {
    runtime.roundHighlightOffsetX = clamp(config.roundHighlightOffsetX, -100, 100);
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightOffsetY !== undefined) {
    runtime.roundHighlightOffsetY = clamp(config.roundHighlightOffsetY, -100, 100);
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightRotationDegrees !== undefined) {
    runtime.roundHighlightRotationDegrees = clamp(config.roundHighlightRotationDegrees, -180, 180);
    result.shouldRefreshAppearance = true;
  }
  if (config.roundHighlightOpacity !== undefined) {
    runtime.roundHighlightOpacity = clamp(config.roundHighlightOpacity, 0, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catHighlightScale !== undefined) {
    runtime.catHighlightScale = Math.max(config.catHighlightScale, 0);
    result.shouldRefreshAppearance = true;
  }
  if (config.catHighlightOffsetX !== undefined) {
    runtime.catHighlightOffsetX = clamp(config.catHighlightOffsetX, -1, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catHighlightOffsetY !== undefined) {
    runtime.catHighlightOffsetY = clamp(config.catHighlightOffsetY, -1, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catHighlightRotationDegrees !== undefined) {
    runtime.catHighlightRotationDegrees = clamp(config.catHighlightRotationDegrees, -180, 180);
    result.shouldRefreshAppearance = true;
  }
  if (config.catHighlightOpacity !== undefined) {
    runtime.catHighlightOpacity = clamp(config.catHighlightOpacity, 0, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catPupilHighlightMorphScale !== undefined) {
    runtime.catPupilHighlightMorphScale = clamp(config.catPupilHighlightMorphScale, 1, 8);
    result.shouldRefreshAppearance = true;
  }
  if (config.catBlinkSideOpacity !== undefined) {
    runtime.catBlinkSideOpacity = clamp(config.catBlinkSideOpacity, 0, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catBlinkSideStrokeWidth !== undefined) {
    runtime.catBlinkSideStrokeWidth = clamp(config.catBlinkSideStrokeWidth, 0, 8);
    result.shouldRefreshAppearance = true;
  }
  if (config.catBlinkSideStrokeOpacity !== undefined) {
    runtime.catBlinkSideStrokeOpacity = clamp(config.catBlinkSideStrokeOpacity, 0, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catBlinkBottomOpacity !== undefined) {
    runtime.catBlinkBottomOpacity = clamp(config.catBlinkBottomOpacity, 0, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catBlinkBottomStrokeWidth !== undefined) {
    runtime.catBlinkBottomStrokeWidth = clamp(config.catBlinkBottomStrokeWidth, 0, 8);
    result.shouldRefreshAppearance = true;
  }
  if (config.catBlinkBottomStrokeOpacity !== undefined) {
    runtime.catBlinkBottomStrokeOpacity = clamp(config.catBlinkBottomStrokeOpacity, 0, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.catBlinkMinDelay !== undefined) {
    runtime.catBlinkMinDelay = Math.max(config.catBlinkMinDelay, 0);
  }
  if (config.catBlinkMaxDelay !== undefined) {
    runtime.catBlinkMaxDelay = Math.max(config.catBlinkMaxDelay, 0);
  }
  if (runtime.catBlinkMinDelay > runtime.catBlinkMaxDelay) {
    const adjusted = runtime.catBlinkMinDelay;
    runtime.catBlinkMinDelay = runtime.catBlinkMaxDelay;
    runtime.catBlinkMaxDelay = adjusted;
  }
  if (config.catBlinkInDuration !== undefined) {
    runtime.catBlinkInDuration = Math.max(config.catBlinkInDuration, 0.01);
  }
  if (config.catBlinkHoldDuration !== undefined) {
    runtime.catBlinkHoldDuration = Math.max(config.catBlinkHoldDuration, 0);
  }
  if (config.catBlinkOutDuration !== undefined) {
    runtime.catBlinkOutDuration = Math.max(config.catBlinkOutDuration, 0.01);
  }
  if (config.catBlinkSideDelay !== undefined) {
    runtime.catBlinkSideDelay = Math.max(config.catBlinkSideDelay, 0);
  }
  if (config.focusScale !== undefined) {
    runtime.focusScale = Math.max(config.focusScale, 1);
    result.shouldRefreshAppearance = true;
  }
  if (config.focusUpDuration !== undefined) {
    runtime.focusUpDuration = Math.max(config.focusUpDuration, 0.01);
    result.shouldRefreshAppearance = true;
  }
  if (config.focusDownDuration !== undefined) {
    runtime.focusDownDuration = Math.max(config.focusDownDuration, 0.01);
    result.shouldRefreshAppearance = true;
  }
  if (config.focusMinDelay !== undefined) {
    runtime.focusMinDelay = Math.max(config.focusMinDelay, 0);
    result.shouldRefreshAppearance = true;
  }
  if (config.focusMaxDelay !== undefined) {
    runtime.focusMaxDelay = Math.max(config.focusMaxDelay, 0);
    result.shouldRefreshAppearance = true;
  }
  if (runtime.focusMinDelay > runtime.focusMaxDelay) {
    const adjusted = runtime.focusMinDelay;
    runtime.focusMinDelay = runtime.focusMaxDelay;
    runtime.focusMaxDelay = adjusted;
  }

  // Color configs
  if (config.dropShadowColor !== undefined && Number.isFinite(config.dropShadowColor)) {
    runtime.dropShadowColor = config.dropShadowColor;
  }
  if (config.roundInnerShadowColor !== undefined && Number.isFinite(config.roundInnerShadowColor)) {
    runtime.roundInnerShadowColor = config.roundInnerShadowColor;
  }
  if (config.catInnerShadowColor !== undefined && Number.isFinite(config.catInnerShadowColor)) {
    runtime.catInnerShadowColor = config.catInnerShadowColor;
  }
  if (config.irisColor !== undefined && Number.isFinite(config.irisColor)) {
    runtime.irisColor = config.irisColor;
  }
  if (config.catEyeColor !== undefined && Number.isFinite(config.catEyeColor)) {
    runtime.catEyeColor = config.catEyeColor;
  }
  if (config.catBlinkSideColor !== undefined && Number.isFinite(config.catBlinkSideColor)) {
    runtime.catBlinkSideColor = config.catBlinkSideColor;
    result.shouldRefreshAppearance = true;
  }
  if (
    config.catBlinkSideStrokeColor !== undefined &&
    Number.isFinite(config.catBlinkSideStrokeColor)
  ) {
    runtime.catBlinkSideStrokeColor = config.catBlinkSideStrokeColor;
    result.shouldRefreshAppearance = true;
  }
  if (config.catBlinkBottomColor !== undefined && Number.isFinite(config.catBlinkBottomColor)) {
    runtime.catBlinkBottomColor = config.catBlinkBottomColor;
    result.shouldRefreshAppearance = true;
  }
  if (
    config.catBlinkBottomStrokeColor !== undefined &&
    Number.isFinite(config.catBlinkBottomStrokeColor)
  ) {
    runtime.catBlinkBottomStrokeColor = config.catBlinkBottomStrokeColor;
    result.shouldRefreshAppearance = true;
  }

  // Size configs (require rebuild)
  if (config.minEyeSize !== undefined) {
    runtime.minEyeSize = Math.max(1, config.minEyeSize);
    result.shouldRebuild = true;
  }
  if (config.maxEyeSize !== undefined) {
    runtime.maxEyeSize = Math.max(8, config.maxEyeSize);
    result.shouldRebuild = true;
  }
  if (runtime.minEyeSize > runtime.maxEyeSize) {
    const adjusted = runtime.minEyeSize;
    runtime.minEyeSize = runtime.maxEyeSize;
    runtime.maxEyeSize = adjusted;
  }

  // Cat mix (requires rebuild)
  if (config.catMix !== undefined) {
    const nextCatMix = clamp(config.catMix, 0, 1);
    if (nextCatMix !== runtime.catMix) {
      runtime.catMix = nextCatMix;
      result.shouldRebuild = true;
    }
  }

  return result;
}

export function applyAppearanceRefresh(runtime: EyeFieldRuntime): void {
  runtime.eyes.forEach((eye) => {
    applyStaticEyeSettings(eye, runtime);
    eye.needsAppearanceRefresh = true;
    eye.appearanceAccumulator = eye.appearanceUpdateInterval;
  });
}

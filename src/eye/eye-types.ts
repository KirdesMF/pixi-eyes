export type EyeType = "round" | "cat";
export type LayoutShapeName = "circle" | "square" | "triangle";
export type FocusEaseName = "linear" | "out-cubic" | "out-sine" | "in-out-sine";
export type ClickRepulseEaseName =
  | "smoothstep"
  | "linear"
  | "in-sine"
  | "out-sine"
  | "in-out-sine"
  | "in-quad"
  | "out-quad"
  | "in-out-quad"
  | "in-cubic"
  | "out-cubic"
  | "in-out-cubic"
  | "in-back"
  | "out-back"
  | "in-out-back"
  | "out-elastic";

/**
 * Configuration for an eye field instance.
 */
export type EyeFieldConfig = {
  layoutShape?: LayoutShapeName;
  layoutTransitionDuration?: number;
  layoutTransitionEase?: FocusEaseName;
  minEyeSize?: number;
  maxEyeSize?: number;
  catMix?: number;
  catMorphRadius?: number;
  repulsionRadius?: number;
  clickRepulseRadius?: number;
  clickRepulseStrength?: number;
  clickRepulseEase?: ClickRepulseEaseName;
  staggerSeconds?: number;
  shadowOpacity?: number;
  dropShadowColor?: number;
  dropShadowOpacity?: number;
  dropShadowBlur?: number;
  dropShadowSpread?: number;
  roundInnerShadowColor?: number;
  catInnerShadowColor?: number;
  irisColor?: number;
  catEyeColor?: number;
  roundTranslateStrength?: number;
  catTranslateStrength?: number;
  roundHighlightScale?: number;
  roundHighlightOffsetX?: number;
  roundHighlightOffsetY?: number;
  roundHighlightRotationDegrees?: number;
  roundHighlightOpacity?: number;
  catHighlightScale?: number;
  catHighlightOffsetX?: number;
  catHighlightOffsetY?: number;
  catHighlightRotationDegrees?: number;
  catHighlightOpacity?: number;
  catPupilHighlightMorphScale?: number;
  catBlinkSideColor?: number;
  catBlinkSideOpacity?: number;
  catBlinkSideStrokeColor?: number;
  catBlinkSideStrokeWidth?: number;
  catBlinkSideStrokeOpacity?: number;
  catBlinkBottomColor?: number;
  catBlinkBottomOpacity?: number;
  catBlinkBottomStrokeColor?: number;
  catBlinkBottomStrokeWidth?: number;
  catBlinkBottomStrokeOpacity?: number;
  catBlinkMinDelay?: number;
  catBlinkMaxDelay?: number;
  catBlinkInDuration?: number;
  catBlinkHoldDuration?: number;
  catBlinkOutDuration?: number;
  catBlinkSideDelay?: number;
  catBlinkEaseIn?: FocusEaseName;
  catBlinkEaseOut?: FocusEaseName;
  focusScale?: number;
  focusUpDuration?: number;
  focusDownDuration?: number;
  focusMinDelay?: number;
  focusMaxDelay?: number;
  focusEaseUp?: FocusEaseName;
  focusEaseDown?: FocusEaseName;
};

/**
 * Metrics returned by eye field update.
 */
export type EyeFieldMetrics = {
  visibleCount: number;
};

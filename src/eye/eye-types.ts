export type EyeType = "human" | "simple";
export type LayoutShapeName = "circle" | "square" | "triangle" | "infinity";
export type FocusEaseName = "linear" | "out-cubic" | "out-sine" | "in-out-sine";

/**
 * Configuration for an eye field instance.
 */
export type EyeFieldConfig = {
  instanceCount?: number;
  layoutShape?: LayoutShapeName;
  layoutTransitionDuration?: number;
  layoutTransitionEase?: FocusEaseName;
  layoutJitter?: number;
  minEyeSize?: number;
  maxEyeSize?: number;
  repulsionRadius?: number;
  repulsionPushSpeed?: number;
  repulsionReturnSpeed?: number;
  staggerSeconds?: number;
  shadowOpacity?: number;
  dropShadowColor?: number;
  dropShadowOpacity?: number;
  dropShadowBlur?: number;
  dropShadowSpread?: number;
  roundInnerShadowColor?: number;
  irisColor?: number;
  mouseIrisColor?: number;
  mouseIrisRadius?: number;
  mouseIrisBlend?: number;
  mouseIrisDecay?: number;
  eyeShapeColor?: number;
  roundTranslateStrength?: number;
  roundHighlightScale?: number;
  roundHighlightOffsetX?: number;
  roundHighlightOffsetY?: number;
  roundHighlightRotationDegrees?: number;
  roundHighlightOpacity?: number;
  roundHighlightColor?: number;
};

/**
 * Metrics returned by eye field update.
 */
export type EyeFieldMetrics = {
  visibleCount: number;
};

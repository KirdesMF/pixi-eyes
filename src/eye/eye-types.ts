export type EyeType = "human";
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
  instanceCount?: number;
  layoutShape?: LayoutShapeName;
  layoutTransitionDuration?: number;
  layoutTransitionEase?: FocusEaseName;
  layoutJitter?: number;
  minEyeSize?: number;
  maxEyeSize?: number;
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
  irisColor?: number;
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

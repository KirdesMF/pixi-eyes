import {
  Container,
  Graphics,
  Rectangle,
  Sprite,
  type Renderer,
} from "pixi.js";

export interface EyeFieldMetrics {
  visibleCount: number;
}

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

import type { SharedContexts, SharedTextures } from "./rendering";
import {
  createSharedContexts,
  createSharedTextures,
  createDropShadowTexture,
  destroySharedContexts,
  destroySharedTextures,
  DEFAULT_IRIS_COLOR,
  DEFAULT_CAT_EYE_COLOR,
  CAT_IRIS_SCALE,
  CAT_PUPIL_HALF_WIDTH,
  CAT_PUPIL_HALF_HEIGHT,
  CAT_PUPIL_HIGHLIGHT_SCALE,
  CAT_PUPIL_MORPH_SPEED,
  CAT_PUPIL_MORPH_RADIUS_FACTOR,
  CAT_PUPIL_MORPH_RADIUS_MIN,
} from "./rendering";
import {
  packEyePositions,
  resolvePackedRadii,
  resolveEyeType,
  staggerDelay,
} from "./layout";

interface EyeFieldOptions {
  count: number;
  renderer: Renderer;
  worldBounds: Rectangle;
}

interface EyeFieldConfig {
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
}

interface ClickWave {
  x: number;
  y: number;
  elapsed: number;
}

interface EyeInstance {
  type: EyeType;
  root: Container;
  dropShadow: Sprite;
  eyeFill: Sprite;
  eyeOutline: Sprite;
  eyeShadow: Sprite;
  globeHighlight: Sprite;
  irisClipMask: Graphics;
  blinkClipMask: Graphics;
  blinkGroup: Container;
  blinkLeft: Graphics;
  blinkRight: Graphics;
  blinkBottom: Graphics;
  irisGroup: Container;
  pupilGroup: Container;
  iris: Graphics;
  irisMask: Graphics;
  irisShadow: Graphics;
  pupil: Graphics;
  highlight: Graphics;
  x: number;
  y: number;
  layoutStartX: number;
  layoutStartY: number;
  targetX: number;
  targetY: number;
  layoutTransitionElapsed: number;
  layoutTransitionActive: boolean;
  radius: number;
  scale: number;
  renderScale: number;
  lowDetail: boolean;
  appearanceUpdateInterval: number;
  appearanceAccumulator: number;
  needsAppearanceRefresh: boolean;
  lastDrawnCatMorph: number;
  lastDrawnCatBlinkBottom: number;
  lastDrawnCatBlinkSide: number;
  delay: number;
  scaleInFinished: boolean;
  parallaxX: number;
  parallaxY: number;
  repelX: number;
  repelY: number;
  lookX: number;
  lookY: number;
  currentScaleX: number;
  currentScaleY: number;
  currentAngle: number;
  catMorph: number;
  catBlink: number;
  catBlinkBottom: number;
  catBlinkSide: number;
  fallDelayMix: number;
  fallRotationMix: number;
  fallDriftMix: number;
  fallStarted: boolean;
  fallOffsetX: number;
  fallOffsetY: number;
  fallVelocityX: number;
  fallVelocityY: number;
  fallRotationDegrees: number;
  fallAngularVelocity: number;
  fallSquash: number;
  fallGrounded: boolean;
  blinkDelayMix: number;
  blinkCycleOffset: number;
  focusDelayMix: number;
  focusCycleOffset: number;
  focusPulseScale: number;
}

interface EyeFieldRuntime {
  count: number;
  clusterRadius: number;
  layoutShape: LayoutShapeName;
  layoutTransitionDuration: number;
  layoutTransitionEase: FocusEaseName;
  minEyeSize: number;
  maxEyeSize: number;
  catMix: number;
  catMorphRadius: number;
  packAttempts: number;
  spiralStepDegrees: number;
  radialExponent: number;
  staggerSeconds: number;
  randomizeStagger: boolean;
  parallaxStrength: number;
  repulsionRadius: number;
  clickRepulseRadius: number;
  clickRepulseStrength: number;
  clickRepulseEase: ClickRepulseEaseName;
  repulsionStrength: number;
  repulsionReturnSpeed: number;
  smallEyeLookSpeed: number;
  largeEyeLookSpeed: number;
  trackingBlendSpeed: number;
  pointerEaseSpeed: number;
  mouseX: number;
  mouseY: number;
  targetMouseX: number;
  targetMouseY: number;
  pointerActive: boolean;
  scrollFallResumePointerActive: boolean;
  elapsed: number;
  trackingBlend: number;
  sharedAttentionDelay: number;
  sharedAttentionRetargetMinDelay: number;
  sharedAttentionRetargetMaxDelay: number;
  sharedAttentionBlend: number;
  sharedAttentionBlendSpeed: number;
  sharedAttentionX: number;
  sharedAttentionY: number;
  lastPointerMoveAt: number;
  nextSharedAttentionAt: number;
  scrollFallBlend: number;
  scrollFallTarget: number;
  scrollFallElapsed: number;
  scrollReturnElapsed: number;
  scrollFallBlendSpeed: number;
  shadowOpacity: number;
  dropShadowColor: number;
  dropShadowOpacity: number;
  dropShadowBlur: number;
  dropShadowSpread: number;
  roundInnerShadowColor: number;
  catInnerShadowColor: number;
  irisColor: number;
  catEyeColor: number;
  roundTranslateStrength: number;
  catTranslateStrength: number;
  roundHighlightScale: number;
  roundHighlightOffsetX: number;
  roundHighlightOffsetY: number;
  roundHighlightRotationDegrees: number;
  roundHighlightOpacity: number;
  catHighlightScale: number;
  catHighlightOffsetX: number;
  catHighlightOffsetY: number;
  catHighlightRotationDegrees: number;
  catHighlightOpacity: number;
  catPupilHighlightMorphScale: number;
  catBlinkSideColor: number;
  catBlinkSideOpacity: number;
  catBlinkSideStrokeColor: number;
  catBlinkSideStrokeWidth: number;
  catBlinkSideStrokeOpacity: number;
  catBlinkBottomColor: number;
  catBlinkBottomOpacity: number;
  catBlinkBottomStrokeColor: number;
  catBlinkBottomStrokeWidth: number;
  catBlinkBottomStrokeOpacity: number;
  catBlinkMinDelay: number;
  catBlinkMaxDelay: number;
  catBlinkInDuration: number;
  catBlinkHoldDuration: number;
  catBlinkOutDuration: number;
  catBlinkSideDelay: number;
  catBlinkEaseIn: FocusEaseName;
  catBlinkEaseOut: FocusEaseName;
  focusScale: number;
  focusUpDuration: number;
  focusDownDuration: number;
  focusMinDelay: number;
  focusMaxDelay: number;
  focusEaseUp: FocusEaseName;
  focusEaseDown: FocusEaseName;
  eyes: EyeInstance[];
  waves: ClickWave[];
}

const DEFAULT_PACK_ATTEMPTS = 96;
const DEFAULT_SPIRAL_STEP_DEGREES = 137.5;
const DEFAULT_RADIAL_EXPONENT = 0.5;
const DEFAULT_EYE_SPIRAL_OFFSET = 0.73;
const DEFAULT_CLUSTER_RADIUS = 200;
const DEFAULT_LAYOUT_SHAPE: LayoutShapeName = "circle";
const DEFAULT_LAYOUT_TRANSITION_DURATION = 0.8;
const DEFAULT_LAYOUT_TRANSITION_EASE: FocusEaseName = "out-cubic";
const DEFAULT_MIN_EYE_SIZE = 10;
const DEFAULT_MAX_EYE_SIZE = 90;
const DEFAULT_CAT_MIX = 0.35;
const DEFAULT_CAT_MORPH_RADIUS = 120;
const DEFAULT_STAGGER_SECONDS = 0.002;
const DEFAULT_RANDOMIZE_STAGGER = false;
const SCALE_IN_DURATION = 0.28;
const DEFAULT_PARALLAX_STRENGTH = 12;
const DEFAULT_REPULSION_RADIUS = 90;
const DEFAULT_REPULSION_STRENGTH = 1;
const DEFAULT_REPULSION_RETURN_SPEED = 10;
const DEFAULT_CLICK_REPULSE_EASE: ClickRepulseEaseName = "out-elastic";
const DEFAULT_SMALL_EYE_LOOK_SPEED = 16;
const DEFAULT_LARGE_EYE_LOOK_SPEED = 8;
const DEFAULT_TRACKING_BLEND_SPEED = 12;
const DEFAULT_POINTER_EASE_SPEED = 10;
const DEFAULT_SHARED_ATTENTION_DELAY = 2.4;
const DEFAULT_SHARED_ATTENTION_RETARGET_MIN_DELAY = 1.6;
const DEFAULT_SHARED_ATTENTION_RETARGET_MAX_DELAY = 3.2;
const DEFAULT_SHARED_ATTENTION_BLEND_SPEED = 3.2;
const DEFAULT_SCROLL_FALL_BLEND_SPEED = 2.8;
const SCROLL_FALL_DELAY_MAX = 0.46;
const SCROLL_FALL_BOTTOM_PADDING = 1;
const SCROLL_FALL_GRAVITY = 2600;
const SCROLL_FALL_INITIAL_DRIFT = 84;
const SCROLL_FALL_INITIAL_SPIN_DEGREES = 110;
const SCROLL_FALL_AIR_DAMPING = 1.9;
const SCROLL_FALL_SMALL_EYE_BOUNCE_RESTITUTION = 0.56;
const SCROLL_FALL_LARGE_EYE_BOUNCE_RESTITUTION = 0.18;
const SCROLL_FALL_SMALL_EYE_BOUNCE_CUTOFF = 52;
const SCROLL_FALL_LARGE_EYE_BOUNCE_CUTOFF = 168;
const SCROLL_FALL_GROUND_DAMPING = 10;
const SCROLL_FALL_RETURN_POSITION_SPEED = 7.4;
const SCROLL_FALL_RETURN_ROTATION_SPEED = 9.2;
const SCROLL_FALL_RETURN_VELOCITY_SPEED = 6.2;
const SCROLL_FALL_RETURN_DELAY_MAX = 0.24;
const SCROLL_FALL_SQUASH_MAX = 0.22;
const SCROLL_FALL_STRETCH_MAX = 0.12;
const SCROLL_FALL_SQUASH_IMPACT_SPEED = 900;
const SCROLL_FALL_SQUASH_RETURN_SPEED = 12;
const DEFAULT_SMALL_EYE_APPEARANCE_FPS = 24;
const DEFAULT_LARGE_EYE_APPEARANCE_FPS = 60;
const DEFAULT_LOW_DETAIL_SCALE_THRESHOLD = 0.4;
const DEFAULT_CLICK_REPULSE_RADIUS = 400;
const DEFAULT_CLICK_REPULSE_STRENGTH = 40;
const CLICK_WAVE_SPEED = 520;
const CLICK_WAVE_WIDTH = 90;
const DEFAULT_FOCUS_MIN_DELAY = 1.4;
const DEFAULT_FOCUS_MAX_DELAY = 3.8;
const DEFAULT_FOCUS_UP_DURATION = 0.24;
const DEFAULT_FOCUS_DOWN_DURATION = 0.38;
const DEFAULT_FOCUS_SCALE = 1.35;
const DEFAULT_FOCUS_EASE_UP: FocusEaseName = "out-cubic";
const DEFAULT_FOCUS_EASE_DOWN: FocusEaseName = "in-out-sine";
const DEFAULT_CAT_BLINK_MIN_DELAY = 5;
const DEFAULT_CAT_BLINK_MAX_DELAY = 8;
const DEFAULT_CAT_BLINK_IN_DURATION = 0.25;
const DEFAULT_CAT_BLINK_HOLD_DURATION = 0.06;
const DEFAULT_CAT_BLINK_OUT_DURATION = 0.25;
const DEFAULT_CAT_BLINK_SIDE_DELAY = 0.1;
const DEFAULT_CAT_BLINK_EASE_IN: FocusEaseName = "out-cubic";
const DEFAULT_CAT_BLINK_EASE_OUT: FocusEaseName = "in-out-sine";
const DEFAULT_CAT_BLINK_SIDE_COLOR = 0x000000;
const DEFAULT_CAT_BLINK_BOTTOM_COLOR = 0x111113;
const DEFAULT_CAT_BLINK_SIDE_OPACITY = 1;
const DEFAULT_CAT_BLINK_BOTTOM_OPACITY = 0.66;
const DEFAULT_CAT_BLINK_SIDE_STROKE_COLOR = 0x66dc1a;
const DEFAULT_CAT_BLINK_BOTTOM_STROKE_COLOR = 0x66dc1a;
const DEFAULT_CAT_BLINK_SIDE_STROKE_OPACITY = 0.6;
const DEFAULT_CAT_BLINK_BOTTOM_STROKE_OPACITY = 0.26;
const DEFAULT_CAT_BLINK_SIDE_STROKE_WIDTH = 4;
const DEFAULT_CAT_BLINK_BOTTOM_STROKE_WIDTH = 2;
const DEFAULT_SHADOW_OPACITY = 0.4;
const DEFAULT_DROP_SHADOW_COLOR = 0x4a4545;
const DEFAULT_DROP_SHADOW_OPACITY = 0.4;
const DEFAULT_DROP_SHADOW_BLUR = 1.2;
const DEFAULT_DROP_SHADOW_SPREAD = 0.7;
const DEFAULT_ROUND_INNER_SHADOW_COLOR = 0xa8abad;
const DEFAULT_CAT_INNER_SHADOW_COLOR = 0x3d8a0a;
const DEFAULT_ROUND_TRANSLATE_STRENGTH = 0.9;
const DEFAULT_CAT_TRANSLATE_STRENGTH = 0.75;
const DEFAULT_ROUND_GLOBE_HIGHLIGHT_SCALE = 0.45;
const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_X = 10;
const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_Y = -12.5;
const DEFAULT_ROUND_GLOBE_HIGHLIGHT_ROTATION_DEGREES = 41.25;
const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OPACITY = 0.7;
const DEFAULT_CAT_GLOBE_HIGHLIGHT_ROTATION_DEGREES = 34;
const DEFAULT_CAT_GLOBE_HIGHLIGHT_SCALE = 0.47;
const DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_X_FACTOR = 0.37;
const DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_Y_FACTOR = -0.62;
const DEFAULT_CAT_GLOBE_HIGHLIGHT_OPACITY = 0.7;
const DEFAULT_CAT_PUPIL_HIGHLIGHT_MORPH_SCALE = 4;
const SCLERA_RADIUS = 24;
const IRIS_RADIUS = 16;
const PUPIL_RADIUS = 8.5;
const CAT_PUPIL_SLIT_HANDLE_FACTOR = 0.74;
const MAX_LOOK = 12;
const PUPIL_CLIP_MARGIN = 0.6;
const MAX_SQUASH = 0.2;
const SQUEEZE_SPEED = 12;
const PUPIL_INNER_TRAVEL = 0.42;
const CIRCLE_KAPPA = 0.5522847498307936;

const clamp = (value: number, minValue: number, maxValue: number) =>
  Math.max(minValue, Math.min(value, maxValue));
const lerp = (start: number, end: number, t: number) => start + (end - start) * t;
const remap01 = (value: number, start: number, end: number) =>
  clamp((value - start) / Math.max(end - start, 0.001), 0, 1);

const smoothstep = (value: number) => value * value * (3 - 2 * value);
const easeInSine = (value: number) => 1 - Math.cos((value * Math.PI) / 2);
const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;
const easeInCubic = (value: number) => value ** 3;
const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
const easeOutSine = (value: number) => Math.sin((value * Math.PI) / 2);
const easeInOutSine = (value: number) => -(Math.cos(Math.PI * value) - 1) * 0.5;
const easeInQuad = (value: number) => value * value;
const easeOutQuad = (value: number) => 1 - (1 - value) * (1 - value);
const easeInOutQuad = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
const easeInBack = (value: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * value ** 3 - c1 * value * value;
};
const easeOutBack = (value: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (value - 1) ** 3 + c1 * (value - 1) ** 2;
};
const easeInOutBack = (value: number) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return value < 0.5
    ? ((2 * value) ** 2 * ((c2 + 1) * 2 * value - c2)) / 2
    : ((2 * value - 2) ** 2 * ((c2 + 1) * (value * 2 - 2) + c2) + 2) / 2;
};
const easeOutElastic = (value: number) => {
  const c4 = (2 * Math.PI) / 3;
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return 2 ** (-10 * value) * Math.sin((value * 10 - 0.75) * c4) + 1;
};
const easeLinear = (value: number) => value;

const applyEase = (ease: FocusEaseName | ClickRepulseEaseName, value: number) => {
  const clampedValue = clamp(value, 0, 1);

  switch (ease) {
    case "smoothstep":
      return smoothstep(clampedValue);
    case "linear":
      return easeLinear(clampedValue);
    case "in-sine":
      return easeInSine(clampedValue);
    case "out-sine":
      return easeOutSine(clampedValue);
    case "in-out-sine":
      return easeInOutSine(clampedValue);
    case "in-quad":
      return easeInQuad(clampedValue);
    case "out-quad":
      return easeOutQuad(clampedValue);
    case "in-out-quad":
      return easeInOutQuad(clampedValue);
    case "in-cubic":
      return easeInCubic(clampedValue);
    case "in-out-cubic":
      return easeInOutCubic(clampedValue);
    case "in-back":
      return easeInBack(clampedValue);
    case "out-back":
      return easeOutBack(clampedValue);
    case "in-out-back":
      return easeInOutBack(clampedValue);
    case "out-elastic":
      return easeOutElastic(clampedValue);
    case "out-cubic":
    default:
      return easeOutCubic(clampedValue);
  }
};

const applyFocusEase = (ease: FocusEaseName, value: number) => applyEase(ease, value);
const applyClickRepulseEase = (ease: ClickRepulseEaseName, value: number) => applyEase(ease, value);

const hash01 = (value: number) => {
  const hashed = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return hashed - Math.floor(hashed);
};

const smoothTowards = (current: number, target: number, speed: number, dt: number) => {
  const t = 1 - Math.exp(-Math.max(speed, 0) * dt);
  return current + (target - current) * t;
};

const clickWaveLifetime = (radius: number) =>
  radius <= 0 ? 0 : (radius + CLICK_WAVE_WIDTH * 0.5) / CLICK_WAVE_SPEED;

const sampleSharedAttentionTarget = (runtime: EyeFieldRuntime) => {
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
};

const sampleSharedAttentionDelay = (runtime: EyeFieldRuntime) => {
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
};

const sampleEyeSharedAttentionLook = (
  runtime: EyeFieldRuntime,
  eye: EyeInstance,
  mode: "scattered" | "unified",
) => {
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
};

const wrapDegrees = (angle: number) => {
  let wrapped = (angle + 180) % 360;
  if (wrapped < 0) {
    wrapped += 360;
  }

  return wrapped - 180;
};

const smoothAngleTowards = (current: number, target: number, speed: number, dt: number) => {
  const delta = wrapDegrees(target - current);
  const t = 1 - Math.exp(-Math.max(speed, 0) * dt);
  return wrapDegrees(current + delta * t);
};

const clampMagnitude = (x: number, y: number, maxLength: number) => {
  const length = Math.hypot(x, y);
  if (length <= maxLength || length <= 0.0001) {
    return { x, y };
  }

  const scale = maxLength / length;
  return { x: x * scale, y: y * scale };
};

const eyeAppearanceUpdateInterval = (scale: number) => {
  const t = clamp(scale, 0, 1);
  const fps =
    DEFAULT_SMALL_EYE_APPEARANCE_FPS +
    (DEFAULT_LARGE_EYE_APPEARANCE_FPS - DEFAULT_SMALL_EYE_APPEARANCE_FPS) * t;
  return 1 / Math.max(fps, 1);
};

const lowDetailEnabled = (scale: number) => scale < clamp(DEFAULT_LOW_DETAIL_SCALE_THRESHOLD, 0, 1);

const catPupilShape = (morph: number) => {
  const t = smoothstep(clamp(morph, 0, 1));
  const halfWidth = lerp(CAT_PUPIL_HALF_WIDTH, CAT_PUPIL_HALF_HEIGHT, t);
  const halfHeight = CAT_PUPIL_HALF_HEIGHT;
  const sideHandleY = lerp(
    CAT_PUPIL_HALF_HEIGHT * CAT_PUPIL_SLIT_HANDLE_FACTOR,
    halfHeight * CIRCLE_KAPPA,
    t,
  );
  const capHandleX = lerp(0, halfWidth * CIRCLE_KAPPA, t);

  return {
    halfWidth,
    halfHeight,
    sideHandleY,
    capHandleX,
  };
};

const drawCatPupil = (graphics: Graphics, morph: number) => {
  const shape = catPupilShape(morph);

  graphics
    .clear()
    .moveTo(0, -shape.halfHeight)
    .bezierCurveTo(
      shape.capHandleX,
      -shape.halfHeight,
      shape.halfWidth,
      -shape.sideHandleY,
      shape.halfWidth,
      0,
    )
    .bezierCurveTo(
      shape.halfWidth,
      shape.sideHandleY,
      shape.capHandleX,
      shape.halfHeight,
      0,
      shape.halfHeight,
    )
    .bezierCurveTo(
      -shape.capHandleX,
      shape.halfHeight,
      -shape.halfWidth,
      shape.sideHandleY,
      -shape.halfWidth,
      0,
    )
    .bezierCurveTo(
      -shape.halfWidth,
      -shape.sideHandleY,
      -shape.capHandleX,
      -shape.halfHeight,
      0,
      -shape.halfHeight,
    )
    .closePath()
    .fill(0x17110d);
};

const drawCatBlinkBottomLid = (
  graphics: Graphics,
  progress: number,
  style: {
    fillColor: number;
    fillOpacity: number;
    strokeColor: number;
    strokeOpacity: number;
    strokeWidth: number;
  },
) => {
  const t = clamp(progress, 0, 1);
  const arcRadius = SCLERA_RADIUS;
  const handleLength = arcRadius * CIRCLE_KAPPA;
  const curveY = lerp(arcRadius, -arcRadius, t);
  const edgeHandleY = lerp(handleLength, -handleLength, t);
  const fillBottomY = arcRadius * 2 + 12;

  graphics
    .clear()
    .moveTo(-arcRadius, 0)
    .bezierCurveTo(-arcRadius, edgeHandleY, -handleLength, curveY, 0, curveY)
    .bezierCurveTo(handleLength, curveY, arcRadius, edgeHandleY, arcRadius, 0)
    .lineTo(arcRadius, fillBottomY)
    .lineTo(-arcRadius, fillBottomY)
    .closePath()
    .fill({ color: style.fillColor, alpha: style.fillOpacity });

  if (style.strokeWidth > 0.001 && style.strokeOpacity > 0.001) {
    graphics.stroke({
      color: style.strokeColor,
      width: style.strokeWidth,
      alpha: style.strokeOpacity,
      alignment: 0.5,
    });
  }
};

const drawCatBlinkSideLid = (
  graphics: Graphics,
  progress: number,
  side: "left" | "right",
  style: {
    fillColor: number;
    fillOpacity: number;
    strokeColor: number;
    strokeOpacity: number;
    strokeWidth: number;
  },
) => {
  const t = clamp(progress, 0, 1);
  const arcRadius = SCLERA_RADIUS;
  const handleLength = arcRadius * CIRCLE_KAPPA;
  const curveX = side === "left" ? lerp(-arcRadius, 0, t) : lerp(arcRadius, 0, t);
  const edgeHandleX = side === "left" ? lerp(-handleLength, 0, t) : lerp(handleLength, 0, t);
  const fillX = side === "left" ? -arcRadius * 2 - 20 : arcRadius * 2 + 20;

  graphics
    .clear()
    .moveTo(0, -arcRadius)
    .bezierCurveTo(edgeHandleX, -arcRadius, curveX, -handleLength, curveX, 0)
    .bezierCurveTo(curveX, handleLength, edgeHandleX, arcRadius, 0, arcRadius)
    .lineTo(fillX, arcRadius)
    .lineTo(fillX, -arcRadius)
    .closePath()
    .fill({ color: style.fillColor, alpha: style.fillOpacity });

  if (style.strokeWidth > 0.001 && style.strokeOpacity > 0.001) {
    graphics.stroke({
      color: style.strokeColor,
      width: style.strokeWidth,
      alpha: style.strokeOpacity,
      alignment: 0.5,
    });
  }
};

const createEyeInstance = (
  contexts: SharedContexts,
  textures: SharedTextures,
  type: EyeType,
  x: number,
  y: number,
  radius: number,
  maxRadius: number,
  count: number,
  index: number,
) => {
  const root = new Container();
  const dropShadow = new Sprite(textures.dropShadowTexture);
  const eyeFill = new Sprite(textures.scleraFillTexture);
  const irisClipMask = new Graphics(contexts.scleraMaskContext);
  const blinkClipMask = new Graphics(contexts.scleraMaskContext);
  const blinkGroup = new Container();
  const blinkLeft = new Graphics();
  const blinkRight = new Graphics();
  const blinkBottom = new Graphics();
  const eyeOutline = new Sprite(textures.scleraOutlineTexture);
  const eyeShadow = new Sprite(textures.scleraShadowTexture);
  const globeHighlight = new Sprite(
    type === "cat" ? textures.catGlobeHighlightTexture : textures.roundGlobeHighlightTexture,
  );
  const irisGroup = new Container();
  const pupilGroup = new Container();
  const iris = new Graphics(contexts.irisContext);
  const irisMask = new Graphics(contexts.irisMaskContext);
  const irisShadow = new Graphics();
  const pupil = type === "cat" ? new Graphics() : new Graphics(contexts.roundPupilContext);
  const highlight = new Graphics(contexts.highlightContext);

  irisShadow
    .moveTo(-IRIS_RADIUS * 0.92, IRIS_RADIUS * 0.08)
    .bezierCurveTo(
      -IRIS_RADIUS * 0.42,
      IRIS_RADIUS * 0.8,
      IRIS_RADIUS * 0.56,
      IRIS_RADIUS * 0.9,
      IRIS_RADIUS * 0.98,
      IRIS_RADIUS * 0.12,
    )
    .bezierCurveTo(
      IRIS_RADIUS * 0.48,
      IRIS_RADIUS * 0.3,
      -IRIS_RADIUS * 0.2,
      IRIS_RADIUS * 0.34,
      -IRIS_RADIUS * 0.74,
      -IRIS_RADIUS * 0.04,
    )
    .fill({ color: 0x5e2f88, alpha: 0.2 });

  irisClipMask.alpha = 0.001;
  blinkClipMask.alpha = 0.001;
  irisMask.alpha = 0.001;
  irisShadow.alpha = 0;
  iris.tint = DEFAULT_IRIS_COLOR;
  blinkGroup.sortableChildren = true;
  blinkBottom.zIndex = 0;
  blinkLeft.zIndex = 1;
  blinkRight.zIndex = 1;
  dropShadow.anchor.set(0.5);
  eyeFill.anchor.set(0.5);
  eyeOutline.anchor.set(0.5);
  eyeShadow.anchor.set(0.5);
  globeHighlight.anchor.set(0.5);

  if (type === "cat") {
    drawCatPupil(pupil, 0);
  }

  drawCatBlinkBottomLid(blinkBottom, 0, {
    fillColor: DEFAULT_CAT_BLINK_BOTTOM_COLOR,
    fillOpacity: DEFAULT_CAT_BLINK_BOTTOM_OPACITY,
    strokeColor: DEFAULT_CAT_BLINK_BOTTOM_STROKE_COLOR,
    strokeOpacity: DEFAULT_CAT_BLINK_BOTTOM_STROKE_OPACITY,
    strokeWidth: DEFAULT_CAT_BLINK_BOTTOM_STROKE_WIDTH,
  });
  drawCatBlinkSideLid(blinkLeft, 0, "left", {
    fillColor: DEFAULT_CAT_BLINK_SIDE_COLOR,
    fillOpacity: DEFAULT_CAT_BLINK_SIDE_OPACITY,
    strokeColor: DEFAULT_CAT_BLINK_SIDE_STROKE_COLOR,
    strokeOpacity: DEFAULT_CAT_BLINK_SIDE_STROKE_OPACITY,
    strokeWidth: DEFAULT_CAT_BLINK_SIDE_STROKE_WIDTH,
  });
  drawCatBlinkSideLid(blinkRight, 0, "right", {
    fillColor: DEFAULT_CAT_BLINK_SIDE_COLOR,
    fillOpacity: DEFAULT_CAT_BLINK_SIDE_OPACITY,
    strokeColor: DEFAULT_CAT_BLINK_SIDE_STROKE_COLOR,
    strokeOpacity: DEFAULT_CAT_BLINK_SIDE_STROKE_OPACITY,
    strokeWidth: DEFAULT_CAT_BLINK_SIDE_STROKE_WIDTH,
  });

  pupilGroup.addChild(pupil, highlight);
  pupilGroup.mask = irisMask;
  irisGroup.addChild(iris, irisShadow, irisMask, pupilGroup);
  irisGroup.mask = irisClipMask;
  blinkGroup.addChild(blinkBottom, blinkLeft, blinkRight);
  blinkGroup.mask = blinkClipMask;

  root.addChild(
    dropShadow,
    eyeFill,
    irisClipMask,
    blinkClipMask,
    irisGroup,
    eyeShadow,
    globeHighlight,
    blinkGroup,
    eyeOutline,
  );

  const scale = Math.max(radius / Math.max(maxRadius, 0.001), 0.001);
  const renderScale = Math.max(radius / SCLERA_RADIUS, 0.001);
  root.zIndex = renderScale;
  root.alpha = 1;

  return {
    type,
    root,
    dropShadow,
    eyeFill,
    eyeOutline,
    eyeShadow,
    globeHighlight,
    irisClipMask,
    blinkClipMask,
    blinkGroup,
    blinkLeft,
    blinkRight,
    blinkBottom,
    irisGroup,
    pupilGroup,
    iris,
    irisMask,
    irisShadow,
    pupil,
    highlight,
    x,
    y,
    layoutStartX: x,
    layoutStartY: y,
    targetX: x,
    targetY: y,
    layoutTransitionElapsed: 0,
    layoutTransitionActive: false,
    radius,
    scale,
    renderScale,
    lowDetail: lowDetailEnabled(scale),
    appearanceUpdateInterval: eyeAppearanceUpdateInterval(scale),
    appearanceAccumulator: 0,
    needsAppearanceRefresh: true,
    lastDrawnCatMorph: 0,
    lastDrawnCatBlinkBottom: 0,
    lastDrawnCatBlinkSide: 0,
    delay: staggerDelay(index, count, 0, DEFAULT_RANDOMIZE_STAGGER),
    scaleInFinished: false,
    parallaxX: 0,
    parallaxY: 0,
    repelX: 0,
    repelY: 0,
    lookX: 0,
    lookY: 0,
    currentScaleX: 1,
    currentScaleY: 1,
    currentAngle: 0,
    catMorph: 0,
    catBlink: 0,
    catBlinkBottom: 0,
    catBlinkSide: 0,
    fallDelayMix: hash01(index * 3.971 + count * 0.19),
    fallRotationMix: hash01(index * 5.317 + count * 0.43),
    fallDriftMix: hash01(index * 7.113 + count * 0.61),
    fallStarted: false,
    fallOffsetX: 0,
    fallOffsetY: 0,
    fallVelocityX: 0,
    fallVelocityY: 0,
    fallRotationDegrees: 0,
    fallAngularVelocity: 0,
    fallSquash: 0,
    fallGrounded: false,
    blinkDelayMix: hash01(index * 12.731 + count * 0.73),
    blinkCycleOffset: hash01(index * 23.913 + count * 1.91),
    focusDelayMix: hash01(index * 8.137 + count * 1.17),
    focusCycleOffset: hash01(index * 17.413 + count * 2.31),
    focusPulseScale: 1,
  } satisfies EyeInstance;
};

const startLayoutTransition = (
  eye: EyeInstance,
  nextX: number,
  nextY: number,
  duration: number,
) => {
  eye.targetX = nextX;
  eye.targetY = nextY;

  if (duration <= 0.001 || (Math.abs(eye.x - nextX) <= 0.001 && Math.abs(eye.y - nextY) <= 0.001)) {
    eye.x = nextX;
    eye.y = nextY;
    eye.layoutStartX = nextX;
    eye.layoutStartY = nextY;
    eye.layoutTransitionElapsed = duration;
    eye.layoutTransitionActive = false;
    return;
  }

  eye.layoutStartX = eye.x;
  eye.layoutStartY = eye.y;
  eye.layoutTransitionElapsed = 0;
  eye.layoutTransitionActive = true;
};

const updateLayoutTransition = (eye: EyeInstance, runtime: EyeFieldRuntime, dtSeconds: number) => {
  if (!eye.layoutTransitionActive) {
    return;
  }

  const duration = Math.max(runtime.layoutTransitionDuration, 0.001);
  eye.layoutTransitionElapsed = Math.min(eye.layoutTransitionElapsed + dtSeconds, duration);
  const progress = clamp(eye.layoutTransitionElapsed / duration, 0, 1);
  const easedProgress = applyFocusEase(runtime.layoutTransitionEase, progress);
  eye.x = lerp(eye.layoutStartX, eye.targetX, easedProgress);
  eye.y = lerp(eye.layoutStartY, eye.targetY, easedProgress);

  if (progress >= 0.999) {
    eye.x = eye.targetX;
    eye.y = eye.targetY;
    eye.layoutTransitionActive = false;
  }
};

const parallaxOffset = (runtime: EyeFieldRuntime, eye: EyeInstance) => {
  const weight = runtime.trackingBlend;
  if (weight <= 0.0001) {
    return { x: 0, y: 0 };
  }

  const radius = Math.max(runtime.clusterRadius, 1);
  const normalizedX = clamp(runtime.mouseX / radius, -1, 1);
  const normalizedY = clamp(runtime.mouseY / radius, -1, 1);
  const distance = runtime.parallaxStrength * eye.scale * weight;

  return { x: -normalizedX * distance, y: -normalizedY * distance };
};

const repulsionTarget = (runtime: EyeFieldRuntime, eye: EyeInstance) => {
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
};

const clickWaveTarget = (runtime: EyeFieldRuntime, eye: EyeInstance) => {
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
    const push = Math.max(applyClickRepulseEase(runtime.clickRepulseEase, t), 0) * strength;
    totalX += (dx / distance) * push;
    totalY += (dy / distance) * push;
  }

  return { x: totalX, y: totalY };
};

const pupilFollowSpeed = (runtime: EyeFieldRuntime, eye: EyeInstance) => {
  const smallSpeed = Math.max(runtime.smallEyeLookSpeed, 0);
  const largeSpeed = Math.max(runtime.largeEyeLookSpeed, 0);
  const t = clamp(eye.scale, 0, 1);
  return smallSpeed + (largeSpeed - smallSpeed) * t;
};

const totalOffset = (eye: EyeInstance) => ({
  x: eye.parallaxX + eye.repelX,
  y: eye.parallaxY + eye.repelY,
});

const eyeVariantMetrics = (type: EyeType) => {
  if (type === "cat") {
    return {
      irisScale: CAT_IRIS_SCALE,
      pupilClipRadius: CAT_PUPIL_HALF_WIDTH,
    };
  }

  return {
    irisScale: 1,
    pupilClipRadius: PUPIL_RADIUS,
  };
};

const applyStaticEyeSettings = (eye: EyeInstance, runtime: EyeFieldRuntime) => {
  eye.dropShadow.tint = runtime.dropShadowColor;
  eye.dropShadow.alpha = runtime.dropShadowOpacity;
  eye.dropShadow.position.set(0, 0);
  eye.dropShadow.scale.set(0.92 + runtime.dropShadowSpread * 0.12);
  eye.eyeShadow.tint =
    eye.type === "cat" ? runtime.catInnerShadowColor : runtime.roundInnerShadowColor;
  eye.eyeShadow.alpha = runtime.shadowOpacity;
  eye.eyeFill.tint = eye.type === "cat" ? runtime.catEyeColor : 0xffffff;
  eye.iris.tint = runtime.irisColor;
  eye.globeHighlight.rotation =
    eye.type === "cat"
      ? (runtime.catHighlightRotationDegrees * Math.PI) / 180
      : (runtime.roundHighlightRotationDegrees * Math.PI) / 180;
  eye.globeHighlight.alpha =
    eye.type === "cat" ? runtime.catHighlightOpacity : runtime.roundHighlightOpacity;
  eye.iris.alpha = eye.type === "cat" ? 0 : 1;
  eye.irisMask.alpha = 0.001;
  eye.irisShadow.alpha = 0;
  eye.blinkGroup.visible = eye.type === "cat";
  eye.pupilGroup.mask = eye.type === "cat" ? null : eye.irisMask;
  eye.irisGroup.mask = eye.irisClipMask;
};

const resolveScaleInProgress = (eye: EyeInstance, elapsed: number) => {
  const progress = clamp((elapsed - eye.delay) / SCALE_IN_DURATION, 0, 1);
  eye.scaleInFinished = progress >= 0.999;

  return smoothstep(progress);
};

const renderedEyeRadius = (eye: EyeInstance) => SCLERA_RADIUS * Math.max(eye.renderScale, 0.001);

const scrollFallFloorOffset = (eye: EyeInstance, worldBounds: Rectangle) =>
  Math.max(
    worldBounds.height * 0.5 - eye.y - renderedEyeRadius(eye) - SCROLL_FALL_BOTTOM_PADDING,
    0,
  );

const clampScrollFallOffsetX = (eye: EyeInstance, worldBounds: Rectangle, offsetX: number) => {
  const radius = renderedEyeRadius(eye);
  const minOffsetX = radius - worldBounds.width * 0.5 - eye.x;
  const maxOffsetX = worldBounds.width * 0.5 - radius - eye.x;

  return clamp(offsetX, minOffsetX, maxOffsetX);
};

const resetScrollFallState = (eye: EyeInstance) => {
  eye.fallStarted = false;
  eye.fallOffsetX = 0;
  eye.fallOffsetY = 0;
  eye.fallVelocityX = 0;
  eye.fallVelocityY = 0;
  eye.fallRotationDegrees = 0;
  eye.fallAngularVelocity = 0;
  eye.fallSquash = 0;
  eye.fallGrounded = false;
};

const startScrollFall = (eye: EyeInstance) => {
  const driftDirection = eye.fallDriftMix * 2 - 1;
  const rotationDirection = eye.fallRotationMix * 2 - 1;
  const scaleMix = clamp(eye.scale, 0, 1);
  const driftSpeed = lerp(
    SCROLL_FALL_INITIAL_DRIFT * 1.15,
    SCROLL_FALL_INITIAL_DRIFT * 0.72,
    scaleMix,
  );
  const spinSpeed = lerp(
    SCROLL_FALL_INITIAL_SPIN_DEGREES * 1.1,
    SCROLL_FALL_INITIAL_SPIN_DEGREES * 0.68,
    scaleMix,
  );

  eye.fallStarted = true;
  eye.fallGrounded = false;
  eye.fallVelocityX = driftDirection * driftSpeed;
  eye.fallVelocityY = 0;
  eye.fallAngularVelocity = rotationDirection * spinSpeed;
  eye.fallSquash = 0;
};

const updateScrollFallState = (
  eye: EyeInstance,
  runtime: EyeFieldRuntime,
  worldBounds: Rectangle,
  dtSeconds: number,
) => {
  const sizeMix = clamp(eye.scale, 0, 1);
  const bounceRestitution = lerp(
    SCROLL_FALL_SMALL_EYE_BOUNCE_RESTITUTION,
    SCROLL_FALL_LARGE_EYE_BOUNCE_RESTITUTION,
    sizeMix,
  );
  const bounceCutoff = lerp(
    SCROLL_FALL_SMALL_EYE_BOUNCE_CUTOFF,
    SCROLL_FALL_LARGE_EYE_BOUNCE_CUTOFF,
    sizeMix,
  );
  const squashTarget =
    runtime.scrollFallTarget > 0.5 && eye.fallVelocityY < -40
      ? -clamp(-eye.fallVelocityY / SCROLL_FALL_SQUASH_IMPACT_SPEED, 0, SCROLL_FALL_STRETCH_MAX)
      : 0;
  eye.fallSquash = smoothTowards(
    eye.fallSquash,
    squashTarget,
    SCROLL_FALL_SQUASH_RETURN_SPEED,
    dtSeconds,
  );

  if (runtime.scrollFallTarget <= 0.5) {
    eye.fallStarted = false;
    eye.fallGrounded = false;
    const returnDelay = eye.fallDelayMix * SCROLL_FALL_RETURN_DELAY_MAX;
    if (runtime.scrollReturnElapsed < returnDelay) {
      return;
    }

    eye.fallVelocityX = smoothTowards(
      eye.fallVelocityX,
      0,
      SCROLL_FALL_RETURN_VELOCITY_SPEED,
      dtSeconds,
    );
    eye.fallVelocityY = smoothTowards(
      eye.fallVelocityY,
      0,
      SCROLL_FALL_RETURN_VELOCITY_SPEED,
      dtSeconds,
    );
    eye.fallAngularVelocity = smoothTowards(
      eye.fallAngularVelocity,
      0,
      SCROLL_FALL_RETURN_ROTATION_SPEED,
      dtSeconds,
    );
    eye.fallOffsetX = smoothTowards(
      eye.fallOffsetX,
      0,
      SCROLL_FALL_RETURN_POSITION_SPEED,
      dtSeconds,
    );
    eye.fallOffsetY = smoothTowards(
      eye.fallOffsetY,
      0,
      SCROLL_FALL_RETURN_POSITION_SPEED,
      dtSeconds,
    );
    eye.fallRotationDegrees = smoothTowards(
      eye.fallRotationDegrees,
      0,
      SCROLL_FALL_RETURN_ROTATION_SPEED,
      dtSeconds,
    );

    return;
  }

  const fallDelay = eye.fallDelayMix * SCROLL_FALL_DELAY_MAX;
  if (!eye.fallStarted) {
    if (runtime.scrollFallElapsed < fallDelay) {
      return;
    }

    startScrollFall(eye);
  }

  const floorOffset = scrollFallFloorOffset(eye, worldBounds);
  if (!eye.fallGrounded) {
    eye.fallVelocityY += SCROLL_FALL_GRAVITY * dtSeconds;
    eye.fallVelocityX = smoothTowards(eye.fallVelocityX, 0, SCROLL_FALL_AIR_DAMPING, dtSeconds);
    eye.fallAngularVelocity = smoothTowards(
      eye.fallAngularVelocity,
      0,
      SCROLL_FALL_AIR_DAMPING,
      dtSeconds,
    );
    eye.fallOffsetX = clampScrollFallOffsetX(
      eye,
      worldBounds,
      eye.fallOffsetX + eye.fallVelocityX * dtSeconds,
    );
    eye.fallOffsetY += eye.fallVelocityY * dtSeconds;
    eye.fallRotationDegrees += eye.fallAngularVelocity * dtSeconds;

    if (eye.fallOffsetY < floorOffset) {
      return;
    }

    eye.fallOffsetY = floorOffset;
    if (eye.fallVelocityY > bounceCutoff) {
      const impactSquash = clamp(
        eye.fallVelocityY / SCROLL_FALL_SQUASH_IMPACT_SPEED,
        0,
        SCROLL_FALL_SQUASH_MAX,
      );
      eye.fallSquash = Math.max(eye.fallSquash, impactSquash);
      eye.fallVelocityY *= -bounceRestitution;
      eye.fallVelocityX *= 0.65;
      eye.fallAngularVelocity *= 0.45;
      return;
    }

    eye.fallGrounded = true;
  }

  eye.fallOffsetY = floorOffset;
  eye.fallVelocityX = 0;
  eye.fallVelocityY = 0;
  eye.fallAngularVelocity = smoothTowards(
    eye.fallAngularVelocity,
    0,
    SCROLL_FALL_GROUND_DAMPING,
    dtSeconds,
  );
};

const applyCatBlinkAppearance = (eye: EyeInstance, runtime: EyeFieldRuntime) => {
  const bottomProgress = eye.type === "cat" ? clamp(eye.catBlinkBottom, 0, 1) : 0;
  const sideProgress = eye.type === "cat" ? clamp(eye.catBlinkSide, 0, 1) : 0;
  const shouldRedrawBottom =
    eye.needsAppearanceRefresh || Math.abs(bottomProgress - eye.lastDrawnCatBlinkBottom) > 0.002;
  const shouldRedrawSide =
    eye.needsAppearanceRefresh || Math.abs(sideProgress - eye.lastDrawnCatBlinkSide) > 0.002;

  eye.blinkClipMask.position.set(0, 0);
  eye.blinkClipMask.scale.set(1);
  eye.blinkClipMask.rotation = 0;
  eye.blinkGroup.position.set(0, 0);
  eye.blinkGroup.scale.set(1);
  eye.blinkGroup.rotation = 0;
  eye.blinkGroup.visible = eye.type === "cat" && (bottomProgress > 0.0001 || sideProgress > 0.0001);
  if (shouldRedrawBottom) {
    drawCatBlinkBottomLid(eye.blinkBottom, bottomProgress, {
      fillColor: runtime.catBlinkBottomColor,
      fillOpacity: runtime.catBlinkBottomOpacity,
      strokeColor: runtime.catBlinkBottomStrokeColor,
      strokeOpacity: runtime.catBlinkBottomStrokeOpacity,
      strokeWidth: runtime.catBlinkBottomStrokeWidth,
    });
    eye.lastDrawnCatBlinkBottom = bottomProgress;
  }

  if (shouldRedrawSide) {
    drawCatBlinkSideLid(eye.blinkLeft, sideProgress, "left", {
      fillColor: runtime.catBlinkSideColor,
      fillOpacity: runtime.catBlinkSideOpacity,
      strokeColor: runtime.catBlinkSideStrokeColor,
      strokeOpacity: runtime.catBlinkSideStrokeOpacity,
      strokeWidth: runtime.catBlinkSideStrokeWidth,
    });
    drawCatBlinkSideLid(eye.blinkRight, sideProgress, "right", {
      fillColor: runtime.catBlinkSideColor,
      fillOpacity: runtime.catBlinkSideOpacity,
      strokeColor: runtime.catBlinkSideStrokeColor,
      strokeOpacity: runtime.catBlinkSideStrokeOpacity,
      strokeWidth: runtime.catBlinkSideStrokeWidth,
    });
    eye.lastDrawnCatBlinkSide = sideProgress;
  }

  eye.blinkBottom.position.set(0, 0);
  eye.blinkBottom.scale.set(1);
  eye.blinkBottom.rotation = 0;
  eye.blinkLeft.position.set(0, 0);
  eye.blinkLeft.scale.set(1);
  eye.blinkLeft.rotation = 0;
  eye.blinkRight.position.set(0, 0);
  eye.blinkRight.scale.set(1);
  eye.blinkRight.rotation = 0;
};

const applyPupilAppearance = (eye: EyeInstance, runtime: EyeFieldRuntime) => {
  const variant = eyeVariantMetrics(eye.type);
  const rotation = eye.type === "cat" ? 0 : (eye.currentAngle * Math.PI) / 180;
  const effectiveIrisRadius = IRIS_RADIUS * variant.irisScale;
  const catShape = eye.type === "cat" ? catPupilShape(eye.catMorph) : null;
  const maxPupilTravel = Math.max(
    effectiveIrisRadius -
      (eye.type === "cat"
        ? (catShape?.halfWidth ?? CAT_PUPIL_HALF_WIDTH)
        : variant.pupilClipRadius * eye.focusPulseScale) -
      PUPIL_CLIP_MARGIN,
    0,
  );
  const pupilOffset =
    eye.type === "cat"
      ? clampMagnitude(
          eye.lookX * runtime.catTranslateStrength,
          eye.lookY * runtime.catTranslateStrength,
          maxPupilTravel,
        )
      : clampMagnitude(
          eye.lookX * PUPIL_INNER_TRAVEL,
          eye.lookY * PUPIL_INNER_TRAVEL,
          maxPupilTravel,
        );
  const irisX = eye.type === "cat" ? 0 : eye.lookX * runtime.roundTranslateStrength;
  const irisY = eye.type === "cat" ? 0 : eye.lookY * runtime.roundTranslateStrength;
  const pupilX = eye.type === "cat" ? pupilOffset.x : irisX + pupilOffset.x;
  const pupilY = eye.type === "cat" ? pupilOffset.y : irisY + pupilOffset.y;

  eye.iris.position.set(irisX, irisY);
  eye.eyeShadow.position.set(0, 0);
  eye.eyeShadow.scale.set(1);
  eye.eyeShadow.rotation = 0;
  eye.globeHighlight.position.set(
    eye.type === "cat"
      ? SCLERA_RADIUS * runtime.catHighlightOffsetX
      : runtime.roundHighlightOffsetX,
    eye.type === "cat"
      ? SCLERA_RADIUS * runtime.catHighlightOffsetY
      : runtime.roundHighlightOffsetY,
  );
  eye.globeHighlight.scale.set(
    eye.type === "cat" ? runtime.catHighlightScale : runtime.roundHighlightScale,
  );
  eye.globeHighlight.rotation =
    eye.type === "cat"
      ? (runtime.catHighlightRotationDegrees * Math.PI) / 180
      : (runtime.roundHighlightRotationDegrees * Math.PI) / 180;
  eye.iris.scale.set(eye.currentScaleX * variant.irisScale, eye.currentScaleY * variant.irisScale);
  eye.iris.rotation = rotation;
  eye.irisMask.position.set(irisX, irisY);
  eye.irisMask.scale.set(
    eye.currentScaleX * variant.irisScale,
    eye.currentScaleY * variant.irisScale,
  );
  eye.irisMask.rotation = rotation;
  eye.irisShadow.position.set(irisX, irisY);
  eye.irisShadow.scale.set(
    eye.currentScaleX * variant.irisScale,
    eye.currentScaleY * variant.irisScale,
  );
  eye.irisShadow.rotation = rotation;
  eye.pupilGroup.position.set(0, 0);
  eye.pupil.position.set(pupilX, pupilY);
  if (
    eye.type === "cat" &&
    (eye.needsAppearanceRefresh || Math.abs(eye.catMorph - eye.lastDrawnCatMorph) > 0.002)
  ) {
    drawCatPupil(eye.pupil, eye.catMorph);
    eye.lastDrawnCatMorph = eye.catMorph;
  }
  eye.pupil.scale.set(
    eye.type === "cat" ? 1 : eye.currentScaleX * eye.focusPulseScale,
    eye.type === "cat" ? 1 : eye.currentScaleY * eye.focusPulseScale,
  );
  eye.pupil.rotation = rotation;
  eye.highlight.scale.set(
    eye.type === "cat"
      ? CAT_PUPIL_HIGHLIGHT_SCALE *
          lerp(1, runtime.catPupilHighlightMorphScale, smoothstep(eye.catMorph))
      : 1,
  );
  eye.highlight.position.set(
    eye.type === "cat"
      ? pupilX - (catShape?.halfWidth ?? CAT_PUPIL_HALF_WIDTH) * 0.28
      : pupilX - PUPIL_RADIUS * 0.3,
    eye.type === "cat"
      ? pupilY - (catShape?.halfHeight ?? CAT_PUPIL_HALF_HEIGHT) * 0.54
      : pupilY - PUPIL_RADIUS * 0.4,
  );
  applyCatBlinkAppearance(eye, runtime);
  eye.needsAppearanceRefresh = false;
};

const createRuntime = (count: number): EyeFieldRuntime => ({
  count,
  clusterRadius: DEFAULT_CLUSTER_RADIUS,
  layoutShape: DEFAULT_LAYOUT_SHAPE,
  layoutTransitionDuration: DEFAULT_LAYOUT_TRANSITION_DURATION,
  layoutTransitionEase: DEFAULT_LAYOUT_TRANSITION_EASE,
  minEyeSize: DEFAULT_MIN_EYE_SIZE,
  maxEyeSize: DEFAULT_MAX_EYE_SIZE,
  catMix: DEFAULT_CAT_MIX,
  catMorphRadius: DEFAULT_CAT_MORPH_RADIUS,
  packAttempts: DEFAULT_PACK_ATTEMPTS,
  spiralStepDegrees: DEFAULT_SPIRAL_STEP_DEGREES,
  radialExponent: DEFAULT_RADIAL_EXPONENT,
  staggerSeconds: DEFAULT_STAGGER_SECONDS,
  randomizeStagger: DEFAULT_RANDOMIZE_STAGGER,
  parallaxStrength: DEFAULT_PARALLAX_STRENGTH,
  repulsionRadius: DEFAULT_REPULSION_RADIUS,
  clickRepulseRadius: DEFAULT_CLICK_REPULSE_RADIUS,
  clickRepulseStrength: DEFAULT_CLICK_REPULSE_STRENGTH,
  clickRepulseEase: DEFAULT_CLICK_REPULSE_EASE,
  repulsionStrength: DEFAULT_REPULSION_STRENGTH,
  repulsionReturnSpeed: DEFAULT_REPULSION_RETURN_SPEED,
  smallEyeLookSpeed: DEFAULT_SMALL_EYE_LOOK_SPEED,
  largeEyeLookSpeed: DEFAULT_LARGE_EYE_LOOK_SPEED,
  trackingBlendSpeed: DEFAULT_TRACKING_BLEND_SPEED,
  pointerEaseSpeed: DEFAULT_POINTER_EASE_SPEED,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  pointerActive: false,
  scrollFallResumePointerActive: false,
  elapsed: 0,
  trackingBlend: 0,
  sharedAttentionDelay: DEFAULT_SHARED_ATTENTION_DELAY,
  sharedAttentionRetargetMinDelay: DEFAULT_SHARED_ATTENTION_RETARGET_MIN_DELAY,
  sharedAttentionRetargetMaxDelay: DEFAULT_SHARED_ATTENTION_RETARGET_MAX_DELAY,
  sharedAttentionBlend: 0,
  sharedAttentionBlendSpeed: DEFAULT_SHARED_ATTENTION_BLEND_SPEED,
  sharedAttentionX: 0,
  sharedAttentionY: 0,
  lastPointerMoveAt: 0,
  nextSharedAttentionAt: DEFAULT_SHARED_ATTENTION_DELAY,
  scrollFallBlend: 0,
  scrollFallTarget: 0,
  scrollFallElapsed: 0,
  scrollReturnElapsed: Number.POSITIVE_INFINITY,
  scrollFallBlendSpeed: DEFAULT_SCROLL_FALL_BLEND_SPEED,
  shadowOpacity: DEFAULT_SHADOW_OPACITY,
  dropShadowColor: DEFAULT_DROP_SHADOW_COLOR,
  dropShadowOpacity: DEFAULT_DROP_SHADOW_OPACITY,
  dropShadowBlur: DEFAULT_DROP_SHADOW_BLUR,
  dropShadowSpread: DEFAULT_DROP_SHADOW_SPREAD,
  roundInnerShadowColor: DEFAULT_ROUND_INNER_SHADOW_COLOR,
  catInnerShadowColor: DEFAULT_CAT_INNER_SHADOW_COLOR,
  irisColor: DEFAULT_IRIS_COLOR,
  catEyeColor: DEFAULT_CAT_EYE_COLOR,
  roundTranslateStrength: DEFAULT_ROUND_TRANSLATE_STRENGTH,
  catTranslateStrength: DEFAULT_CAT_TRANSLATE_STRENGTH,
  roundHighlightScale: DEFAULT_ROUND_GLOBE_HIGHLIGHT_SCALE,
  roundHighlightOffsetX: DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_X,
  roundHighlightOffsetY: DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_Y,
  roundHighlightRotationDegrees: DEFAULT_ROUND_GLOBE_HIGHLIGHT_ROTATION_DEGREES,
  roundHighlightOpacity: DEFAULT_ROUND_GLOBE_HIGHLIGHT_OPACITY,
  catHighlightScale: DEFAULT_CAT_GLOBE_HIGHLIGHT_SCALE,
  catHighlightOffsetX: DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_X_FACTOR,
  catHighlightOffsetY: DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_Y_FACTOR,
  catHighlightRotationDegrees: DEFAULT_CAT_GLOBE_HIGHLIGHT_ROTATION_DEGREES,
  catHighlightOpacity: DEFAULT_CAT_GLOBE_HIGHLIGHT_OPACITY,
  catPupilHighlightMorphScale: DEFAULT_CAT_PUPIL_HIGHLIGHT_MORPH_SCALE,
  catBlinkSideColor: DEFAULT_CAT_BLINK_SIDE_COLOR,
  catBlinkSideOpacity: DEFAULT_CAT_BLINK_SIDE_OPACITY,
  catBlinkSideStrokeColor: DEFAULT_CAT_BLINK_SIDE_STROKE_COLOR,
  catBlinkSideStrokeWidth: DEFAULT_CAT_BLINK_SIDE_STROKE_WIDTH,
  catBlinkSideStrokeOpacity: DEFAULT_CAT_BLINK_SIDE_STROKE_OPACITY,
  catBlinkBottomColor: DEFAULT_CAT_BLINK_BOTTOM_COLOR,
  catBlinkBottomOpacity: DEFAULT_CAT_BLINK_BOTTOM_OPACITY,
  catBlinkBottomStrokeColor: DEFAULT_CAT_BLINK_BOTTOM_STROKE_COLOR,
  catBlinkBottomStrokeWidth: DEFAULT_CAT_BLINK_BOTTOM_STROKE_WIDTH,
  catBlinkBottomStrokeOpacity: DEFAULT_CAT_BLINK_BOTTOM_STROKE_OPACITY,
  catBlinkMinDelay: DEFAULT_CAT_BLINK_MIN_DELAY,
  catBlinkMaxDelay: DEFAULT_CAT_BLINK_MAX_DELAY,
  catBlinkInDuration: DEFAULT_CAT_BLINK_IN_DURATION,
  catBlinkHoldDuration: DEFAULT_CAT_BLINK_HOLD_DURATION,
  catBlinkOutDuration: DEFAULT_CAT_BLINK_OUT_DURATION,
  catBlinkSideDelay: DEFAULT_CAT_BLINK_SIDE_DELAY,
  catBlinkEaseIn: DEFAULT_CAT_BLINK_EASE_IN,
  catBlinkEaseOut: DEFAULT_CAT_BLINK_EASE_OUT,
  focusScale: DEFAULT_FOCUS_SCALE,
  focusUpDuration: DEFAULT_FOCUS_UP_DURATION,
  focusDownDuration: DEFAULT_FOCUS_DOWN_DURATION,
  focusMinDelay: DEFAULT_FOCUS_MIN_DELAY,
  focusMaxDelay: DEFAULT_FOCUS_MAX_DELAY,
  focusEaseUp: DEFAULT_FOCUS_EASE_UP,
  focusEaseDown: DEFAULT_FOCUS_EASE_DOWN,
  eyes: [],
  waves: [],
});

export const createEyeField = ({ count, renderer, worldBounds }: EyeFieldOptions) => {
  const root = new Container();
  const runtime = createRuntime(count);
  const contexts = createSharedContexts();
  let textures = createSharedTextures(renderer, contexts, runtime.dropShadowBlur);

  const refreshDropShadowTexture = () => {
    const previousTexture = textures.dropShadowTexture;
    textures = {
      ...textures,
      dropShadowTexture: createDropShadowTexture(renderer, runtime.dropShadowBlur),
    };
    runtime.eyes.forEach((eye) => {
      eye.dropShadow.texture = textures.dropShadowTexture;
    });
    previousTexture.destroy(true);
  };

  const rebuildEyes = () => {
    runtime.eyes.forEach((eye) => eye.root.destroy({ children: true }));
    runtime.eyes = [];
    root.removeChildren();
    const minEyeRadius = runtime.minEyeSize * 0.5;
    const maxEyeRadius = runtime.maxEyeSize * 0.5;
    const radii = resolvePackedRadii(runtime.count, minEyeRadius, maxEyeRadius);

    const positions = packEyePositions(
      radii,
      runtime.clusterRadius,
      runtime.packAttempts,
      runtime.spiralStepDegrees,
      runtime.radialExponent,
      DEFAULT_EYE_SPIRAL_OFFSET,
      runtime.layoutShape,
    );

    positions.forEach((position, index) => {
      const eyeType = resolveEyeType(index + 1, positions.length, runtime.catMix);
      const eye = createEyeInstance(
        contexts,
        textures,
        eyeType,
        position.x,
        position.y,
        position.r,
        maxEyeRadius,
        positions.length,
        index + 1,
      );
      eye.delay = staggerDelay(
        index + 1,
        positions.length,
        runtime.staggerSeconds,
        runtime.randomizeStagger,
      );
      applyStaticEyeSettings(eye, runtime);
      runtime.eyes.push(eye);
      root.addChild(eye.root);
      eye.root.scale.set(eye.renderScale * resolveScaleInProgress(eye, runtime.elapsed));
    });
    root.sortChildren();
  };

  const relayoutEyes = () => {
    if (runtime.eyes.length === 0) {
      return;
    }

    const positions = packEyePositions(
      runtime.eyes.map((eye) => eye.radius),
      runtime.clusterRadius,
      runtime.packAttempts,
      runtime.spiralStepDegrees,
      runtime.radialExponent,
      DEFAULT_EYE_SPIRAL_OFFSET,
      runtime.layoutShape,
    );

    positions.forEach((position, index) => {
      const eye = runtime.eyes[index];
      if (!eye) {
        return;
      }

      startLayoutTransition(eye, position.x, position.y, runtime.layoutTransitionDuration);
    });
  };

  const layout = (width: number, height: number) => {
    runtime.clusterRadius = Math.max(Math.min(width, height) * 0.42, runtime.maxEyeSize * 0.5 + 40);
    root.position.set(width * 0.5, height * 0.5);
    if (runtime.eyes.length === runtime.count && runtime.eyes.length > 0) {
      relayoutEyes();
      return;
    }

    rebuildEyes();
  };

  const syncCount = (nextCount: number) => {
    runtime.count = Math.max(0, Math.floor(nextCount));
    rebuildEyes();
  };

  const setConfig = ({
    layoutShape,
    layoutTransitionDuration,
    layoutTransitionEase,
    minEyeSize,
    maxEyeSize,
    catMix,
    catMorphRadius,
    repulsionRadius,
    clickRepulseRadius,
    clickRepulseStrength,
    clickRepulseEase,
    staggerSeconds,
    shadowOpacity,
    dropShadowColor,
    dropShadowOpacity,
    dropShadowBlur,
    dropShadowSpread,
    roundInnerShadowColor,
    catInnerShadowColor,
    irisColor,
    catEyeColor,
    roundTranslateStrength,
    catTranslateStrength,
    roundHighlightScale,
    roundHighlightOffsetX,
    roundHighlightOffsetY,
    roundHighlightRotationDegrees,
    roundHighlightOpacity,
    catHighlightScale,
    catHighlightOffsetX,
    catHighlightOffsetY,
    catHighlightRotationDegrees,
    catHighlightOpacity,
    catPupilHighlightMorphScale,
    catBlinkSideColor,
    catBlinkSideOpacity,
    catBlinkSideStrokeColor,
    catBlinkSideStrokeWidth,
    catBlinkSideStrokeOpacity,
    catBlinkBottomColor,
    catBlinkBottomOpacity,
    catBlinkBottomStrokeColor,
    catBlinkBottomStrokeWidth,
    catBlinkBottomStrokeOpacity,
    catBlinkMinDelay,
    catBlinkMaxDelay,
    catBlinkInDuration,
    catBlinkHoldDuration,
    catBlinkOutDuration,
    catBlinkSideDelay,
    catBlinkEaseIn,
    catBlinkEaseOut,
    focusScale,
    focusUpDuration,
    focusDownDuration,
    focusMinDelay,
    focusMaxDelay,
    focusEaseUp,
    focusEaseDown,
  }: EyeFieldConfig) => {
    let shouldRebuild = false;
    let shouldRefreshDropShadowTexture = false;
    let shouldRefreshAppearance = false;
    let shouldRelayout = false;

    if (typeof layoutShape === "string" && layoutShape !== runtime.layoutShape) {
      runtime.layoutShape = layoutShape;
      shouldRelayout = true;
    }

    if (typeof layoutTransitionDuration === "number") {
      runtime.layoutTransitionDuration = Math.max(layoutTransitionDuration, 0);
    }

    if (typeof layoutTransitionEase === "string") {
      runtime.layoutTransitionEase = layoutTransitionEase;
    }

    if (typeof catMix === "number") {
      const nextCatMix = clamp(catMix, 0, 1);
      if (nextCatMix !== runtime.catMix) {
        runtime.catMix = nextCatMix;
        shouldRebuild = true;
      }
    }

    if (typeof catMorphRadius === "number") {
      runtime.catMorphRadius = Math.max(catMorphRadius, 0);
    }

    if (typeof catEyeColor === "number" && Number.isFinite(catEyeColor)) {
      runtime.catEyeColor = catEyeColor;
    }

    if (typeof minEyeSize === "number") {
      runtime.minEyeSize = Math.max(1, minEyeSize);
      shouldRebuild = true;
    }

    if (typeof maxEyeSize === "number") {
      runtime.maxEyeSize = Math.max(8, maxEyeSize);
      shouldRebuild = true;
    }

    if (runtime.minEyeSize > runtime.maxEyeSize) {
      const adjusted = runtime.minEyeSize;
      runtime.minEyeSize = runtime.maxEyeSize;
      runtime.maxEyeSize = adjusted;
    }

    if (typeof repulsionRadius === "number") {
      runtime.repulsionRadius = Math.max(0, repulsionRadius);
    }

    if (typeof clickRepulseRadius === "number") {
      runtime.clickRepulseRadius = Math.max(0, clickRepulseRadius);
    }

    if (typeof clickRepulseStrength === "number") {
      runtime.clickRepulseStrength = Math.max(0, clickRepulseStrength);
    }

    if (typeof clickRepulseEase === "string") {
      runtime.clickRepulseEase = clickRepulseEase;
    }

    if (typeof staggerSeconds === "number") {
      runtime.staggerSeconds = Math.max(0, staggerSeconds);
      shouldRebuild = true;
    }

    if (typeof shadowOpacity === "number") {
      runtime.shadowOpacity = clamp(shadowOpacity, 0, 1);
    }

    if (typeof dropShadowColor === "number" && Number.isFinite(dropShadowColor)) {
      runtime.dropShadowColor = dropShadowColor;
    }

    if (typeof dropShadowOpacity === "number") {
      runtime.dropShadowOpacity = clamp(dropShadowOpacity, 0, 1);
    }

    if (typeof dropShadowBlur === "number") {
      const nextDropShadowBlur = Math.max(dropShadowBlur, 0);
      if (nextDropShadowBlur !== runtime.dropShadowBlur) {
        runtime.dropShadowBlur = nextDropShadowBlur;
        shouldRefreshDropShadowTexture = true;
      }
    }

    if (typeof dropShadowSpread === "number") {
      runtime.dropShadowSpread = Math.max(dropShadowSpread, 0);
    }

    if (typeof roundInnerShadowColor === "number" && Number.isFinite(roundInnerShadowColor)) {
      runtime.roundInnerShadowColor = roundInnerShadowColor;
    }

    if (typeof catInnerShadowColor === "number" && Number.isFinite(catInnerShadowColor)) {
      runtime.catInnerShadowColor = catInnerShadowColor;
    }

    if (typeof irisColor === "number" && Number.isFinite(irisColor)) {
      runtime.irisColor = irisColor;
    }

    if (typeof roundTranslateStrength === "number") {
      runtime.roundTranslateStrength = clamp(roundTranslateStrength, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catTranslateStrength === "number") {
      runtime.catTranslateStrength = clamp(catTranslateStrength, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightScale === "number") {
      runtime.roundHighlightScale = Math.max(roundHighlightScale, 0);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightOffsetX === "number") {
      runtime.roundHighlightOffsetX = clamp(roundHighlightOffsetX, -100, 100);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightOffsetY === "number") {
      runtime.roundHighlightOffsetY = clamp(roundHighlightOffsetY, -100, 100);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightRotationDegrees === "number") {
      runtime.roundHighlightRotationDegrees = clamp(roundHighlightRotationDegrees, -180, 180);
      shouldRefreshAppearance = true;
    }

    if (typeof roundHighlightOpacity === "number") {
      runtime.roundHighlightOpacity = clamp(roundHighlightOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightScale === "number") {
      runtime.catHighlightScale = Math.max(catHighlightScale, 0);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightOffsetX === "number") {
      runtime.catHighlightOffsetX = clamp(catHighlightOffsetX, -1, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightOffsetY === "number") {
      runtime.catHighlightOffsetY = clamp(catHighlightOffsetY, -1, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightRotationDegrees === "number") {
      runtime.catHighlightRotationDegrees = clamp(catHighlightRotationDegrees, -180, 180);
      shouldRefreshAppearance = true;
    }

    if (typeof catHighlightOpacity === "number") {
      runtime.catHighlightOpacity = clamp(catHighlightOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catPupilHighlightMorphScale === "number") {
      runtime.catPupilHighlightMorphScale = clamp(catPupilHighlightMorphScale, 1, 8);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideColor === "number" && Number.isFinite(catBlinkSideColor)) {
      runtime.catBlinkSideColor = catBlinkSideColor;
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideOpacity === "number") {
      runtime.catBlinkSideOpacity = clamp(catBlinkSideOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideStrokeColor === "number" && Number.isFinite(catBlinkSideStrokeColor)) {
      runtime.catBlinkSideStrokeColor = catBlinkSideStrokeColor;
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideStrokeWidth === "number") {
      runtime.catBlinkSideStrokeWidth = clamp(catBlinkSideStrokeWidth, 0, 8);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkSideStrokeOpacity === "number") {
      runtime.catBlinkSideStrokeOpacity = clamp(catBlinkSideStrokeOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkBottomColor === "number" && Number.isFinite(catBlinkBottomColor)) {
      runtime.catBlinkBottomColor = catBlinkBottomColor;
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkBottomOpacity === "number") {
      runtime.catBlinkBottomOpacity = clamp(catBlinkBottomOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (
      typeof catBlinkBottomStrokeColor === "number" &&
      Number.isFinite(catBlinkBottomStrokeColor)
    ) {
      runtime.catBlinkBottomStrokeColor = catBlinkBottomStrokeColor;
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkBottomStrokeWidth === "number") {
      runtime.catBlinkBottomStrokeWidth = clamp(catBlinkBottomStrokeWidth, 0, 8);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkBottomStrokeOpacity === "number") {
      runtime.catBlinkBottomStrokeOpacity = clamp(catBlinkBottomStrokeOpacity, 0, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof catBlinkMinDelay === "number") {
      runtime.catBlinkMinDelay = Math.max(catBlinkMinDelay, 0);
    }

    if (typeof catBlinkMaxDelay === "number") {
      runtime.catBlinkMaxDelay = Math.max(catBlinkMaxDelay, 0);
    }

    if (runtime.catBlinkMinDelay > runtime.catBlinkMaxDelay) {
      const adjusted = runtime.catBlinkMinDelay;
      runtime.catBlinkMinDelay = runtime.catBlinkMaxDelay;
      runtime.catBlinkMaxDelay = adjusted;
    }

    if (typeof catBlinkInDuration === "number") {
      runtime.catBlinkInDuration = Math.max(catBlinkInDuration, 0.01);
    }

    if (typeof catBlinkHoldDuration === "number") {
      runtime.catBlinkHoldDuration = Math.max(catBlinkHoldDuration, 0);
    }

    if (typeof catBlinkOutDuration === "number") {
      runtime.catBlinkOutDuration = Math.max(catBlinkOutDuration, 0.01);
    }

    if (typeof catBlinkSideDelay === "number") {
      runtime.catBlinkSideDelay = Math.max(catBlinkSideDelay, 0);
    }

    if (typeof catBlinkEaseIn === "string") {
      runtime.catBlinkEaseIn = catBlinkEaseIn;
    }

    if (typeof catBlinkEaseOut === "string") {
      runtime.catBlinkEaseOut = catBlinkEaseOut;
    }

    if (typeof focusScale === "number") {
      runtime.focusScale = Math.max(focusScale, 1);
      shouldRefreshAppearance = true;
    }

    if (typeof focusUpDuration === "number") {
      runtime.focusUpDuration = Math.max(focusUpDuration, 0.01);
      shouldRefreshAppearance = true;
    }

    if (typeof focusDownDuration === "number") {
      runtime.focusDownDuration = Math.max(focusDownDuration, 0.01);
      shouldRefreshAppearance = true;
    }

    if (typeof focusMinDelay === "number") {
      runtime.focusMinDelay = Math.max(focusMinDelay, 0);
      shouldRefreshAppearance = true;
    }

    if (typeof focusMaxDelay === "number") {
      runtime.focusMaxDelay = Math.max(focusMaxDelay, 0);
      shouldRefreshAppearance = true;
    }

    if (runtime.focusMinDelay > runtime.focusMaxDelay) {
      const adjusted = runtime.focusMinDelay;
      runtime.focusMinDelay = runtime.focusMaxDelay;
      runtime.focusMaxDelay = adjusted;
    }

    if (typeof focusEaseUp === "string") {
      runtime.focusEaseUp = focusEaseUp;
      shouldRefreshAppearance = true;
    }

    if (typeof focusEaseDown === "string") {
      runtime.focusEaseDown = focusEaseDown;
      shouldRefreshAppearance = true;
    }

    if (
      typeof shadowOpacity === "number" ||
      typeof dropShadowColor === "number" ||
      typeof dropShadowOpacity === "number" ||
      typeof dropShadowBlur === "number" ||
      typeof dropShadowSpread === "number" ||
      typeof roundInnerShadowColor === "number" ||
      typeof catInnerShadowColor === "number" ||
      typeof irisColor === "number" ||
      typeof catEyeColor === "number" ||
      typeof roundHighlightScale === "number" ||
      typeof roundHighlightOffsetX === "number" ||
      typeof roundHighlightOffsetY === "number" ||
      typeof roundHighlightRotationDegrees === "number" ||
      typeof roundHighlightOpacity === "number" ||
      typeof catHighlightScale === "number" ||
      typeof catHighlightOffsetX === "number" ||
      typeof catHighlightOffsetY === "number" ||
      typeof catHighlightRotationDegrees === "number" ||
      typeof catHighlightOpacity === "number" ||
      typeof catBlinkSideColor === "number" ||
      typeof catBlinkSideOpacity === "number" ||
      typeof catBlinkSideStrokeColor === "number" ||
      typeof catBlinkSideStrokeWidth === "number" ||
      typeof catBlinkSideStrokeOpacity === "number" ||
      typeof catBlinkBottomColor === "number" ||
      typeof catBlinkBottomOpacity === "number" ||
      typeof catBlinkBottomStrokeColor === "number" ||
      typeof catBlinkBottomStrokeWidth === "number" ||
      typeof catBlinkBottomStrokeOpacity === "number"
    ) {
      runtime.eyes.forEach((eye) => {
        applyStaticEyeSettings(eye, runtime);
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    }

    if (shouldRefreshDropShadowTexture) {
      refreshDropShadowTexture();
    }

    if (shouldRebuild) {
      rebuildEyes();
    } else if (shouldRelayout) {
      relayoutEyes();
    } else if (shouldRefreshAppearance) {
      runtime.eyes.forEach((eye) => {
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    }
  };

  const setPointer = (x: number, y: number, isActive: boolean) => {
    if (root.destroyed) {
      return;
    }

    if (!isActive) {
      runtime.pointerActive = false;
      runtime.scrollFallResumePointerActive = false;
      return;
    }

    const nextTargetMouseX = x - root.position.x;
    const nextTargetMouseY = y - root.position.y;

    if (runtime.scrollFallTarget > 0.5) {
      runtime.pointerActive = false;
      runtime.scrollFallResumePointerActive = true;
      runtime.targetMouseX = nextTargetMouseX;
      runtime.targetMouseY = nextTargetMouseY;
      return;
    }
    const movedDistance = Math.hypot(
      nextTargetMouseX - runtime.targetMouseX,
      nextTargetMouseY - runtime.targetMouseY,
    );
    const isNewPointerSession = !runtime.pointerActive;

    if (isNewPointerSession) {
      runtime.trackingBlend = 0;
      runtime.sharedAttentionBlend = 0;
      runtime.sharedAttentionX = 0;
      runtime.sharedAttentionY = 0;
      runtime.mouseX = nextTargetMouseX;
      runtime.mouseY = nextTargetMouseY;
      runtime.targetMouseX = nextTargetMouseX;
      runtime.targetMouseY = nextTargetMouseY;
      runtime.eyes.forEach((eye) => {
        eye.parallaxX = 0;
        eye.parallaxY = 0;
        eye.repelX = 0;
        eye.repelY = 0;
        eye.lookX = 0;
        eye.lookY = 0;
        eye.currentScaleX = 1;
        eye.currentScaleY = 1;
        eye.currentAngle = 0;
        eye.catMorph = 0;
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    }

    if (isNewPointerSession || movedDistance > 0.5) {
      runtime.lastPointerMoveAt = runtime.elapsed;
      runtime.nextSharedAttentionAt = runtime.elapsed + runtime.sharedAttentionDelay;
    }

    runtime.pointerActive = true;
    runtime.targetMouseX = nextTargetMouseX;
    runtime.targetMouseY = nextTargetMouseY;
  };

  const setScrollFall = (isActive: boolean) => {
    if (root.destroyed) {
      return;
    }

    const nextTarget = isActive ? 1 : 0;
    if (runtime.scrollFallTarget === nextTarget) {
      return;
    }

    runtime.scrollFallTarget = nextTarget;
    runtime.scrollFallElapsed = 0;
    runtime.scrollReturnElapsed = nextTarget <= 0.5 ? 0 : Number.POSITIVE_INFINITY;
    runtime.waves.length = 0;
    if (isActive) {
      runtime.scrollFallResumePointerActive = runtime.pointerActive;
      runtime.pointerActive = false;
      runtime.eyes.forEach((eye) => {
        resetScrollFallState(eye);
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    } else {
      runtime.pointerActive = runtime.scrollFallResumePointerActive;
      runtime.eyes.forEach((eye) => {
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
      });
    }
  };

  const pointerDown = (x: number, y: number) => {
    if (root.destroyed) {
      return;
    }

    if (runtime.scrollFallTarget > 0.5) {
      return;
    }

    setPointer(x, y, true);
    runtime.waves.push({
      x: runtime.mouseX,
      y: runtime.mouseY,
      elapsed: 0,
    });
  };

  const update = (dtSeconds: number): EyeFieldMetrics => {
    runtime.elapsed += Math.max(dtSeconds, 0);
    const isScrollFallLocked = runtime.scrollFallTarget > 0.5;
    const trackingTarget = runtime.pointerActive && !isScrollFallLocked ? 1 : 0;
    runtime.trackingBlend = smoothTowards(
      runtime.trackingBlend,
      trackingTarget,
      runtime.trackingBlendSpeed,
      dtSeconds,
    );
    runtime.mouseX = smoothTowards(
      runtime.mouseX,
      runtime.targetMouseX,
      runtime.pointerEaseSpeed,
      dtSeconds,
    );
    runtime.mouseY = smoothTowards(
      runtime.mouseY,
      runtime.targetMouseY,
      runtime.pointerEaseSpeed,
      dtSeconds,
    );
    const sharedAttentionIdle =
      !isScrollFallLocked &&
      runtime.elapsed - runtime.lastPointerMoveAt >= runtime.sharedAttentionDelay;

    if (sharedAttentionIdle && runtime.elapsed >= runtime.nextSharedAttentionAt) {
      const nextTarget = sampleSharedAttentionTarget(runtime);
      runtime.sharedAttentionX = nextTarget.x;
      runtime.sharedAttentionY = nextTarget.y;
      runtime.nextSharedAttentionAt = runtime.elapsed + sampleSharedAttentionDelay(runtime);
    }

    runtime.sharedAttentionBlend = smoothTowards(
      runtime.sharedAttentionBlend,
      sharedAttentionIdle ? 1 : 0,
      runtime.sharedAttentionBlendSpeed,
      dtSeconds,
    );
    runtime.scrollFallBlend = smoothTowards(
      runtime.scrollFallBlend,
      runtime.scrollFallTarget,
      runtime.scrollFallBlendSpeed,
      dtSeconds,
    );
    runtime.scrollFallElapsed =
      runtime.scrollFallTarget > 0.5 ? runtime.scrollFallElapsed + dtSeconds : 0;
    runtime.scrollReturnElapsed =
      runtime.scrollFallTarget <= 0.5
        ? runtime.scrollReturnElapsed + dtSeconds
        : Number.POSITIVE_INFINITY;
    for (let waveIndex = runtime.waves.length - 1; waveIndex >= 0; waveIndex -= 1) {
      const wave = runtime.waves[waveIndex];
      wave.elapsed += dtSeconds;
      if (wave.elapsed >= clickWaveLifetime(runtime.clickRepulseRadius)) {
        runtime.waves.splice(waveIndex, 1);
      }
    }

    let visibleCount = 0;

    runtime.eyes.forEach((eye) => {
      updateLayoutTransition(eye, runtime, dtSeconds);
      eye.appearanceAccumulator += dtSeconds;
      if (isScrollFallLocked) {
        eye.parallaxX = smoothTowards(eye.parallaxX, 0, runtime.pointerEaseSpeed, dtSeconds);
        eye.parallaxY = smoothTowards(eye.parallaxY, 0, runtime.pointerEaseSpeed, dtSeconds);
        eye.repelX = smoothTowards(eye.repelX, 0, runtime.repulsionReturnSpeed, dtSeconds);
        eye.repelY = smoothTowards(eye.repelY, 0, runtime.repulsionReturnSpeed, dtSeconds);
      } else {
        const parallax = parallaxOffset(runtime, eye);
        eye.parallaxX = parallax.x;
        eye.parallaxY = parallax.y;

        const targetRepel = repulsionTarget(runtime, eye);
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

      const eyeSeconds = dtSeconds;
      const introScaleProgress = resolveScaleInProgress(eye, runtime.elapsed);
      updateScrollFallState(eye, runtime, worldBounds, dtSeconds);
      const squashScaleX =
        eye.fallSquash >= 0 ? 1 + eye.fallSquash * 0.85 : 1 + eye.fallSquash * 0.4;
      const squashScaleY =
        eye.fallSquash >= 0 ? 1 - eye.fallSquash * 0.75 : 1 - eye.fallSquash * 0.5;
      eye.root.scale.set(
        eye.renderScale * introScaleProgress * squashScaleX,
        eye.renderScale * introScaleProgress * squashScaleY,
      );

      const interactionOffset = totalOffset(eye);
      const interactionDrawX = eye.x + interactionOffset.x + eye.fallOffsetX;
      const interactionDrawY = eye.y + interactionOffset.y + eye.fallOffsetY;
      eye.root.position.set(interactionDrawX, interactionDrawY);
      eye.root.rotation = (eye.fallRotationDegrees * Math.PI) / 180;

      const visibleRadius =
        renderedEyeRadius(eye) *
        introScaleProgress *
        Math.max(Math.abs(squashScaleX), Math.abs(squashScaleY), 0.001);
      const drawX = root.position.x + interactionDrawX;
      const drawY = root.position.y + interactionDrawY;
      const isVisible =
        drawX - visibleRadius < worldBounds.x + worldBounds.width &&
        drawX + visibleRadius > worldBounds.x &&
        drawY - visibleRadius < worldBounds.y + worldBounds.height &&
        drawY + visibleRadius > worldBounds.y;

      eye.root.visible = isVisible;
      visibleCount += Number(isVisible);

      if (!isVisible) {
        eye.needsAppearanceRefresh = true;
        eye.appearanceAccumulator = eye.appearanceUpdateInterval;
        return;
      }

      const cursorLook =
        runtime.trackingBlend > 0.0001
          ? (() => {
              const rawCursorLook = clampMagnitude(
                (runtime.mouseX - interactionDrawX) / eye.scale,
                (runtime.mouseY - interactionDrawY) / eye.scale,
                MAX_LOOK,
              );

              return {
                x: rawCursorLook.x * runtime.trackingBlend,
                y: rawCursorLook.y * runtime.trackingBlend,
              };
            })()
          : { x: 0, y: 0 };
      const sharedAttentionLook =
        runtime.sharedAttentionBlend > 0.0001
          ? sampleEyeSharedAttentionLook(
              runtime,
              eye,
              runtime.pointerActive ? "scattered" : "unified",
            )
          : { x: 0, y: 0 };
      const desiredLook = {
        x: lerp(cursorLook.x, sharedAttentionLook.x, runtime.sharedAttentionBlend),
        y: lerp(cursorLook.y, sharedAttentionLook.y, runtime.sharedAttentionBlend),
      };

      const lookSpeed = pupilFollowSpeed(runtime, eye);
      eye.lookX = smoothTowards(eye.lookX, desiredLook.x, lookSpeed, eyeSeconds);
      eye.lookY = smoothTowards(eye.lookY, desiredLook.y, lookSpeed, eyeSeconds);
      const variant = eyeVariantMetrics(eye.type);

      if (eye.type === "cat") {
        if (isScrollFallLocked) {
          eye.catMorph = smoothTowards(eye.catMorph, 0, CAT_PUPIL_MORPH_SPEED, eyeSeconds);
          eye.catBlink = 0;
          eye.catBlinkBottom = 0;
          eye.catBlinkSide = 0;
          eye.currentScaleX = 1;
          eye.currentScaleY = 1;
          eye.currentAngle = 0;
          eye.focusPulseScale = 1;
        } else {
          const morphCenterX = eye.x + eye.parallaxX;
          const morphCenterY = eye.y + eye.parallaxY;
          const scaleRadius = Math.max(
            runtime.catMorphRadius * eye.scale,
            runtime.catMorphRadius * 0.6,
          );
          const morphRadius = Math.max(
            scaleRadius,
            SCLERA_RADIUS * eye.root.scale.x * CAT_PUPIL_MORPH_RADIUS_FACTOR,
            CAT_PUPIL_MORPH_RADIUS_MIN,
          );
          const pointerDistance = Math.hypot(
            runtime.mouseX - morphCenterX,
            runtime.mouseY - morphCenterY,
          );
          const morphTarget =
            runtime.trackingBlend <= 0.0001
              ? 0
              : smoothstep(1 - clamp(pointerDistance / morphRadius, 0, 1)) * runtime.trackingBlend;

          eye.catMorph = smoothTowards(
            eye.catMorph,
            morphTarget,
            CAT_PUPIL_MORPH_SPEED,
            eyeSeconds,
          );
          const blinkIdleDelay =
            runtime.catBlinkMinDelay +
            eye.blinkDelayMix * Math.max(runtime.catBlinkMaxDelay - runtime.catBlinkMinDelay, 0);
          const blinkHoldDuration = runtime.catBlinkHoldDuration;
          const blinkCycle =
            blinkIdleDelay +
            runtime.catBlinkInDuration +
            blinkHoldDuration +
            runtime.catBlinkOutDuration;
          const blinkTime =
            (runtime.elapsed + eye.blinkCycleOffset * blinkCycle) / Math.max(blinkCycle, 0.001);
          const blinkPhase = (blinkTime - Math.floor(blinkTime)) * blinkCycle;
          let nextCatBlink = 0;
          let nextCatBlinkBottom = 0;
          let nextCatBlinkSide = 0;
          const blinkCloseEnd = blinkIdleDelay + runtime.catBlinkInDuration;
          const blinkHoldEnd = blinkCloseEnd + blinkHoldDuration;
          const sideDelayIn = Math.min(
            runtime.catBlinkSideDelay,
            Math.max(runtime.catBlinkInDuration - 0.01, 0),
          );
          const sideDelayOut = Math.min(
            runtime.catBlinkSideDelay,
            Math.max(runtime.catBlinkOutDuration - 0.01, 0),
          );

          if (blinkPhase > blinkIdleDelay && blinkPhase <= blinkCloseEnd) {
            const t = (blinkPhase - blinkIdleDelay) / Math.max(runtime.catBlinkInDuration, 0.01);
            nextCatBlinkBottom = applyFocusEase(runtime.catBlinkEaseIn, t);
            nextCatBlinkSide =
              blinkPhase <= blinkIdleDelay + sideDelayIn
                ? 0
                : applyFocusEase(
                    runtime.catBlinkEaseIn,
                    remap01(blinkPhase - blinkIdleDelay, sideDelayIn, runtime.catBlinkInDuration),
                  );
          } else if (blinkPhase > blinkCloseEnd && blinkPhase <= blinkHoldEnd) {
            nextCatBlinkBottom = 1;
            nextCatBlinkSide = 1;
          } else if (
            blinkPhase > blinkHoldEnd &&
            blinkPhase <= blinkHoldEnd + runtime.catBlinkOutDuration
          ) {
            const t = (blinkPhase - blinkHoldEnd) / Math.max(runtime.catBlinkOutDuration, 0.01);
            nextCatBlinkSide = 1 - applyFocusEase(runtime.catBlinkEaseOut, t);
            nextCatBlinkBottom =
              blinkPhase <= blinkHoldEnd + sideDelayOut
                ? 1
                : 1 -
                  applyFocusEase(
                    runtime.catBlinkEaseOut,
                    remap01(blinkPhase - blinkHoldEnd, sideDelayOut, runtime.catBlinkOutDuration),
                  );
          }

          nextCatBlink = Math.max(nextCatBlinkBottom, nextCatBlinkSide);
          eye.catBlink = nextCatBlink;
          eye.catBlinkBottom = nextCatBlinkBottom;
          eye.catBlinkSide = nextCatBlinkSide;
          eye.currentScaleX = 1;
          eye.currentScaleY = 1;
          eye.currentAngle = 0;
          eye.focusPulseScale = 1;
        }
      } else {
        eye.catMorph = smoothTowards(eye.catMorph, 0, CAT_PUPIL_MORPH_SPEED, eyeSeconds);
        eye.catBlink = 0;
        eye.catBlinkBottom = 0;
        eye.catBlinkSide = 0;
        const pupilOffsetForDeform = clampMagnitude(
          eye.lookX * PUPIL_INNER_TRAVEL,
          eye.lookY * PUPIL_INNER_TRAVEL,
          Math.max(
            IRIS_RADIUS * variant.irisScale -
              variant.pupilClipRadius * eye.focusPulseScale -
              PUPIL_CLIP_MARGIN,
            0,
          ),
        );
        const distance = Math.hypot(pupilOffsetForDeform.x, pupilOffsetForDeform.y);
        const deformRange = Math.max(
          IRIS_RADIUS * variant.irisScale - variant.pupilClipRadius * 0.92,
          0.001,
        );
        const deformT = clamp(distance / deformRange, 0, 1);
        const targetScaleX = 1 - deformT * MAX_SQUASH;
        const targetScaleY = 1 + deformT * MAX_SQUASH * 0.5;
        const targetAngle =
          Math.abs(eye.lookX) > 0.001 || Math.abs(eye.lookY) > 0.001
            ? (Math.atan2(eye.lookY, eye.lookX) * 180) / Math.PI
            : 0;

        eye.currentScaleX = smoothTowards(
          eye.currentScaleX,
          targetScaleX,
          SQUEEZE_SPEED,
          eyeSeconds,
        );
        eye.currentScaleY = smoothTowards(
          eye.currentScaleY,
          targetScaleY,
          SQUEEZE_SPEED,
          eyeSeconds,
        );
        eye.currentAngle = smoothAngleTowards(
          eye.currentAngle,
          targetAngle,
          SQUEEZE_SPEED,
          eyeSeconds,
        );

        if (isScrollFallLocked) {
          eye.focusPulseScale = 1;
        } else {
          const idleDelay =
            runtime.focusMinDelay +
            eye.focusDelayMix * Math.max(runtime.focusMaxDelay - runtime.focusMinDelay, 0);
          const pulseCycle = idleDelay + runtime.focusUpDuration + runtime.focusDownDuration;
          const pulseTime =
            (runtime.elapsed + eye.focusCycleOffset * pulseCycle) % Math.max(pulseCycle, 0.001);
          let nextFocusScale = 1;

          if (pulseTime > idleDelay && pulseTime <= idleDelay + runtime.focusUpDuration) {
            const t = (pulseTime - idleDelay) / Math.max(runtime.focusUpDuration, 0.01);
            nextFocusScale = 1 + (runtime.focusScale - 1) * applyFocusEase(runtime.focusEaseUp, t);
          } else if (
            pulseTime > idleDelay + runtime.focusUpDuration &&
            pulseTime <= idleDelay + runtime.focusUpDuration + runtime.focusDownDuration
          ) {
            const t =
              (pulseTime - idleDelay - runtime.focusUpDuration) /
              Math.max(runtime.focusDownDuration, 0.01);
            nextFocusScale =
              1 + (runtime.focusScale - 1) * (1 - applyFocusEase(runtime.focusEaseDown, t));
          }

          eye.focusPulseScale = nextFocusScale;
        }
      }

      const shouldThrottleAppearance = eye.lowDetail && runtime.scrollFallBlend <= 0.0001;
      if (
        shouldThrottleAppearance &&
        eye.scaleInFinished &&
        !eye.needsAppearanceRefresh &&
        eye.appearanceAccumulator < eye.appearanceUpdateInterval
      ) {
        return;
      }

      eye.appearanceAccumulator = 0;
      applyPupilAppearance(eye, runtime);
    });

    return {
      visibleCount,
    };
  };

  rebuildEyes();

  return {
    root,
    layout,
    syncCount,
    setConfig,
    setPointer,
    setScrollFall,
    pointerDown,
    update,
    destroy: () => {
      if (root.destroyed) {
        return;
      }

      root.destroy({ children: true });
      destroySharedTextures(textures);
      destroySharedContexts(contexts);
    },
  };
};

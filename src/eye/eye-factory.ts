import { Container, Graphics, Sprite } from "pixi.js";

import type { EyeInstance } from "./eye-state";
import type { SharedContexts, SharedTextures } from "./eye-assets";
import { SCLERA_RADIUS, DEFAULT_IRIS_COLOR, selectBucket } from "./eye-assets";
import {
  DEFAULT_RANDOMIZE_STAGGER,
  DEFAULT_LOW_DETAIL_SCALE_THRESHOLD,
  SCALE_IN_DURATION,
  MICRO_SACCADE_DURATION,
} from "./eye-config";
import { hash01, smoothstep } from "../shared/math";
import { staggerDelay } from "./layout";

export function createEyeInstance(
  contexts: SharedContexts,
  textures: SharedTextures,
  x: number,
  y: number,
  radius: number,
  maxRadius: number,
  count: number,
  index: number,
): EyeInstance {
  const bucket = selectBucket(radius);
  const bt = textures.buckets[bucket];

  const root = new Container();
  const dropShadow = new Sprite(bt.dropShadowTexture);
  const eyeFill = new Sprite(bt.scleraFillTexture);
  const irisClipMask = new Graphics(contexts.scleraMaskContext);
  const blinkGroup = new Container();
  const eyeOutline = new Sprite(bt.scleraOutlineTexture);
  const eyeShadow = new Sprite(bt.scleraShadowTexture);
  const globeHighlight = new Sprite(bt.roundGlobeHighlightTexture);
  const irisGroup = new Container();
  const pupilGroup = new Container();

  const iris = new Sprite(bt.irisFillTexture);
  const pupil = new Sprite(bt.roundPupilTexture);
  const highlight = new Sprite(bt.roundHighlightTexture);

  iris.tint = DEFAULT_IRIS_COLOR;
  dropShadow.anchor.set(0.5);
  eyeFill.anchor.set(0.5);
  eyeOutline.anchor.set(0.5);
  eyeShadow.anchor.set(0.5);
  globeHighlight.anchor.set(0.5);
  iris.anchor.set(0.5);
  pupil.anchor.set(0.5);
  highlight.anchor.set(0.5);

  pupilGroup.addChild(pupil, highlight);
  irisGroup.addChild(iris, pupilGroup);

  root.addChild(
    dropShadow,
    eyeFill,
    irisClipMask,
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
    type: "human",
    root,
    dropShadow,
    eyeFill,
    eyeOutline,
    eyeShadow,
    globeHighlight,
    irisClipMask,
    blinkGroup,
    irisGroup,
    pupilGroup,
    iris,
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
    pupilScale: 1,
    irisProximity: 0,
    focusDelayMix: hash01(index * 8.137 + count * 1.17),
    focusCycleOffset: hash01(index * 17.413 + count * 2.31),
    microSaccadeTimer: hash01(index * 3.17) * MICRO_SACCADE_DURATION,
    microSaccadePhase: 0,
    microSaccadeX: 0,
    microSaccadeY: 0,
  } satisfies EyeInstance;
}

export function eyeAppearanceUpdateInterval(scale: number): number {
  const fps = lerpAppearanceFps(scale);
  return 1 / Math.max(fps, 1);
}

export function lowDetailEnabled(scale: number): boolean {
  return scale < clamp(DEFAULT_LOW_DETAIL_SCALE_THRESHOLD, 0, 1);
}

export function resolveScaleInProgress(eye: EyeInstance, elapsed: number): number {
  const progress = clamp((elapsed - eye.delay) / SCALE_IN_DURATION, 0, 1);
  eye.scaleInFinished = progress >= 0.999;

  return smoothstep(progress);
}

function lerpAppearanceFps(scale: number): number {
  const t = clamp(scale, 0, 1);
  const DEFAULT_SMALL_EYE_APPEARANCE_FPS = 24;
  const DEFAULT_LARGE_EYE_APPEARANCE_FPS = 60;
  return (
    DEFAULT_SMALL_EYE_APPEARANCE_FPS +
    (DEFAULT_LARGE_EYE_APPEARANCE_FPS - DEFAULT_SMALL_EYE_APPEARANCE_FPS) * t
  );
}

function clamp(value: number, minValue: number, maxValue: number): number {
  return Math.max(minValue, Math.min(value, maxValue));
}

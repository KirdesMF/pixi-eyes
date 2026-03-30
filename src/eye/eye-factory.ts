// Eye factory - creates eye instances

import { Container, Graphics, Sprite } from "pixi.js";

import type { EyeType } from "./eye-types";
import type { EyeInstance } from "./eye-state";
import type { SharedContexts, SharedTextures } from "./eye-assets";
import {
  SCLERA_RADIUS,
  IRIS_RADIUS,
  DEFAULT_IRIS_COLOR,
} from "./eye-assets";
import {
  DEFAULT_RANDOMIZE_STAGGER,
  DEFAULT_LOW_DETAIL_SCALE_THRESHOLD,
  SCALE_IN_DURATION,
} from "./eye-config";
import { drawCatPupil } from "./render/cat-eye-view";
import { drawCatBlinkBottomLid, drawCatBlinkSideLid } from "./behaviors/eye-blink";
import { hash01, smoothstep } from "../shared/math";
import { staggerDelay } from "./layout";

export function createEyeInstance(
  contexts: SharedContexts,
  textures: SharedTextures,
  type: EyeType,
  x: number,
  y: number,
  radius: number,
  maxRadius: number,
  count: number,
  index: number,
): EyeInstance {
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
    fillColor: 0x111113,
    fillOpacity: 0.66,
    strokeColor: 0x66dc1a,
    strokeOpacity: 0.26,
    strokeWidth: 2,
  });
  drawCatBlinkSideLid(blinkLeft, 0, "left", {
    fillColor: 0x000000,
    fillOpacity: 1,
    strokeColor: 0x66dc1a,
    strokeOpacity: 0.6,
    strokeWidth: 4,
  });
  drawCatBlinkSideLid(blinkRight, 0, "right", {
    fillColor: 0x000000,
    fillOpacity: 1,
    strokeColor: 0x66dc1a,
    strokeOpacity: 0.6,
    strokeWidth: 4,
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
  return DEFAULT_SMALL_EYE_APPEARANCE_FPS + (DEFAULT_LARGE_EYE_APPEARANCE_FPS - DEFAULT_SMALL_EYE_APPEARANCE_FPS) * t;
}

function clamp(value: number, minValue: number, maxValue: number): number {
  return Math.max(minValue, Math.min(value, maxValue));
}

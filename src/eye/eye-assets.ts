// Shared eye assets (textures, graphics contexts)

import {
  BlurFilter,
  Container,
  Graphics,
  GraphicsContext,
  Rectangle,
  type Renderer,
} from "pixi.js";

// Constants
const SCLERA_RADIUS = 24;
const GLOBE_TEXTURE_PADDING = 4;
const GLOBE_TEXTURE_RESOLUTION = 4;
const DROP_SHADOW_TEXTURE_PADDING = 18;
const IRIS_RADIUS = 16;
const PUPIL_RADIUS = 11; // Slightly smaller pupil
const HIGHLIGHT_RADIUS = 2.2;
const CAT_PUPIL_HALF_WIDTH = PUPIL_RADIUS * 0.44;
const CAT_PUPIL_HALF_HEIGHT = PUPIL_RADIUS * 1.84;
const SHADOW_EDGE_OFFSET_DEGREES = 68;
const SHADOW_TOP_CONTROL_X_FACTOR = 0.42;
const SHADOW_TOP_CONTROL_Y = 0.9;
const SHADOW_SIDE_CONTROL_X_FACTOR = 0.9;
const SHADOW_RIGHT_CONTROL_Y = 0.82;
const SHADOW_BOTTOM_CONTROL_X_FACTOR = 0.24;
const SHADOW_BOTTOM_RIGHT_CONTROL_Y = 1;
const SHADOW_BOTTOM_LEFT_CONTROL_Y = 1;
const SHADOW_BOTTOM_X = 0;
const SHADOW_BOTTOM_Y = 1;

// Default colors
export const DEFAULT_IRIS_COLOR = 0xab53ee;
export const DEFAULT_CAT_EYE_COLOR = 0x66e01a;

// Cat eye constants
export const CAT_IRIS_SCALE = 1.38;
export const CAT_PUPIL_HALF_WIDTH_FACTOR = 0.44;
export const CAT_PUPIL_HIGHLIGHT_SCALE = 0.56;
export const CAT_PUPIL_MORPH_SPEED = 12;
export const CAT_PUPIL_MORPH_RADIUS_FACTOR = 2.6;
export const CAT_PUPIL_MORPH_RADIUS_MIN = 28;
export const CAT_BLINK_RECT_WIDTH = SCLERA_RADIUS + GLOBE_TEXTURE_PADDING + 6;
export const CAT_BLINK_BOTTOM_HEIGHT = (SCLERA_RADIUS + GLOBE_TEXTURE_PADDING + 8) * 2;

// Export radii constants
export {
  SCLERA_RADIUS,
  IRIS_RADIUS,
  PUPIL_RADIUS,
  HIGHLIGHT_RADIUS,
  CAT_PUPIL_HALF_WIDTH,
  CAT_PUPIL_HALF_HEIGHT,
};

/**
 * Shared graphics contexts for eye rendering.
 */
export type SharedContexts = {
  scleraFillContext: GraphicsContext;
  scleraMaskContext: GraphicsContext;
  scleraOutlineContext: GraphicsContext;
  scleraShadowContext: GraphicsContext;
  roundGlobeHighlightContext: GraphicsContext;
  catGlobeHighlightContext: GraphicsContext;
  irisContext: GraphicsContext;
  irisMaskContext: GraphicsContext;
  roundPupilContext: GraphicsContext;
  catPupilContext: GraphicsContext;
  highlightContext: GraphicsContext;
  catBlinkSideContext: GraphicsContext;
  catBlinkBottomContext: GraphicsContext;
};

/**
 * Shared textures for eye rendering.
 */
export type TextureBucket = "small" | "medium" | "large";

export const BUCKET_THRESHOLDS = {
  small: { maxRadius: 20, resolution: 1 },
  medium: { maxRadius: 45, resolution: 2 },
  large: { maxRadius: Infinity, resolution: 4 },
};

export function selectBucket(radius: number): TextureBucket {
  if (radius <= BUCKET_THRESHOLDS.small.maxRadius) return "small";
  if (radius <= BUCKET_THRESHOLDS.medium.maxRadius) return "medium";
  return "large";
}

export type BucketTextures = {
  dropShadowTexture: ReturnType<Renderer["generateTexture"]>;
  scleraFillTexture: ReturnType<Renderer["generateTexture"]>;
  scleraOutlineTexture: ReturnType<Renderer["generateTexture"]>;
  scleraShadowTexture: ReturnType<Renderer["generateTexture"]>;
  roundGlobeHighlightTexture: ReturnType<Renderer["generateTexture"]>;
  catGlobeHighlightTexture: ReturnType<Renderer["generateTexture"]>;
  irisFillTexture: ReturnType<Renderer["generateTexture"]>;
  roundPupilTexture: ReturnType<Renderer["generateTexture"]>;
  roundHighlightTexture: ReturnType<Renderer["generateTexture"]>;
  catBlinkSideTexture: ReturnType<Renderer["generateTexture"]>;
  catBlinkBottomTexture: ReturnType<Renderer["generateTexture"]>;
};

export type SharedTextures = {
  buckets: Record<TextureBucket, BucketTextures>;
};

function shadowEdgePoint(sign: number): { x: number; y: number } {
  const offset = (SHADOW_EDGE_OFFSET_DEGREES * Math.PI) / 180;
  return {
    x: Math.sin(offset) * sign,
    y: Math.cos(offset),
  };
}

/**
 * Creates all shared graphics contexts.
 */
export function createSharedContexts(): SharedContexts {
  const scleraFillContext = new GraphicsContext().circle(0, 0, SCLERA_RADIUS).fill(0xfffbf2);
  const scleraMaskContext = new GraphicsContext().circle(0, 0, SCLERA_RADIUS).fill(0xffffff);
  const scleraOutlineContext = new GraphicsContext()
    .circle(0, 0, SCLERA_RADIUS)
    .stroke({ color: 0x2c241d, width: 2, alignment: 1 });

  const shadowLeft = shadowEdgePoint(-1);
  const shadowRight = shadowEdgePoint(1);
  const scleraShadowContext = new GraphicsContext()
    .moveTo(shadowLeft.x * SCLERA_RADIUS, shadowLeft.y * SCLERA_RADIUS)
    .bezierCurveTo(
      shadowLeft.x * SHADOW_TOP_CONTROL_X_FACTOR * SCLERA_RADIUS,
      SHADOW_TOP_CONTROL_Y * SCLERA_RADIUS,
      shadowRight.x * SHADOW_TOP_CONTROL_X_FACTOR * SCLERA_RADIUS,
      SHADOW_TOP_CONTROL_Y * SCLERA_RADIUS,
      shadowRight.x * SCLERA_RADIUS,
      shadowRight.y * SCLERA_RADIUS,
    )
    .bezierCurveTo(
      shadowRight.x * SHADOW_SIDE_CONTROL_X_FACTOR * SCLERA_RADIUS,
      SHADOW_RIGHT_CONTROL_Y * SCLERA_RADIUS,
      shadowRight.x * SHADOW_BOTTOM_CONTROL_X_FACTOR * SCLERA_RADIUS,
      SHADOW_BOTTOM_RIGHT_CONTROL_Y * SCLERA_RADIUS,
      SHADOW_BOTTOM_X * SCLERA_RADIUS,
      SHADOW_BOTTOM_Y * SCLERA_RADIUS,
    )
    .bezierCurveTo(
      shadowLeft.x * SHADOW_BOTTOM_CONTROL_X_FACTOR * SCLERA_RADIUS,
      SHADOW_BOTTOM_LEFT_CONTROL_Y * SCLERA_RADIUS,
      shadowLeft.x * SHADOW_SIDE_CONTROL_X_FACTOR * SCLERA_RADIUS,
      SHADOW_RIGHT_CONTROL_Y * SCLERA_RADIUS,
      shadowLeft.x * SCLERA_RADIUS,
      shadowLeft.y * SCLERA_RADIUS,
    )
    .closePath()
    .fill({ color: 0xffffff, alpha: 1 });

  const roundGlobeHighlightContext = new GraphicsContext()
    .moveTo(0.69, -7.64)
    .bezierCurveTo(7.59, -7.64, 12.5, -2.21, 12.5, 0)
    .bezierCurveTo(11.61, 2.78, 6.59, -1.55, -0.31, -1.55)
    .bezierCurveTo(-7.21, -1.55, -12.13, 2.65, -12.5, 0)
    .bezierCurveTo(-12.5, -2.21, -6.21, -7.64, 0.69, -7.64)
    .closePath()
    .fill({ color: 0xffffff, alpha: 1 });

  const catGlobeHighlightContext = new GraphicsContext()
    .moveTo(0.69, -7.64)
    .bezierCurveTo(7.59, -7.64, 12.5, -2.21, 12.5, 0)
    .bezierCurveTo(11.61, 2.78, 6.59, -1.55, -0.31, -1.55)
    .bezierCurveTo(-7.21, -1.55, -12.13, 2.65, -12.5, 0)
    .bezierCurveTo(-12.5, -2.21, -6.21, -7.64, 0.69, -7.64)
    .closePath()
    .fill({ color: 0xffffff, alpha: 1 });

  const irisContext = new GraphicsContext().circle(0, 0, IRIS_RADIUS).fill(0xffffff);
  const irisMaskContext = new GraphicsContext().circle(0, 0, IRIS_RADIUS).fill(0xffffff);
  const roundPupilContext = new GraphicsContext().circle(0, 0, PUPIL_RADIUS).fill(0x17110d);
  const catPupilContext = new GraphicsContext()
    .moveTo(0, -PUPIL_RADIUS * 1.84)
    .bezierCurveTo(
      CAT_PUPIL_HALF_WIDTH,
      -PUPIL_RADIUS * 0.92,
      CAT_PUPIL_HALF_WIDTH,
      PUPIL_RADIUS * 0.92,
      0,
      PUPIL_RADIUS * 1.84,
    )
    .bezierCurveTo(
      -CAT_PUPIL_HALF_WIDTH,
      PUPIL_RADIUS * 0.92,
      -CAT_PUPIL_HALF_WIDTH,
      -PUPIL_RADIUS * 0.92,
      0,
      -PUPIL_RADIUS * 1.84,
    )
    .closePath()
    .fill(0x17110d);
  const highlightContext = new GraphicsContext().circle(0, 0, HIGHLIGHT_RADIUS).fill(0xfffbf2);
  // Blink contexts need to match the texture frame size for proper UV mapping
  // blinkFrameSize = 110, so we create a rect from -110 to +110
  const blinkFrameSize = 110;
  const catBlinkSideContext = new GraphicsContext()
    .rect(-blinkFrameSize, -blinkFrameSize, blinkFrameSize * 2, blinkFrameSize * 2)
    .fill({ color: 0xffffff, alpha: 1 });
  const catBlinkBottomContext = new GraphicsContext()
    .rect(-blinkFrameSize, -blinkFrameSize, blinkFrameSize * 2, blinkFrameSize * 2)
    .fill({ color: 0xffffff, alpha: 1 });

  return {
    scleraFillContext,
    scleraMaskContext,
    scleraOutlineContext,
    scleraShadowContext,
    roundGlobeHighlightContext,
    catGlobeHighlightContext,
    irisContext,
    irisMaskContext,
    roundPupilContext,
    catPupilContext,
    highlightContext,
    catBlinkSideContext,
    catBlinkBottomContext,
  };
}

function generateTextureFromContext(
  renderer: Renderer,
  context: GraphicsContext,
  options?: { antialias?: boolean; padding?: number; resolution?: number },
) {
  const target = new Graphics(context);
  const padding = options?.padding ?? GLOBE_TEXTURE_PADDING;
  const resolution = options?.resolution ?? GLOBE_TEXTURE_RESOLUTION;
  const textureFrame = new Rectangle(
    -(SCLERA_RADIUS + padding),
    -(SCLERA_RADIUS + padding),
    (SCLERA_RADIUS + padding) * 2,
    (SCLERA_RADIUS + padding) * 2,
  );
  const texture = renderer.generateTexture({
    target,
    frame: textureFrame,
    resolution,
    antialias: options?.antialias ?? true,
    clearColor: [0, 0, 0, 0],
    textureSourceOptions: {
      scaleMode: "linear",
      autoGenerateMipmaps: true,
    },
  });

  target.destroy();

  return texture;
}

/**
 * Creates a texture from a context with a custom frame size.
 * Used for blink textures which are larger than the standard globe textures.
 */
function generateTextureFromContextWithFrame(
  renderer: Renderer,
  context: GraphicsContext,
  frameSize: number,
  options?: { antialias?: boolean; resolution?: number },
) {
  const target = new Graphics(context);
  const resolution = options?.resolution ?? GLOBE_TEXTURE_RESOLUTION;
  const textureFrame = new Rectangle(-frameSize, -frameSize, frameSize * 2, frameSize * 2);
  const texture = renderer.generateTexture({
    target,
    frame: textureFrame,
    resolution,
    antialias: options?.antialias ?? true,
    clearColor: [0, 0, 0, 0],
    textureSourceOptions: {
      scaleMode: "linear",
      autoGenerateMipmaps: true,
    },
  });

  target.destroy();

  return texture;
}

/**
 * Creates a drop shadow texture with blur.
 */
export function createDropShadowTexture(renderer: Renderer, blur: number, resolution?: number) {
  const blurStrength = Math.max(blur, 0);
  const padding = Math.max(DROP_SHADOW_TEXTURE_PADDING, blurStrength * 3 + 12);
  const res = resolution ?? Math.max(renderer.resolution, GLOBE_TEXTURE_RESOLUTION);
  const target = new Container();
  const source = new Graphics().circle(0, 0, SCLERA_RADIUS).fill(0xffffff);

  if (blurStrength > 0.01) {
    source.filters = [
      new BlurFilter({
        strength: blurStrength,
        quality: blurStrength > 8 ? 4 : 3,
        kernelSize: blurStrength > 10 ? 9 : 7,
      }),
    ];
  }

  target.addChild(source);
  const texture = renderer.generateTexture({
    target,
    frame: new Rectangle(
      -(SCLERA_RADIUS + padding),
      -(SCLERA_RADIUS + padding),
      (SCLERA_RADIUS + padding) * 2,
      (SCLERA_RADIUS + padding) * 2,
    ),
    resolution: res,
    antialias: true,
    clearColor: [0, 0, 0, 0],
    textureSourceOptions: {
      scaleMode: "linear",
      autoGenerateMipmaps: true,
    },
  });

  target.destroy({ children: true });

  return texture;
}

/**
 * Creates all shared textures from contexts.
 */
export function createSharedTextures(
  renderer: Renderer,
  contexts: SharedContexts,
  dropShadowBlur: number,
): SharedTextures {
  const buckets: Record<TextureBucket, BucketTextures> = {
    small: generateBucketTextures(renderer, contexts, dropShadowBlur, BUCKET_THRESHOLDS.small.resolution),
    medium: generateBucketTextures(renderer, contexts, dropShadowBlur, BUCKET_THRESHOLDS.medium.resolution),
    large: generateBucketTextures(renderer, contexts, dropShadowBlur, BUCKET_THRESHOLDS.large.resolution),
  };

  return { buckets };
}

function generateBucketTextures(
  renderer: Renderer,
  contexts: SharedContexts,
  dropShadowBlur: number,
  resolution: number,
): BucketTextures {
  // Blink textures need a larger frame because blink shapes extend beyond the globe
  // blinkSize = SCLERA_RADIUS * 3 + 30 = 102, so we need at least 102px frame
  const blinkFrameSize = 110;
  // Pupil texture needs a smaller frame sized for the pupil
  const pupilFrameSize = PUPIL_RADIUS + 2;
  return {
    dropShadowTexture: createDropShadowTexture(renderer, dropShadowBlur, resolution),
    scleraFillTexture: generateTextureFromContext(renderer, contexts.scleraFillContext, { resolution }),
    scleraOutlineTexture: generateTextureFromContext(renderer, contexts.scleraOutlineContext, { resolution }),
    scleraShadowTexture: generateTextureFromContext(renderer, contexts.scleraShadowContext, { resolution }),
    roundGlobeHighlightTexture: generateTextureFromContext(renderer, contexts.roundGlobeHighlightContext, { resolution }),
    catGlobeHighlightTexture: generateTextureFromContext(renderer, contexts.catGlobeHighlightContext, { resolution }),
    // New static textures (replacing Graphics)
    irisFillTexture: generateTextureFromContext(renderer, contexts.irisContext, { resolution }),
    roundPupilTexture: generateTextureFromContextWithFrame(renderer, contexts.roundPupilContext, pupilFrameSize, { resolution }),
    roundHighlightTexture: generateTextureFromContext(renderer, contexts.highlightContext, { resolution }),
    catBlinkSideTexture: generateTextureFromContextWithFrame(renderer, contexts.catBlinkSideContext, blinkFrameSize, { resolution }),
    catBlinkBottomTexture: generateTextureFromContextWithFrame(renderer, contexts.catBlinkBottomContext, blinkFrameSize, { resolution }),
  };
}

/**
 * Destroys all shared graphics contexts.
 */
export function destroySharedContexts(contexts: SharedContexts): void {
  contexts.scleraFillContext.destroy();
  contexts.scleraMaskContext.destroy();
  contexts.scleraOutlineContext.destroy();
  contexts.scleraShadowContext.destroy();
  contexts.roundGlobeHighlightContext.destroy();
  contexts.catGlobeHighlightContext.destroy();
  contexts.irisContext.destroy();
  contexts.irisMaskContext.destroy();
  contexts.roundPupilContext.destroy();
  contexts.catPupilContext.destroy();
  contexts.highlightContext.destroy();
  contexts.catBlinkSideContext.destroy();
  contexts.catBlinkBottomContext.destroy();
}

/**
 * Destroys all shared textures.
 */
export function destroySharedTextures(textures: SharedTextures): void {
  for (const bucket of Object.values(textures.buckets)) {
    bucket.dropShadowTexture.destroy(true);
    bucket.scleraFillTexture.destroy(true);
    bucket.scleraOutlineTexture.destroy(true);
    bucket.scleraShadowTexture.destroy(true);
    bucket.roundGlobeHighlightTexture.destroy(true);
    bucket.catGlobeHighlightTexture.destroy(true);
    bucket.irisFillTexture.destroy(true);
    bucket.roundPupilTexture.destroy(true);
    bucket.roundHighlightTexture.destroy(true);
    bucket.catBlinkSideTexture.destroy(true);
    bucket.catBlinkBottomTexture.destroy(true);
  }
}

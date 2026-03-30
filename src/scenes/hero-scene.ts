import { Application, Container, Graphics, Rectangle } from "pixi.js";
import { createEyeField } from "../eye/eye-field";
import type { ClickRepulseEaseName, FocusEaseName, LayoutShapeName } from "../eye/eye-types";

interface MetricsSnapshot {
  fps: number;
  visibleCount: number;
}

interface HeroSceneOptions {
  initialCount: number;
  initialLayoutShape: LayoutShapeName;
  initialLayoutTransitionDuration: number;
  initialLayoutTransitionEase: FocusEaseName;
  initialScrollFallEnterTopFactor: number;
  initialScrollFallExitTopFactor: number;
  initialMinEyeSize: number;
  initialMaxEyeSize: number;
  initialCatMix: number;
  initialCatMorphRadius: number;
  initialRepulsionRadius: number;
  initialClickRepulseRadius: number;
  initialClickRepulseStrength: number;
  initialClickRepulseEase: ClickRepulseEaseName;
  initialStaggerSeconds: number;
  initialShadowOpacity: number;
  initialDropShadowColor: number;
  initialDropShadowOpacity: number;
  initialDropShadowBlur: number;
  initialDropShadowSpread: number;
  initialRoundInnerShadowColor: number;
  initialCatInnerShadowColor: number;
  initialIrisColor: number;
  initialCatEyeColor: number;
  initialRoundTranslateStrength: number;
  initialCatTranslateStrength: number;
  initialRoundHighlightScale: number;
  initialRoundHighlightOffsetX: number;
  initialRoundHighlightOffsetY: number;
  initialRoundHighlightRotationDegrees: number;
  initialRoundHighlightOpacity: number;
  initialCatHighlightScale: number;
  initialCatHighlightOffsetX: number;
  initialCatHighlightOffsetY: number;
  initialCatHighlightRotationDegrees: number;
  initialCatHighlightOpacity: number;
  initialCatPupilHighlightMorphScale: number;
  initialCatBlinkSideColor: number;
  initialCatBlinkSideOpacity: number;
  initialCatBlinkSideStrokeColor: number;
  initialCatBlinkSideStrokeWidth: number;
  initialCatBlinkSideStrokeOpacity: number;
  initialCatBlinkBottomColor: number;
  initialCatBlinkBottomOpacity: number;
  initialCatBlinkBottomStrokeColor: number;
  initialCatBlinkBottomStrokeWidth: number;
  initialCatBlinkBottomStrokeOpacity: number;
  initialCatBlinkMinDelay: number;
  initialCatBlinkMaxDelay: number;
  initialCatBlinkInDuration: number;
  initialCatBlinkHoldDuration: number;
  initialCatBlinkOutDuration: number;
  initialCatBlinkSideDelay: number;
  initialCatBlinkEaseIn: FocusEaseName;
  initialCatBlinkEaseOut: FocusEaseName;
  initialBackgroundColor: number;
  initialFocusScale: number;
  initialFocusUpDuration: number;
  initialFocusDownDuration: number;
  initialFocusMinDelay: number;
  initialFocusMaxDelay: number;
  initialFocusEaseUp: FocusEaseName;
  initialFocusEaseDown: FocusEaseName;
  mountNode: HTMLElement;
  onMetrics: (metrics: MetricsSnapshot) => void;
}

const drawBackdrop = (
  backdrop: Graphics,
  width: number,
  height: number,
  backgroundColor: number,
) => {
  backdrop.clear().rect(0, 0, width, height).fill({ color: backgroundColor });
};

export const createHeroScene = async ({
  initialCount,
  initialLayoutShape,
  initialLayoutTransitionDuration,
  initialLayoutTransitionEase,
  initialScrollFallEnterTopFactor,
  initialScrollFallExitTopFactor,
  initialMinEyeSize,
  initialMaxEyeSize,
  initialCatMix,
  initialCatMorphRadius,
  initialRepulsionRadius,
  initialClickRepulseRadius,
  initialClickRepulseStrength,
  initialClickRepulseEase,
  initialStaggerSeconds,
  initialShadowOpacity,
  initialDropShadowColor,
  initialDropShadowOpacity,
  initialDropShadowBlur,
  initialDropShadowSpread,
  initialRoundInnerShadowColor,
  initialCatInnerShadowColor,
  initialIrisColor,
  initialCatEyeColor,
  initialRoundTranslateStrength,
  initialCatTranslateStrength,
  initialRoundHighlightScale,
  initialRoundHighlightOffsetX,
  initialRoundHighlightOffsetY,
  initialRoundHighlightRotationDegrees,
  initialRoundHighlightOpacity,
  initialCatHighlightScale,
  initialCatHighlightOffsetX,
  initialCatHighlightOffsetY,
  initialCatHighlightRotationDegrees,
  initialCatHighlightOpacity,
  initialCatPupilHighlightMorphScale,
  initialCatBlinkSideColor,
  initialCatBlinkSideOpacity,
  initialCatBlinkSideStrokeColor,
  initialCatBlinkSideStrokeWidth,
  initialCatBlinkSideStrokeOpacity,
  initialCatBlinkBottomColor,
  initialCatBlinkBottomOpacity,
  initialCatBlinkBottomStrokeColor,
  initialCatBlinkBottomStrokeWidth,
  initialCatBlinkBottomStrokeOpacity,
  initialCatBlinkMinDelay,
  initialCatBlinkMaxDelay,
  initialCatBlinkInDuration,
  initialCatBlinkHoldDuration,
  initialCatBlinkOutDuration,
  initialCatBlinkSideDelay,
  initialCatBlinkEaseIn,
  initialCatBlinkEaseOut,
  initialBackgroundColor,
  initialFocusScale,
  initialFocusUpDuration,
  initialFocusDownDuration,
  initialFocusMinDelay,
  initialFocusMaxDelay,
  initialFocusEaseUp,
  initialFocusEaseDown,
  mountNode,
  onMetrics,
}: HeroSceneOptions) => {
  const app = new Application();

  await app.init({
    antialias: true,
    autoDensity: true,
    backgroundAlpha: 0,
    preference: "webgl",
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    resizeTo: mountNode,
    powerPreference: "high-performance",
  });

  mountNode.appendChild(app.canvas);

  const world = new Container();
  const worldBounds = new Rectangle(0, 0, mountNode.clientWidth, mountNode.clientHeight);
  const backdrop = new Graphics();
  let backgroundColor = initialBackgroundColor;
  let isScrollFallActive = false;
  let scrollFallEnterTopFactor = initialScrollFallEnterTopFactor;
  let scrollFallExitTopFactor = initialScrollFallExitTopFactor;
  const eyeField = createEyeField({ count: initialCount, renderer: app.renderer, worldBounds });
  eyeField.setConfig({
    layoutShape: initialLayoutShape,
    layoutTransitionDuration: initialLayoutTransitionDuration,
    layoutTransitionEase: initialLayoutTransitionEase,
    minEyeSize: initialMinEyeSize,
    maxEyeSize: initialMaxEyeSize,
    catMix: initialCatMix,
    catMorphRadius: initialCatMorphRadius,
    repulsionRadius: initialRepulsionRadius,
    clickRepulseRadius: initialClickRepulseRadius,
    clickRepulseStrength: initialClickRepulseStrength,
    clickRepulseEase: initialClickRepulseEase,
    staggerSeconds: initialStaggerSeconds,
    shadowOpacity: initialShadowOpacity,
    dropShadowColor: initialDropShadowColor,
    dropShadowOpacity: initialDropShadowOpacity,
    dropShadowBlur: initialDropShadowBlur,
    dropShadowSpread: initialDropShadowSpread,
    roundInnerShadowColor: initialRoundInnerShadowColor,
    catInnerShadowColor: initialCatInnerShadowColor,
    irisColor: initialIrisColor,
    catEyeColor: initialCatEyeColor,
    roundTranslateStrength: initialRoundTranslateStrength,
    catTranslateStrength: initialCatTranslateStrength,
    roundHighlightScale: initialRoundHighlightScale,
    roundHighlightOffsetX: initialRoundHighlightOffsetX,
    roundHighlightOffsetY: initialRoundHighlightOffsetY,
    roundHighlightRotationDegrees: initialRoundHighlightRotationDegrees,
    roundHighlightOpacity: initialRoundHighlightOpacity,
    catHighlightScale: initialCatHighlightScale,
    catHighlightOffsetX: initialCatHighlightOffsetX,
    catHighlightOffsetY: initialCatHighlightOffsetY,
    catHighlightRotationDegrees: initialCatHighlightRotationDegrees,
    catHighlightOpacity: initialCatHighlightOpacity,
    catPupilHighlightMorphScale: initialCatPupilHighlightMorphScale,
    catBlinkSideColor: initialCatBlinkSideColor,
    catBlinkSideOpacity: initialCatBlinkSideOpacity,
    catBlinkSideStrokeColor: initialCatBlinkSideStrokeColor,
    catBlinkSideStrokeWidth: initialCatBlinkSideStrokeWidth,
    catBlinkSideStrokeOpacity: initialCatBlinkSideStrokeOpacity,
    catBlinkBottomColor: initialCatBlinkBottomColor,
    catBlinkBottomOpacity: initialCatBlinkBottomOpacity,
    catBlinkBottomStrokeColor: initialCatBlinkBottomStrokeColor,
    catBlinkBottomStrokeWidth: initialCatBlinkBottomStrokeWidth,
    catBlinkBottomStrokeOpacity: initialCatBlinkBottomStrokeOpacity,
    catBlinkMinDelay: initialCatBlinkMinDelay,
    catBlinkMaxDelay: initialCatBlinkMaxDelay,
    catBlinkInDuration: initialCatBlinkInDuration,
    catBlinkHoldDuration: initialCatBlinkHoldDuration,
    catBlinkOutDuration: initialCatBlinkOutDuration,
    catBlinkSideDelay: initialCatBlinkSideDelay,
    catBlinkEaseIn: initialCatBlinkEaseIn,
    catBlinkEaseOut: initialCatBlinkEaseOut,
    focusScale: initialFocusScale,
    focusUpDuration: initialFocusUpDuration,
    focusDownDuration: initialFocusDownDuration,
    focusMinDelay: initialFocusMinDelay,
    focusMaxDelay: initialFocusMaxDelay,
    focusEaseUp: initialFocusEaseUp,
    focusEaseDown: initialFocusEaseDown,
  });
  let pointerX = worldBounds.width * 0.5;
  let pointerY = worldBounds.height * 0.5;
  let metricsElapsedMs = 0;
  let smoothedFps = 60;

  world.addChild(backdrop, eyeField.root);
  app.stage.addChild(world);

  const resize = () => {
    worldBounds.width = mountNode.clientWidth;
    worldBounds.height = mountNode.clientHeight;
    drawBackdrop(backdrop, worldBounds.width, worldBounds.height, backgroundColor);
    eyeField.layout(worldBounds.width, worldBounds.height);
  };

  const updatePointerFromEvent = (event: PointerEvent) => {
    const rect = app.canvas.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
  };

  const handlePointerMove = (event: PointerEvent) => {
    updatePointerFromEvent(event);
    eyeField.setPointer(pointerX, pointerY, true);
  };

  const handlePointerEnter = (event: PointerEvent) => {
    updatePointerFromEvent(event);
    eyeField.setPointer(pointerX, pointerY, true);
  };

  const handlePointerDown = (event: PointerEvent) => {
    updatePointerFromEvent(event);
    eyeField.pointerDown(pointerX, pointerY);
  };

  const handlePointerLeave = () => {
    eyeField.setPointer(pointerX, pointerY, false);
  };

  app.canvas.addEventListener("pointerenter", handlePointerEnter);
  app.canvas.addEventListener("pointermove", handlePointerMove);
  app.canvas.addEventListener("pointerdown", handlePointerDown);
  app.canvas.addEventListener("pointerleave", handlePointerLeave);

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const enterTop = -window.innerHeight * scrollFallEnterTopFactor;
      const exitTop = -window.innerHeight * scrollFallExitTopFactor;
      const top = entry.boundingClientRect.top;

      if (!isScrollFallActive && top <= exitTop) {
        isScrollFallActive = true;
        eyeField.setScrollFall(true);
      } else if (isScrollFallActive && entry.isIntersecting && top >= enterTop) {
        isScrollFallActive = false;
        eyeField.setScrollFall(false);
      }
    },
    {
      threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.7, 0.85, 1],
    },
  );

  resizeObserver.observe(mountNode);
  intersectionObserver.observe(mountNode);
  resize();

  const handleTick = ({ elapsedMS, FPS }: { elapsedMS: number; FPS: number }) => {
    const metrics = eyeField.update(elapsedMS / 1000);
    const smoothing = 1 - Math.exp(-elapsedMS / 280);
    smoothedFps += (FPS - smoothedFps) * smoothing;
    metricsElapsedMs += elapsedMS;

    if (metricsElapsedMs >= 200) {
      onMetrics({ fps: smoothedFps, visibleCount: metrics.visibleCount });
      metricsElapsedMs = 0;
    }
  };

  app.ticker.add(handleTick);

  return {
    setCount: (nextCount: number) => {
      eyeField.syncCount(nextCount);
      eyeField.layout(worldBounds.width, worldBounds.height);
    },
    setConfig: (config: {
      scrollFallEnterTopFactor?: number;
      scrollFallExitTopFactor?: number;
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
      backgroundColor?: number;
      focusScale?: number;
      focusUpDuration?: number;
      focusDownDuration?: number;
      focusMinDelay?: number;
      focusMaxDelay?: number;
      focusEaseUp?: FocusEaseName;
      focusEaseDown?: FocusEaseName;
    }) => {
      const nextEnterTopFactor =
        typeof config.scrollFallEnterTopFactor === "number"
          ? Math.max(config.scrollFallEnterTopFactor, 0)
          : scrollFallEnterTopFactor;
      const nextExitTopFactor =
        typeof config.scrollFallExitTopFactor === "number"
          ? Math.max(config.scrollFallExitTopFactor, 0)
          : scrollFallExitTopFactor;
      scrollFallEnterTopFactor = Math.min(nextEnterTopFactor, nextExitTopFactor);
      scrollFallExitTopFactor = Math.max(nextEnterTopFactor, nextExitTopFactor);

      if (typeof config.backgroundColor === "number") {
        backgroundColor = config.backgroundColor;
        drawBackdrop(backdrop, worldBounds.width, worldBounds.height, backgroundColor);
      }

      eyeField.setConfig(config);
      if (typeof config.minEyeSize === "number" || typeof config.maxEyeSize === "number") {
        eyeField.layout(worldBounds.width, worldBounds.height);
      }
    },
    destroy: () => {
      app.canvas.removeEventListener("pointerenter", handlePointerEnter);
      app.canvas.removeEventListener("pointermove", handlePointerMove);
      app.canvas.removeEventListener("pointerdown", handlePointerDown);
      app.canvas.removeEventListener("pointerleave", handlePointerLeave);
      app.ticker.remove(handleTick);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      eyeField.destroy();
      app.destroy(true, { children: true });
    },
  };
};

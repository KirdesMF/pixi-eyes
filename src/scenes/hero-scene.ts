import { Application, Container, Graphics, Rectangle } from "pixi.js";
import { createEyeField } from "../eye/eye-field";
import type { FocusEaseName, LayoutShapeName } from "../eye/eye-types";

interface MetricsSnapshot {
  fps: number;
  visibleCount: number;
}

interface HeroSceneOptions {
  initialCount: number;
  initialLayoutShape: LayoutShapeName;
  initialLayoutTransitionDuration: number;
  initialLayoutTransitionEase: FocusEaseName;
  initialLayoutJitter: number;
  initialScrollFallEnterTopFactor: number;
  initialScrollFallExitTopFactor: number;
  initialMinEyeSize: number;
  initialMaxEyeSize: number;
  initialRepulsionRadius: number;
  initialRepulsionPushSpeed: number;
  initialRepulsionReturnSpeed: number;
  initialStaggerSeconds: number;
  initialShadowOpacity: number;
  initialDropShadowColor: number;
  initialDropShadowOpacity: number;
  initialDropShadowBlur: number;
  initialDropShadowSpread: number;
  initialRoundInnerShadowColor: number;
  initialIrisColor: number;
  initialEyeShapeColor: number;
  initialRoundTranslateStrength: number;
  initialRoundHighlightScale: number;
  initialRoundHighlightOffsetX: number;
  initialRoundHighlightOffsetY: number;
  initialRoundHighlightRotationDegrees: number;
  initialRoundHighlightOpacity: number;
  initialRoundHighlightColor: number;
  initialBackgroundColor: number;
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
  initialLayoutJitter,
  initialScrollFallEnterTopFactor,
  initialScrollFallExitTopFactor,
  initialMinEyeSize,
  initialMaxEyeSize,
  initialRepulsionRadius,
  initialRepulsionPushSpeed,
  initialRepulsionReturnSpeed,
  initialStaggerSeconds,
  initialShadowOpacity,
  initialDropShadowColor,
  initialDropShadowOpacity,
  initialDropShadowBlur,
  initialDropShadowSpread,
  initialRoundInnerShadowColor,
  initialIrisColor,
  initialEyeShapeColor,
  initialRoundTranslateStrength,
  initialRoundHighlightScale,
  initialRoundHighlightOffsetX,
  initialRoundHighlightOffsetY,
  initialRoundHighlightRotationDegrees,
  initialRoundHighlightOpacity,
  initialRoundHighlightColor,
  initialBackgroundColor,
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
    layoutJitter: initialLayoutJitter,
    minEyeSize: initialMinEyeSize,
    maxEyeSize: initialMaxEyeSize,
    repulsionRadius: initialRepulsionRadius,
    repulsionPushSpeed: initialRepulsionPushSpeed,
    repulsionReturnSpeed: initialRepulsionReturnSpeed,
    staggerSeconds: initialStaggerSeconds,
    shadowOpacity: initialShadowOpacity,
    dropShadowColor: initialDropShadowColor,
    dropShadowOpacity: initialDropShadowOpacity,
    dropShadowBlur: initialDropShadowBlur,
    dropShadowSpread: initialDropShadowSpread,
    roundInnerShadowColor: initialRoundInnerShadowColor,
    irisColor: initialIrisColor,
    eyeShapeColor: initialEyeShapeColor,
    roundTranslateStrength: initialRoundTranslateStrength,
    roundHighlightScale: initialRoundHighlightScale,
    roundHighlightOffsetX: initialRoundHighlightOffsetX,
    roundHighlightOffsetY: initialRoundHighlightOffsetY,
    roundHighlightRotationDegrees: initialRoundHighlightRotationDegrees,
    roundHighlightOpacity: initialRoundHighlightOpacity,
    roundHighlightColor: initialRoundHighlightColor,
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
      eyeShapeColor?: number;
      roundTranslateStrength?: number;
      roundHighlightScale?: number;
      roundHighlightOffsetX?: number;
      roundHighlightOffsetY?: number;
      roundHighlightRotationDegrees?: number;
      roundHighlightOpacity?: number;
      roundHighlightColor?: number;
      backgroundColor?: number;
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

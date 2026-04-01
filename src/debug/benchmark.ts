import type { Application } from "pixi.js";
import { downloadJson } from "./capture";

type FrameSample = {
  fps: number;
  frameTime: number;
  drawCalls: number;
};

type BenchmarkResult = {
  fpsAvg: number;
  fpsP5: number;
  fpsP95: number;
  frameTimeAvg: number;
  frameTimeMax: number;
  drawCallsAvg: number;
  samples: FrameSample[];
  durationMs: number;
  timestamp: string;
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function estimateDrawCalls(renderer: unknown): number {
  const pixiRenderer = renderer as {
    renderPipes?: { batch?: { flushCount?: number } };
  };
  return pixiRenderer.renderPipes?.batch?.flushCount ?? 0;
}

export function runBenchmark(
  app: Application,
  durationMs: number = 5000,
): Promise<BenchmarkResult> {
  return new Promise((resolve) => {
    const samples: FrameSample[] = [];
    let lastTime = performance.now();
    let elapsedMs = 0;

    const tick = () => {
      const now = performance.now();
      const frameTime = now - lastTime;
      lastTime = now;
      elapsedMs += frameTime;

      const fps = frameTime > 0 ? 1000 / frameTime : 0;
      const drawCalls = estimateDrawCalls(app.renderer);

      samples.push({ fps, frameTime, drawCalls });

      if (elapsedMs >= durationMs) {
        app.ticker.remove(tick);

        const fpsValues = samples.map((s) => s.fps).sort((a, b) => a - b);
        const frameTimeValues = samples.map((s) => s.frameTime).sort((a, b) => a - b);
        const drawCallValues = samples.map((s) => s.drawCalls);

        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

        const result: BenchmarkResult = {
          fpsAvg: Math.round(avg(fpsValues) * 10) / 10,
          fpsP5: Math.round(percentile(fpsValues, 5) * 10) / 10,
          fpsP95: Math.round(percentile(fpsValues, 95) * 10) / 10,
          frameTimeAvg: Math.round(avg(frameTimeValues) * 100) / 100,
          frameTimeMax: Math.round(frameTimeValues[frameTimeValues.length - 1] * 100) / 100,
          drawCallsAvg: Math.round(avg(drawCallValues) * 10) / 10,
          samples: samples.slice(0, 100),
          durationMs,
          timestamp: new Date().toISOString(),
        };

        downloadJson(result, `perf-${navigator.userAgent.includes("Chrome") ? "chrome" : "safari"}.json`);
        resolve(result);
      }
    };

    app.ticker.add(tick);
  });
}

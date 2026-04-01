// Batch break and draw call logger for performance analysis

import type { Application, Container } from "pixi.js";

export type BatchStats = {
  drawCalls: number;
  batchBreaks: number;
  textureSwitches: number;
  timestamp: number;
  spriteCount: number;
  meshCount: number;
  graphicsCount: number;
};

export class BatchLogger {
  private root: Container;
  private stats: BatchStats[] = [];
  private isLogging = false;
  private logIntervalMs: number;
  private lastLogTime = 0;

  constructor(app: Application, logIntervalMs: number = 1000) {
    this.root = app.stage;
    this.logIntervalMs = logIntervalMs;
  }

  start(): void {
    this.isLogging = true;
    this.stats = [];
    this.lastLogTime = performance.now();
    
    // Remove any existing overlay
    const existing = document.getElementById("batch-logger-overlay");
    if (existing) existing.remove();
  }

  stop(): void {
    this.isLogging = false;
    
    // Remove overlay on stop
    const existing = document.getElementById("batch-logger-overlay");
    if (existing) existing.remove();
  }

  update(): void {
    if (!this.isLogging) return;

    const now = performance.now();
    if (now - this.lastLogTime >= this.logIntervalMs) {
      this.captureStats();
      this.printReport(); // Live update overlay
      this.lastLogTime = now;
    }
  }

  private captureStats(): void {
    let totalChildren = 0;
    let spriteCount = 0;
    let meshCount = 0;
    let graphicsCount = 0;
    
    function countChildren(container: any): void {
      if (!container) return;
      if (container.visible !== false) {
        totalChildren++;
        
        // Count by type
        if (container.texture) spriteCount++;
        if (container.geometry) meshCount++;
        if (container.context) graphicsCount++;
        
        if (container.children) {
          container.children.forEach((child: any) => countChildren(child));
        }
      }
    }
    
    countChildren(this.root);
    
    // Estimate: sprites/meshes batch well (~4-8 per batch), graphics less so
    const estimatedDrawCalls = Math.ceil(spriteCount / 4) + 
                               Math.ceil(meshCount / 4) + 
                               graphicsCount;
    
    this.stats.push({
      drawCalls: Math.max(1, estimatedDrawCalls),
      batchBreaks: Math.max(0, estimatedDrawCalls - 1),
      textureSwitches: Math.max(1, estimatedDrawCalls),
      timestamp: Date.now(),
      spriteCount,
      meshCount,
      graphicsCount,
    });

    // Keep only last 60 samples
    if (this.stats.length > 60) {
      this.stats.shift();
    }
  }

  getStats(): BatchStats[] {
    return [...this.stats];
  }

  getAverage(): { avgDrawCalls: number; avgBatchBreaks: number } | null {
    if (this.stats.length === 0) return null;

    const sum = this.stats.reduce(
      (acc, stat) => ({
        avgDrawCalls: acc.avgDrawCalls + stat.drawCalls,
        avgBatchBreaks: acc.avgBatchBreaks + stat.batchBreaks,
      }),
      { avgDrawCalls: 0, avgBatchBreaks: 0 }
    );

    return {
      avgDrawCalls: sum.avgDrawCalls / this.stats.length,
      avgBatchBreaks: sum.avgBatchBreaks / this.stats.length,
    };
  }

  reset(): void {
    this.stats = [];
    this.lastLogTime = performance.now();
  }

  printReport(): void {
    const avg = this.getAverage();
    if (!avg) {
      console.log("[BatchLogger] No stats available");
      return;
    }

    const last = this.stats[this.stats.length - 1];
    const nomaskMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("nomask") === "1";
    const modePrefix = nomaskMode ? "[NOMASK] " : "";
    const report = `${modePrefix}DC:${avg.avgDrawCalls.toFixed(0)} | Sprites:${last?.spriteCount ?? 0} | Mesh:${last?.meshCount ?? 0} | Gfx:${last?.graphicsCount ?? 0}`;
    console.log(report);
    
    // Also display in a persistent overlay
    let overlay = document.getElementById("batch-logger-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "batch-logger-overlay";
      overlay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.85);
        color: #0f0;
        font-family: monospace;
        font-size: 12px;
        padding: 10px 14px;
        border-radius: 6px;
        z-index: 99999;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);
    }
    overlay.textContent = report + (nomaskMode ? " | NO MASKS" : "");
  }
}

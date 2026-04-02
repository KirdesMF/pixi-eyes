// @env browser

import { createSidebar } from "./pixi-eyes/debug/create-sidebar";
import {
  createDefaultSettings,
  loadSettings,
  readStoredSettings,
  writeStoredSettings,
} from "./pixi-eyes/debug/debug-state";
import { createHeroScene } from "./pixi-eyes/scenes/hero-scene";
import { CONTROL_DEFINITIONS } from "./pixi-eyes/controls";

const appNode = document.querySelector<HTMLDivElement>("#app");
if (!appNode) throw new Error("Missing #app mount node");

const defaultSettings = createDefaultSettings(CONTROL_DEFINITIONS);
const storedSettings = readStoredSettings();
const settingsState = loadSettings(defaultSettings, storedSettings);

function getRequiredInput<T extends Element>(id: string): T {
  const el = document.querySelector<T>(`#${id}`);
  if (!el) throw new Error(`Missing element: ${id}`);
  return el;
}

function updateStoredSettings(patch: Record<string, number | string>): void {
  writeStoredSettings({ ...settingsState, ...patch });
}

function hexToNumber(value: string): number {
  return Number.parseInt(value.slice(1), 16);
}

function getSceneConfig() {
  const s = settingsState;
  const toNum = (v: unknown) => (typeof v === "number" ? v : 0);
  const toHex = (v: unknown) => (typeof v === "string" ? hexToNumber(v) : 0);

  return {
    initialCount: toNum(s["instance-count"]),
    initialLayoutShape: String(s["layout-shape"]) as "circle" | "ring" | "heart" | "cross" | "star",
    initialRingInnerRatio: toNum(s["ring-inner-ratio"]),
    initialCrossType: String(s["cross-type"]) as "x" | "plus",
    initialStarBranches: toNum(s["star-branches"]),
    initialSlitEyeMix: toNum(s["slit-eye-mix"]),
    initialSlitPupilWidth: toNum(s["slit-pupil-width"]),
    initialSlitPupilHeight: toNum(s["slit-pupil-height"]),
    initialLayoutTransitionDuration: toNum(s["layout-transition-duration"]),
    initialLayoutTransitionEase: String(s["layout-transition-ease"]) as
      | "linear"
      | "out-cubic"
      | "out-sine"
      | "in-out-sine",
    initialLayoutJitter: toNum(s["layout-jitter"]),
    initialMinEyeSize: toNum(s["min-eye-size"]),
    initialMaxEyeSize: toNum(s["max-eye-size"]),
    initialRepulsionRadius: toNum(s["repulsion-radius"]),
    initialRepulsionPushSpeed: toNum(s["repulsion-push-speed"]),
    initialRepulsionReturnSpeed: toNum(s["repulsion-return-speed"]),
    initialStaggerSeconds: toNum(s["stagger-seconds"]),
    initialShadowOpacity: toNum(s["shadow-opacity"]),
    initialRoundInnerShadowColor: toHex(s["round-inner-shadow-color"]),
    initialDropShadowColor: toHex(s["drop-shadow-color"]),
    initialDropShadowOpacity: toNum(s["drop-shadow-opacity"]),
    initialDropShadowBlur: toNum(s["drop-shadow-blur"]),
    initialDropShadowSpread: toNum(s["drop-shadow-spread"]),
    initialIrisColor: toHex(s["iris-color"]),
    initialMouseIrisColor: toHex(s["mouse-iris-color"]),
    initialMouseIrisRadius: toNum(s["mouse-iris-radius"]),
    initialMouseIrisBlend: toNum(s["mouse-iris-blend"]),
    initialMouseIrisDecay: toNum(s["mouse-iris-decay"]),
    initialEyeShapeColor: toHex(s["eye-shape-color"]),
    initialRoundTranslateStrength: toNum(s["round-translate-strength"]),
    initialRoundHighlightScale: toNum(s["round-highlight-scale"]),
    initialRoundHighlightOffsetX: toNum(s["round-highlight-offset-x"]),
    initialRoundHighlightOffsetY: toNum(s["round-highlight-offset-y"]),
    initialRoundHighlightRotationDegrees: toNum(s["round-highlight-rotation"]),
    initialRoundHighlightOpacity: toNum(s["round-highlight-opacity"]),
    initialRoundHighlightColor: toHex(s["round-highlight-color"]),
    initialDotEyeMix: toNum(s["dot-eye-mix"]),
    initialDotPupilRatio: toNum(s["dot-pupil-ratio"]),
    initialDotGlobeColor: toHex(s["dot-globe-color"]),
    initialDotMouseColor: toHex(s["dot-mouse-color"]),
    initialBackgroundColor: toHex(s["background-color"]),
  };
}

appNode.innerHTML = `
  <main class="min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
    <section class="mx-auto max-w-375">
      <div class="overflow-hidden rounded-2xl border border-white/20 bg-black p-3">
        <div id="pixi-stage" class="h-[52svh] min-h-27.5 overflow-hidden rounded-2xl border border-white/20 bg-white sm:h-[62svh] lg:h-[calc(100svh-3.75rem)] lg:min-h-47"></div>
      </div>
    </section>
    <div aria-hidden="true" class="h-[140svh]"></div>
  </main>
`;

const mountNode = getRequiredInput<HTMLDivElement>("pixi-stage");
const sceneConfig = getSceneConfig();

const scene = await createHeroScene({
  ...sceneConfig,
  mountNode,
  onMetrics: ({ fps, visibleCount }) => {
    const fpsEl = document.getElementById("pixi-eyes-fps");
    const visibleEl = document.getElementById("pixi-eyes-visible");
    if (fpsEl) fpsEl.textContent = fps.toFixed(0);
    if (visibleEl) visibleEl.textContent = String(visibleCount);
  },
});

writeStoredSettings(settingsState);

// Only show sidebar in development mode
const isDev = import.meta.env.DEV ?? true;
const sidebar = isDev ? createSidebar(scene, updateStoredSettings, settingsState) : null;

window.addEventListener("beforeunload", () => {
  scene.destroy();
  sidebar?.destroy();
});

import { createControlBindings, renderAllSections } from "./debug/create-controls";
import {
  createDefaultSettings,
  loadSettings,
  readStoredSettings,
  writeStoredSettings,
} from "./debug/debug-state";
import { createHeroScene } from "./scenes/hero-scene";
import { CONTROL_DEFINITIONS } from "./controls";

const ACTION_BUTTON_CLASS =
  "inline-flex h-[36px] items-center justify-center rounded-xl border border-black bg-black px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/85";

// Get mount nodes
const appNode = document.querySelector<HTMLDivElement>("#app");
if (!appNode) throw new Error("Missing #app mount node");

document.body.className = "bg-black text-white antialiased";

// Load settings
const defaultSettings = createDefaultSettings(CONTROL_DEFINITIONS);
const storedSettings = readStoredSettings();
let settingsState = loadSettings(defaultSettings, storedSettings);

// Render UI
const sectionsHtml = renderAllSections(settingsState);

appNode.innerHTML = `
  <main class="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#171717_0%,#000000_100%)] px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
    <section class="mx-auto grid max-w-375 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside class="relative overflow-hidden rounded-2xl border border-white/20 bg-white p-4 text-black shadow-[0_34px_120px_rgba(0,0,0,0.42)] sm:p-5 lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)]">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.08),transparent_70%)]"></div>
        <div class="relative flex h-full flex-col">
          <div class="mb-4 flex items-start justify-between border-b border-black/10 pb-4">
            <div>
              <p class="text-[10px] uppercase tracking-[0.42em] text-black/35">Pixi Eyes</p>
              <h1 class="mt-2 text-[28px] font-medium tracking-[-0.08em] text-black">Settings</h1>
            </div>
            <span class="rounded-full bg-black px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-white">Live</span>
          </div>
          <dl class="mb-4 grid grid-cols-2 gap-3">
            <div class="rounded-[20px] border border-black/10 bg-black px-3 py-3 text-white">
              <dt class="text-[10px] uppercase tracking-[0.28em] text-white/45">FPS</dt>
              <dd id="fps-value" class="mt-2 text-3xl font-medium tracking-[-0.08em] text-white">0</dd>
            </div>
            <div class="rounded-[20px] border border-black/10 bg-black/6 px-3 py-3">
              <dt class="text-[10px] uppercase tracking-[0.28em] text-black/45">Visible</dt>
              <dd id="visible-value" class="mt-2 text-3xl font-medium tracking-[-0.08em] text-black">0</dd>
            </div>
          </dl>
          <div class="mb-4 grid gap-2">
            <div class="grid grid-cols-2 gap-3">
              <button id="copy-json-button" class="${ACTION_BUTTON_CLASS}" type="button">Copy JSON</button>
              <button id="download-json-button" class="${ACTION_BUTTON_CLASS}" type="button">Download</button>
            </div>
            <p id="json-status" class="px-1 text-[10px] uppercase tracking-[0.24em] text-black/45">Export current settings</p>
          </div>
          <div class="grid flex-1 content-start gap-4 overflow-y-auto pr-1">${sectionsHtml}</div>
        </div>
      </aside>
      <section class="overflow-hidden rounded-2xl border border-white/20 bg-black p-3 shadow-[0_34px_120px_rgba(0,0,0,0.42)]">
        <div id="pixi-stage" class="h-[52svh] min-h-110] overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:h-[62svh] lg:h-[calc(100svh-3.75rem)] lg:min-h-190"></div>
      </section>
    </section>
    <div aria-hidden="true" class="h-[140svh]"></div>
  </main>
`;

// Get DOM references
const getRequiredInput = <T extends Element>(id: string): T => {
  const el = document.querySelector<T>(`#${id}`);
  if (!el) throw new Error(`Missing element: ${id}`);
  return el;
};

const fpsValue = getRequiredInput<HTMLElement>("fps-value");
const visibleValue = getRequiredInput<HTMLElement>("visible-value");
const copyJsonButton = getRequiredInput<HTMLButtonElement>("copy-json-button");
const downloadJsonButton = getRequiredInput<HTMLButtonElement>("download-json-button");
const jsonStatus = getRequiredInput<HTMLElement>("json-status");
const mountNode = getRequiredInput<HTMLDivElement>("pixi-stage");

// Settings helpers
function updateStoredSettings(patch: Record<string, number | string>): void {
  settingsState = { ...settingsState, ...patch };
  writeStoredSettings(settingsState);
}

function serializeSettings(): string {
  return JSON.stringify(settingsState, null, 2);
}

function setJsonStatus(message: string): void {
  jsonStatus.textContent = message;
}

async function copySettingsJson(): Promise<void> {
  await navigator.clipboard.writeText(serializeSettings());
  setJsonStatus("Copied JSON");
}

function downloadSettingsJson(): void {
  const blob = new Blob([serializeSettings()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pixi-eyes-settings.json";
  a.click();
  URL.revokeObjectURL(url);
  setJsonStatus("Downloaded JSON");
}

// Convert settings to scene config
function hexToNumber(value: string): number {
  return Number.parseInt(value.slice(1), 16);
}

function getSceneConfig() {
  const s = settingsState;
  const toNum = (v: unknown) => (typeof v === "number" ? v : 0);
  const toHex = (v: unknown) => (typeof v === "string" ? hexToNumber(v) : 0);

  return {
    initialCount: toNum(s["instance-count"]),
    initialLayoutShape: String(s["layout-shape"]) as "circle" | "square" | "triangle",
    initialLayoutTransitionDuration: toNum(s["layout-transition-duration"]),
    initialLayoutTransitionEase: String(s["layout-transition-ease"]) as
      | "linear"
      | "out-cubic"
      | "out-sine"
      | "in-out-sine",
    initialScrollFallEnterTopFactor: toNum(s["scroll-fall-enter-top-factor"]),
    initialScrollFallExitTopFactor: toNum(s["scroll-fall-exit-top-factor"]),
    initialMinEyeSize: toNum(s["min-eye-size"]),
    initialMaxEyeSize: toNum(s["max-eye-size"]),
    initialCatMix: toNum(s["cat-mix"]),
    initialCatMorphRadius: toNum(s["cat-morph-radius"]),
    initialRepulsionRadius: toNum(s["repulsion-radius"]),
    initialClickRepulseRadius: toNum(s["click-repulse-radius"]),
    initialClickRepulseStrength: toNum(s["click-repulse-strength"]),
    initialClickRepulseEase: String(s["click-repulse-ease"]) as
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
      | "out-elastic",
    initialStaggerSeconds: toNum(s["stagger-seconds"]),
    initialShadowOpacity: toNum(s["shadow-opacity"]),
    initialRoundInnerShadowColor: toHex(s["round-inner-shadow-color"]),
    initialCatInnerShadowColor: toHex(s["cat-inner-shadow-color"]),
    initialDropShadowColor: toHex(s["drop-shadow-color"]),
    initialDropShadowOpacity: toNum(s["drop-shadow-opacity"]),
    initialDropShadowBlur: toNum(s["drop-shadow-blur"]),
    initialDropShadowSpread: toNum(s["drop-shadow-spread"]),
    initialIrisColor: toHex(s["iris-color"]),
    initialCatEyeColor: toHex(s["cat-eye-color"]),
    initialRoundTranslateStrength: toNum(s["round-translate-strength"]),
    initialCatTranslateStrength: toNum(s["cat-translate-strength"]),
    initialRoundHighlightScale: toNum(s["round-highlight-scale"]),
    initialRoundHighlightOffsetX: toNum(s["round-highlight-offset-x"]),
    initialRoundHighlightOffsetY: toNum(s["round-highlight-offset-y"]),
    initialRoundHighlightRotationDegrees: toNum(s["round-highlight-rotation"]),
    initialRoundHighlightOpacity: toNum(s["round-highlight-opacity"]),
    initialCatHighlightScale: toNum(s["cat-highlight-scale"]),
    initialCatHighlightOffsetX: toNum(s["cat-highlight-offset-x"]),
    initialCatHighlightOffsetY: toNum(s["cat-highlight-offset-y"]),
    initialCatHighlightRotationDegrees: toNum(s["cat-highlight-rotation"]),
    initialCatHighlightOpacity: toNum(s["cat-highlight-opacity"]),
    initialCatPupilHighlightMorphScale: toNum(s["cat-pupil-highlight-morph-scale"]),
    initialCatBlinkSideColor: toHex(s["cat-blink-side-color"]),
    initialCatBlinkSideOpacity: toNum(s["cat-blink-side-opacity"]),
    initialCatBlinkSideStrokeColor: toHex(s["cat-blink-side-stroke-color"]),
    initialCatBlinkSideStrokeWidth: toNum(s["cat-blink-side-stroke-width"]),
    initialCatBlinkSideStrokeOpacity: toNum(s["cat-blink-side-stroke-opacity"]),
    initialCatBlinkBottomColor: toHex(s["cat-blink-bottom-color"]),
    initialCatBlinkBottomOpacity: toNum(s["cat-blink-bottom-opacity"]),
    initialCatBlinkBottomStrokeColor: toHex(s["cat-blink-bottom-stroke-color"]),
    initialCatBlinkBottomStrokeWidth: toNum(s["cat-blink-bottom-stroke-width"]),
    initialCatBlinkBottomStrokeOpacity: toNum(s["cat-blink-bottom-stroke-opacity"]),
    initialCatBlinkMinDelay: toNum(s["cat-blink-min-delay"]),
    initialCatBlinkMaxDelay: toNum(s["cat-blink-max-delay"]),
    initialCatBlinkInDuration: toNum(s["cat-blink-in-duration"]),
    initialCatBlinkHoldDuration: toNum(s["cat-blink-hold-duration"]),
    initialCatBlinkOutDuration: toNum(s["cat-blink-out-duration"]),
    initialCatBlinkSideDelay: toNum(s["cat-blink-side-delay"]),
    initialCatBlinkEaseIn: String(s["cat-blink-ease-in"]) as
      | "linear"
      | "out-cubic"
      | "out-sine"
      | "in-out-sine",
    initialCatBlinkEaseOut: String(s["cat-blink-ease-out"]) as
      | "linear"
      | "out-cubic"
      | "out-sine"
      | "in-out-sine",
    initialBackgroundColor: toHex(s["background-color"]),
    initialFocusScale: toNum(s["focus-scale"]),
    initialFocusUpDuration: toNum(s["focus-up-duration"]),
    initialFocusDownDuration: toNum(s["focus-down-duration"]),
    initialFocusMinDelay: toNum(s["focus-min-delay"]),
    initialFocusMaxDelay: toNum(s["focus-max-delay"]),
    initialFocusEaseUp: String(s["focus-ease-up"]) as
      | "linear"
      | "out-cubic"
      | "out-sine"
      | "in-out-sine",
    initialFocusEaseDown: String(s["focus-ease-down"]) as
      | "linear"
      | "out-cubic"
      | "out-sine"
      | "in-out-sine",
  };
}

// Initialize scene
const sceneConfig = getSceneConfig();
const scene = await createHeroScene({
  ...sceneConfig,
  mountNode,
  onMetrics: ({ fps, visibleCount }) => {
    fpsValue.textContent = fps.toFixed(0);
    visibleValue.textContent = String(visibleCount);
  },
});

// Persist initial settings
writeStoredSettings(settingsState);

// Setup JSON export buttons
copyJsonButton.addEventListener("click", () => copySettingsJson);
downloadJsonButton.addEventListener("click", downloadSettingsJson);

// Setup control bindings
const controlBindings = createControlBindings(scene, updateStoredSettings);

// Cleanup on unload
window.addEventListener("beforeunload", () => {
  scene.destroy();
  controlBindings.destroy();
});

import { createControlBindings } from "./debug/create-controls";
import {
  createDefaultSettings,
  loadSettings,
  readStoredSettings,
  writeStoredSettings,
} from "./debug/debug-state";
import { createHeroScene } from "./scenes/hero-scene";
import { CONTROL_DEFINITIONS, SECTIONS } from "./controls";

const ACTION_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center rounded-xl border border-black bg-black px-3 text-xs font-semibold uppercase text-white transition hover:bg-black/85";

// Get mount nodes
const appNode = document.querySelector<HTMLDivElement>("#app");
if (!appNode) throw new Error("Missing #app mount node");

// Load settings
const defaultSettings = createDefaultSettings(CONTROL_DEFINITIONS);
const storedSettings = readStoredSettings();
let settingsState = loadSettings(defaultSettings, storedSettings);

// Render control HTML with inline Tailwind classes
function getNumberDisplayValue(
  value: number | string,
  step: number | undefined,
  def: number | string,
): string {
  if (typeof value !== "number" || typeof step !== "number") {
    return String(def);
  }
  if (!Number.isFinite(value)) {
    return String(def);
  }
  if (step < 1) {
    return value.toFixed(2);
  }
  return String(value);
}

function renderControl(
  control: (typeof CONTROL_DEFINITIONS)[number],
  value: number | string,
): string {
  const { id, label, type, min, max, step, default: def, options } = control;

  if (type === "number") {
    const displayValue = getNumberDisplayValue(value, step, def);
    return `
      <label class="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 rounded-2xl border border-black/10 bg-black/5 px-3 py-2 transition hover:border-black/20">
        <span class="text-xs font-semibold uppercase tracking-tight text-black/55">${label}</span>
        <input id="${id}" class="h-8 w-full rounded-lg border border-black/15 bg-white px-2.5 py-1 text-right text-sm text-black outline-none transition focus:border-black" type="number" min="${min}" max="${max}" step="${step}" value="${displayValue}" />
      </label>
    `;
  }

  if (type === "color") {
    return `
      <label class="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 rounded-2xl border border-black/10 bg-black/5 px-3 py-2 transition hover:border-black/20">
        <span class="text-xs font-semibold uppercase tracking-tight text-black/55">${label}</span>
        <input id="${id}" class="h-8 w-full cursor-pointer rounded-lg border border-black/15 bg-white p-1 outline-none transition focus:border-black" type="color" value="${value || def}" />
      </label>
    `;
  }

  if (type === "select" && options) {
    const opts = options
      .map(
        (o) =>
          `<option value="${o.value}"${o.value === value ? " selected" : ""}>${o.label}</option>`,
      )
      .join("");
    return `
      <label class="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 rounded-2xl border border-black/10 bg-black/5 px-3 py-2 transition hover:border-black/20">
        <span class="text-xs font-semibold uppercase tracking-tight text-black/55">${label}</span>
        <select id="${id}" class="h-8 w-full rounded-lg border border-black/15 bg-white px-2.5 py-1 text-sm text-black outline-none transition focus:border-black">${opts}</select>
      </label>
    `;
  }

  return "";
}

function renderSection(section: string, stored: Record<string, number | string>): string {
  const controls = CONTROL_DEFINITIONS.filter((c) => c.section === section);
  const html = controls.map((c) => renderControl(c, stored[c.id] ?? c.default)).join("");
  return `<div class="grid gap-2"><p class="px-1 text-xs font-medium uppercase tracking-wider text-black/40">${section}</p>${html}</div>`;
}

function renderAllSections(stored: Record<string, number | string>): string {
  return SECTIONS.map((section) => renderSection(section, stored)).join("");
}

// Render UI
const sectionsHtml = renderAllSections(settingsState);

appNode.innerHTML = `
  <main class="min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
    <section class="mx-auto grid max-w-375 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside class="relative overflow-hidden rounded-2xl border border-white/20 bg-white p-4 text-black sm:p-5 lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)]">
        <div class="relative flex h-full flex-col">
          <div class="mb-4 flex items-start justify-between border-b border-black/10 pb-4">
            <div>
              <p class="text-xs uppercase tracking-widest text-black/35">Pixi Eyes</p>
              <h1 class="mt-2 text-3xl font-medium tracking-tight text-black">Settings</h1>
            </div>
            <span class="rounded-full bg-black px-2.5 py-1 text-xs uppercase tracking-tight text-white">Live</span>
          </div>
          <dl class="mb-4 grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-black/10 bg-black px-3 py-3 text-white">
              <dt class="text-xs uppercase tracking-tight text-white/45">FPS</dt>
              <dd id="fps-value" class="mt-2 text-3xl font-medium text-white">0</dd>
            </div>
            <div class="rounded-2xl border border-black/10 bg-black/5 px-3 py-3">
              <dt class="text-xs uppercase tracking-tight text-black/45">Visible</dt>
              <dd id="visible-value" class="mt-2 text-3xl font-medium text-black">0</dd>
            </div>
          </dl>
          <div class="mb-4 grid gap-2">
            <div class="grid grid-cols-2 gap-3">
              <button id="copy-json-button" class="${ACTION_BUTTON_CLASS}" type="button">Copy JSON</button>
              <button id="download-json-button" class="${ACTION_BUTTON_CLASS}" type="button">Download</button>
            </div>
            <p id="json-status" class="px-1 text-xs uppercase text-black/45">Export current settings</p>
          </div>
          <div class="grid flex-1 content-start gap-4 overflow-y-auto pr-1">${sectionsHtml}</div>
        </div>
      </aside>
      <section class="overflow-hidden rounded-2xl border border-white/20 bg-black p-3">
        <div id="pixi-stage" class="h-[52svh] min-h-27.5 overflow-hidden rounded-2xl border border-white/20 bg-white sm:h-[62svh] lg:h-[calc(100svh-3.75rem)] lg:min-h-47"></div>
      </section>
    </section>
    <div aria-hidden="true" class="h-[140svh]"></div>
  </main>
`;

// Get DOM references
function getRequiredInput<T extends Element>(id: string): T {
  const el = document.querySelector<T>(`#${id}`);
  if (!el) throw new Error(`Missing element: ${id}`);
  return el;
}

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
    initialLayoutJitter: toNum(s["layout-jitter"]),
    initialScrollFallEnterTopFactor: toNum(s["scroll-fall-enter-top-factor"]),
    initialScrollFallExitTopFactor: toNum(s["scroll-fall-exit-top-factor"]),
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
    initialEyeShapeColor: toHex(s["eye-shape-color"]),
    initialRoundTranslateStrength: toNum(s["round-translate-strength"]),
    initialRoundHighlightScale: toNum(s["round-highlight-scale"]),
    initialRoundHighlightOffsetX: toNum(s["round-highlight-offset-x"]),
    initialRoundHighlightOffsetY: toNum(s["round-highlight-offset-y"]),
    initialRoundHighlightRotationDegrees: toNum(s["round-highlight-rotation"]),
    initialRoundHighlightOpacity: toNum(s["round-highlight-opacity"]),
    initialRoundHighlightColor: toHex(s["round-highlight-color"]),
    initialBackgroundColor: toHex(s["background-color"]),
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

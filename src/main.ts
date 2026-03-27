import "./style.css";
import type { ClickRepulseEaseName, FocusEaseName } from "./entities/eye-field";
import { createHeroScene } from "./scenes/hero-scene";

const appNode = document.querySelector<HTMLDivElement>("#app");
const STORAGE_KEY = "pixi-eyes-settings";
const CONTROL_ROW_CLASS =
  "grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 rounded-[20px] border border-black/10 bg-black/[0.03] px-3 py-2 transition hover:border-black/20";
const LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[0.28em] text-black/55";
const NUMBER_INPUT_CLASS =
  "h-[34px] w-full rounded-lg border border-black/15 bg-white px-2.5 py-1 text-right text-sm text-black outline-none transition focus:border-black";
const COLOR_INPUT_CLASS =
  "h-[34px] w-full cursor-pointer rounded-lg border border-black/15 bg-white p-1 outline-none transition focus:border-black";
const SELECT_INPUT_CLASS =
  "h-[34px] w-full rounded-lg border border-black/15 bg-white px-2.5 py-1 text-sm text-black outline-none transition focus:border-black";
const ACTION_BUTTON_CLASS =
  "inline-flex h-[36px] items-center justify-center rounded-xl border border-black bg-black px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/85";
const SECTION_LABEL_CLASS =
  "px-1 text-[10px] font-medium uppercase tracking-[0.34em] text-black/40";
const EASE_OPTIONS: Array<{ label: string; value: FocusEaseName }> = [
  { label: "Out Cubic", value: "out-cubic" },
  { label: "Out Sine", value: "out-sine" },
  { label: "In Out Sine", value: "in-out-sine" },
  { label: "Linear", value: "linear" },
];
const CLICK_REPULSE_EASE_OPTIONS: Array<{ label: string; value: ClickRepulseEaseName }> = [
  { label: "Smoothstep", value: "smoothstep" },
  { label: "Linear", value: "linear" },
  { label: "In Sine", value: "in-sine" },
  { label: "Out Sine", value: "out-sine" },
  { label: "In Out Sine", value: "in-out-sine" },
  { label: "In Quad", value: "in-quad" },
  { label: "Out Quad", value: "out-quad" },
  { label: "In Out Quad", value: "in-out-quad" },
  { label: "In Cubic", value: "in-cubic" },
  { label: "Out Cubic", value: "out-cubic" },
  { label: "In Out Cubic", value: "in-out-cubic" },
  { label: "In Back", value: "in-back" },
  { label: "Out Back", value: "out-back" },
  { label: "In Out Back", value: "in-out-back" },
  { label: "Out Elastic", value: "out-elastic" },
];

interface StoredSettings {
  count: number;
  minEyeSize: number;
  maxEyeSize: number;
  catMix: number;
  catMorphRadius: number;
  repulsionRadius: number;
  clickRepulseRadius: number;
  clickRepulseStrength: number;
  clickRepulseEase: ClickRepulseEaseName;
  staggerSeconds: number;
  shadowOpacity: number;
  dropShadowColor: string;
  dropShadowOpacity: number;
  dropShadowBlur: number;
  dropShadowSpread: number;
  roundInnerShadowColor: string;
  catInnerShadowColor: string;
  irisColor: string;
  catEyeColor: string;
  roundTranslateStrength: number;
  catTranslateStrength: number;
  roundHighlightScale: number;
  roundHighlightOffsetX: number;
  roundHighlightOffsetY: number;
  roundHighlightRotationDegrees: number;
  roundHighlightOpacity: number;
  catHighlightScale: number;
  catHighlightOffsetX: number;
  catHighlightOffsetY: number;
  catHighlightRotationDegrees: number;
  catHighlightOpacity: number;
  catPupilHighlightMorphScale: number;
  catBlinkSideColor: string;
  catBlinkSideOpacity: number;
  catBlinkSideStrokeColor: string;
  catBlinkSideStrokeWidth: number;
  catBlinkSideStrokeOpacity: number;
  catBlinkBottomColor: string;
  catBlinkBottomOpacity: number;
  catBlinkBottomStrokeColor: string;
  catBlinkBottomStrokeWidth: number;
  catBlinkBottomStrokeOpacity: number;
  catBlinkMinDelay: number;
  catBlinkMaxDelay: number;
  catBlinkInDuration: number;
  catBlinkHoldDuration: number;
  catBlinkOutDuration: number;
  catBlinkSideDelay: number;
  catBlinkEaseIn: FocusEaseName;
  catBlinkEaseOut: FocusEaseName;
  backgroundColor: string;
  focusScale: number;
  focusUpDuration: number;
  focusDownDuration: number;
  focusMinDelay: number;
  focusMaxDelay: number;
  focusEaseUp: FocusEaseName;
  focusEaseDown: FocusEaseName;
}

const DEFAULT_SETTINGS: StoredSettings = {
  count: 400,
  minEyeSize: 10,
  maxEyeSize: 90,
  catMix: 0.35,
  catMorphRadius: 120,
  repulsionRadius: 90,
  clickRepulseRadius: 400,
  clickRepulseStrength: 40,
  clickRepulseEase: "out-elastic",
  staggerSeconds: 0.002,
  shadowOpacity: 0.4,
  roundInnerShadowColor: "#a8abad",
  catInnerShadowColor: "#3d8a0a",
  dropShadowColor: "#4a4545",
  dropShadowOpacity: 0.4,
  dropShadowBlur: 1.2,
  dropShadowSpread: 0.7,
  irisColor: "#ab53ee",
  catEyeColor: "#66e01a",
  roundTranslateStrength: 0.9,
  catTranslateStrength: 0.75,
  roundHighlightScale: 0.45,
  roundHighlightOffsetX: 10,
  roundHighlightOffsetY: -12.5,
  roundHighlightRotationDegrees: 41.25,
  roundHighlightOpacity: 0.7,
  catHighlightScale: 0.47,
  catHighlightOffsetX: 0.37,
  catHighlightOffsetY: -0.62,
  catHighlightRotationDegrees: 34,
  catHighlightOpacity: 0.7,
  catPupilHighlightMorphScale: 4,
  catBlinkSideColor: "#000000",
  catBlinkSideOpacity: 1,
  catBlinkSideStrokeColor: "#66dc1a",
  catBlinkSideStrokeWidth: 4,
  catBlinkSideStrokeOpacity: 0.6,
  catBlinkBottomColor: "#111113",
  catBlinkBottomOpacity: 0.66,
  catBlinkBottomStrokeColor: "#66dc1a",
  catBlinkBottomStrokeWidth: 2,
  catBlinkBottomStrokeOpacity: 0.26,
  catBlinkMinDelay: 5,
  catBlinkMaxDelay: 8,
  catBlinkInDuration: 0.25,
  catBlinkHoldDuration: 0.06,
  catBlinkOutDuration: 0.25,
  catBlinkSideDelay: 0.1,
  catBlinkEaseIn: "out-cubic",
  catBlinkEaseOut: "in-out-sine",
  backgroundColor: "#ffffff",
  focusScale: 1.35,
  focusUpDuration: 0.24,
  focusDownDuration: 0.38,
  focusMinDelay: 1.4,
  focusMaxDelay: 3.8,
  focusEaseUp: "out-cubic",
  focusEaseDown: "in-out-sine",
};

const numberControl = (
  id: string,
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
) => `
  <label class="${CONTROL_ROW_CLASS}">
    <span class="${LABEL_CLASS}">${label}</span>
    <input
      id="${id}"
      class="${NUMBER_INPUT_CLASS}"
      type="number"
      min="${min}"
      max="${max}"
      step="${step}"
      value="${value}"
    />
  </label>
`;

const colorControl = (id: string, label: string, value: string) => `
  <label class="${CONTROL_ROW_CLASS}">
    <span class="${LABEL_CLASS}">${label}</span>
    <input id="${id}" class="${COLOR_INPUT_CLASS}" type="color" value="${value}" />
  </label>
`;

const selectControl = (
  id: string,
  label: string,
  value: string,
  options: Array<{ label: string; value: string }>,
) => `
  <label class="${CONTROL_ROW_CLASS}">
    <span class="${LABEL_CLASS}">${label}</span>
    <select id="${id}" class="${SELECT_INPUT_CLASS}">
      ${options
        .map(
          (option) =>
            `<option value="${option.value}"${option.value === value ? " selected" : ""}>${option.label}</option>`,
        )
        .join("")}
    </select>
  </label>
`;

if (!appNode) {
  throw new Error("Missing #app mount node");
}

document.body.className = "bg-black text-white antialiased";

appNode.innerHTML = `
  <main class="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#171717_0%,#000000_100%)] px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
    <section class="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside class="relative overflow-hidden rounded-[32px] border border-white/20 bg-white p-4 text-black shadow-[0_34px_120px_rgba(0,0,0,0.42)] sm:p-5 lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)]">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.08),transparent_70%)]"></div>
        <div class="relative flex h-full flex-col">
          <div class="mb-4 flex items-start justify-between border-b border-black/10 pb-4">
            <div>
              <p class="text-[10px] uppercase tracking-[0.42em] text-black/35">Pixi Eyes</p>
              <h1 class="mt-2 text-[28px] font-medium tracking-[-0.08em] text-black">Settings</h1>
            </div>
            <span class="rounded-full bg-black px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-white">
              Live
            </span>
          </div>
          <dl class="mb-4 grid grid-cols-2 gap-3">
            <div class="rounded-[20px] border border-black/10 bg-black px-3 py-3 text-white">
              <dt class="text-[10px] uppercase tracking-[0.28em] text-white/45">FPS</dt>
              <dd id="fps-value" class="mt-2 text-3xl font-medium tracking-[-0.08em] text-white">0</dd>
            </div>
            <div class="rounded-[20px] border border-black/10 bg-black/[0.06] px-3 py-3">
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
          <div class="grid flex-1 content-start gap-4 overflow-y-auto pr-1">
          <div class="grid gap-2">
            <p class="${SECTION_LABEL_CLASS}">Field</p>
            ${numberControl("instance-count", "Instances", DEFAULT_SETTINGS.count, 24, 800, 8)}
            ${numberControl("min-eye-size", "Min Eye", DEFAULT_SETTINGS.minEyeSize, 10, 90, 1)}
            ${numberControl("max-eye-size", "Max Eye", DEFAULT_SETTINGS.maxEyeSize, 20, 140, 1)}
            ${numberControl("cat-mix", "Cat Mix", DEFAULT_SETTINGS.catMix, 0, 1, 0.01)}
            ${numberControl("repulsion-radius", "Repulsion", DEFAULT_SETTINGS.repulsionRadius, 0, 220, 1)}
            ${numberControl(
              "click-repulse-radius",
              "Click Radius",
              DEFAULT_SETTINGS.clickRepulseRadius,
              0,
              420,
              1,
            )}
            ${numberControl(
              "click-repulse-strength",
              "Click Strength",
              DEFAULT_SETTINGS.clickRepulseStrength,
              0,
              220,
              1,
            )}
            ${selectControl(
              "click-repulse-ease",
              "Click Ease",
              DEFAULT_SETTINGS.clickRepulseEase,
              CLICK_REPULSE_EASE_OPTIONS,
            )}
            ${numberControl("stagger-seconds", "Stagger", DEFAULT_SETTINGS.staggerSeconds, 0, 0.1, 0.001)}
          </div>
          <div class="grid gap-2">
            <p class="${SECTION_LABEL_CLASS}">Appearance</p>
            ${numberControl("shadow-opacity", "Inner Shadow", DEFAULT_SETTINGS.shadowOpacity, 0, 1, 0.01)}
            ${colorControl(
              "round-inner-shadow-color",
              "Round Shadow",
              DEFAULT_SETTINGS.roundInnerShadowColor,
            )}
            ${colorControl("cat-inner-shadow-color", "Cat Shadow", DEFAULT_SETTINGS.catInnerShadowColor)}
            ${colorControl("drop-shadow-color", "Drop Color", DEFAULT_SETTINGS.dropShadowColor)}
            ${numberControl(
              "drop-shadow-opacity",
              "Drop Opacity",
              DEFAULT_SETTINGS.dropShadowOpacity,
              0,
              1,
              0.01,
            )}
            ${numberControl("drop-shadow-blur", "Drop Blur", DEFAULT_SETTINGS.dropShadowBlur, 0, 20, 0.1)}
            ${numberControl(
              "drop-shadow-spread",
              "Drop Spread",
              DEFAULT_SETTINGS.dropShadowSpread,
              0,
              10,
              0.1,
            )}
            ${colorControl("iris-color", "Round Iris", DEFAULT_SETTINGS.irisColor)}
            ${colorControl("cat-eye-color", "Cat Eye", DEFAULT_SETTINGS.catEyeColor)}
            ${colorControl("background-color", "Canvas BG", DEFAULT_SETTINGS.backgroundColor)}
          </div>
          <div class="grid gap-2">
            <p class="${SECTION_LABEL_CLASS}">Motion</p>
            ${numberControl(
              "round-translate-strength",
              "Round Move",
              DEFAULT_SETTINGS.roundTranslateStrength,
              0,
              1,
              0.01,
            )}
            ${numberControl(
              "cat-translate-strength",
              "Cat Move",
              DEFAULT_SETTINGS.catTranslateStrength,
              0,
              1,
              0.01,
            )}
            ${numberControl("cat-morph-radius", "Cat Morph", DEFAULT_SETTINGS.catMorphRadius, 0, 260, 1)}
          </div>
          <div class="grid gap-2">
            <p class="${SECTION_LABEL_CLASS}">Round Light</p>
            ${numberControl("round-highlight-scale", "Scale", DEFAULT_SETTINGS.roundHighlightScale, 0, 2, 0.01)}
            ${numberControl(
              "round-highlight-offset-x",
              "Offset X",
              DEFAULT_SETTINGS.roundHighlightOffsetX,
              -100,
              100,
              0.5,
            )}
            ${numberControl(
              "round-highlight-offset-y",
              "Offset Y",
              DEFAULT_SETTINGS.roundHighlightOffsetY,
              -100,
              100,
              0.5,
            )}
            ${numberControl(
              "round-highlight-rotation",
              "Rotation",
              DEFAULT_SETTINGS.roundHighlightRotationDegrees,
              -180,
              180,
              1,
            )}
            ${numberControl("round-highlight-opacity", "Opacity", DEFAULT_SETTINGS.roundHighlightOpacity, 0, 1, 0.01)}
          </div>
          <div class="grid gap-2">
            <p class="${SECTION_LABEL_CLASS}">Cat Light</p>
            ${numberControl("cat-highlight-scale", "Scale", DEFAULT_SETTINGS.catHighlightScale, 0, 2, 0.01)}
            ${numberControl("cat-highlight-offset-x", "Offset X", DEFAULT_SETTINGS.catHighlightOffsetX, -1, 1, 0.01)}
            ${numberControl("cat-highlight-offset-y", "Offset Y", DEFAULT_SETTINGS.catHighlightOffsetY, -1, 1, 0.01)}
            ${numberControl(
              "cat-highlight-rotation",
              "Rotation",
              DEFAULT_SETTINGS.catHighlightRotationDegrees,
              -180,
              180,
              1,
            )}
            ${numberControl("cat-highlight-opacity", "Opacity", DEFAULT_SETTINGS.catHighlightOpacity, 0, 1, 0.01)}
            ${numberControl(
              "cat-pupil-highlight-morph-scale",
              "Dot Morph",
              DEFAULT_SETTINGS.catPupilHighlightMorphScale,
              1,
              8,
              0.01,
            )}
          </div>
          <div class="grid gap-2">
            <p class="${SECTION_LABEL_CLASS}">Cat Blink</p>
            ${colorControl("cat-blink-side-color", "Side Fill", DEFAULT_SETTINGS.catBlinkSideColor)}
            ${numberControl("cat-blink-side-opacity", "Side Opacity", DEFAULT_SETTINGS.catBlinkSideOpacity, 0, 1, 0.01)}
            ${colorControl(
              "cat-blink-side-stroke-color",
              "Side Stroke",
              DEFAULT_SETTINGS.catBlinkSideStrokeColor,
            )}
            ${numberControl(
              "cat-blink-side-stroke-width",
              "Side Stroke W",
              DEFAULT_SETTINGS.catBlinkSideStrokeWidth,
              0,
              8,
              0.1,
            )}
            ${numberControl(
              "cat-blink-side-stroke-opacity",
              "Side Stroke O",
              DEFAULT_SETTINGS.catBlinkSideStrokeOpacity,
              0,
              1,
              0.01,
            )}
            ${colorControl("cat-blink-bottom-color", "Full Fill", DEFAULT_SETTINGS.catBlinkBottomColor)}
            ${numberControl(
              "cat-blink-bottom-opacity",
              "Full Opacity",
              DEFAULT_SETTINGS.catBlinkBottomOpacity,
              0,
              1,
              0.01,
            )}
            ${colorControl(
              "cat-blink-bottom-stroke-color",
              "Full Stroke",
              DEFAULT_SETTINGS.catBlinkBottomStrokeColor,
            )}
            ${numberControl(
              "cat-blink-bottom-stroke-width",
              "Full Stroke W",
              DEFAULT_SETTINGS.catBlinkBottomStrokeWidth,
              0,
              8,
              0.1,
            )}
            ${numberControl(
              "cat-blink-bottom-stroke-opacity",
              "Full Stroke O",
              DEFAULT_SETTINGS.catBlinkBottomStrokeOpacity,
              0,
              1,
              0.01,
            )}
            ${numberControl("cat-blink-in-duration", "In", DEFAULT_SETTINGS.catBlinkInDuration, 0.01, 2, 0.01)}
            ${numberControl("cat-blink-hold-duration", "Hold", DEFAULT_SETTINGS.catBlinkHoldDuration, 0, 2, 0.01)}
            ${numberControl("cat-blink-out-duration", "Out", DEFAULT_SETTINGS.catBlinkOutDuration, 0.01, 2, 0.01)}
            ${numberControl("cat-blink-side-delay", "Side Delay", DEFAULT_SETTINGS.catBlinkSideDelay, 0, 1, 0.01)}
            ${numberControl("cat-blink-min-delay", "Delay Min", DEFAULT_SETTINGS.catBlinkMinDelay, 0, 8, 0.1)}
            ${numberControl("cat-blink-max-delay", "Delay Max", DEFAULT_SETTINGS.catBlinkMaxDelay, 0, 8, 0.1)}
            ${selectControl("cat-blink-ease-in", "Ease In", DEFAULT_SETTINGS.catBlinkEaseIn, EASE_OPTIONS)}
            ${selectControl("cat-blink-ease-out", "Ease Out", DEFAULT_SETTINGS.catBlinkEaseOut, EASE_OPTIONS)}
          </div>
          <div class="grid gap-2">
            <p class="${SECTION_LABEL_CLASS}">Focus</p>
            ${numberControl("focus-scale", "Scale", DEFAULT_SETTINGS.focusScale, 1, 2, 0.01)}
            ${numberControl("focus-up-duration", "Up", DEFAULT_SETTINGS.focusUpDuration, 0.01, 2, 0.01)}
            ${numberControl("focus-down-duration", "Down", DEFAULT_SETTINGS.focusDownDuration, 0.01, 2, 0.01)}
            ${numberControl("focus-min-delay", "Delay Min", DEFAULT_SETTINGS.focusMinDelay, 0, 8, 0.1)}
            ${numberControl("focus-max-delay", "Delay Max", DEFAULT_SETTINGS.focusMaxDelay, 0, 8, 0.1)}
            ${selectControl("focus-ease-up", "Ease Up", DEFAULT_SETTINGS.focusEaseUp, EASE_OPTIONS)}
            ${selectControl("focus-ease-down", "Ease Down", DEFAULT_SETTINGS.focusEaseDown, EASE_OPTIONS)}
          </div>
          </div>
        </div>
      </aside>
      <section class="overflow-hidden rounded-[32px] border border-white/20 bg-black p-3 shadow-[0_34px_120px_rgba(0,0,0,0.42)]">
        <div
          id="pixi-stage"
          class="h-[52svh] min-h-[440px] overflow-hidden rounded-[24px] border border-white/20 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:h-[62svh] lg:h-[calc(100svh-3.75rem)] lg:min-h-[760px]"
        ></div>
      </section>
    </section>
    <div aria-hidden="true" class="h-[140svh]"></div>
  </main>
`;

const countInput = document.querySelector<HTMLInputElement>("#instance-count");
const minEyeSizeInput = document.querySelector<HTMLInputElement>("#min-eye-size");
const maxEyeSizeInput = document.querySelector<HTMLInputElement>("#max-eye-size");
const catMixInput = document.querySelector<HTMLInputElement>("#cat-mix");
const catMorphRadiusInput = document.querySelector<HTMLInputElement>("#cat-morph-radius");
const repulsionRadiusInput = document.querySelector<HTMLInputElement>("#repulsion-radius");
const clickRepulseRadiusInput = document.querySelector<HTMLInputElement>("#click-repulse-radius");
const clickRepulseStrengthInput =
  document.querySelector<HTMLInputElement>("#click-repulse-strength");
const clickRepulseEaseInput = document.querySelector<HTMLSelectElement>("#click-repulse-ease");
const staggerSecondsInput = document.querySelector<HTMLInputElement>("#stagger-seconds");
const shadowOpacityInput = document.querySelector<HTMLInputElement>("#shadow-opacity");
const roundInnerShadowColorInput = document.querySelector<HTMLInputElement>(
  "#round-inner-shadow-color",
);
const catInnerShadowColorInput =
  document.querySelector<HTMLInputElement>("#cat-inner-shadow-color");
const dropShadowColorInput = document.querySelector<HTMLInputElement>("#drop-shadow-color");
const dropShadowOpacityInput = document.querySelector<HTMLInputElement>("#drop-shadow-opacity");
const dropShadowBlurInput = document.querySelector<HTMLInputElement>("#drop-shadow-blur");
const dropShadowSpreadInput = document.querySelector<HTMLInputElement>("#drop-shadow-spread");
const irisColorInput = document.querySelector<HTMLInputElement>("#iris-color");
const catEyeColorInput = document.querySelector<HTMLInputElement>("#cat-eye-color");
const roundTranslateStrengthInput = document.querySelector<HTMLInputElement>(
  "#round-translate-strength",
);
const catTranslateStrengthInput =
  document.querySelector<HTMLInputElement>("#cat-translate-strength");
const roundHighlightScaleInput = document.querySelector<HTMLInputElement>("#round-highlight-scale");
const roundHighlightOffsetXInput = document.querySelector<HTMLInputElement>(
  "#round-highlight-offset-x",
);
const roundHighlightOffsetYInput = document.querySelector<HTMLInputElement>(
  "#round-highlight-offset-y",
);
const roundHighlightRotationInput = document.querySelector<HTMLInputElement>(
  "#round-highlight-rotation",
);
const roundHighlightOpacityInput = document.querySelector<HTMLInputElement>(
  "#round-highlight-opacity",
);
const catHighlightScaleInput = document.querySelector<HTMLInputElement>("#cat-highlight-scale");
const catHighlightOffsetXInput =
  document.querySelector<HTMLInputElement>("#cat-highlight-offset-x");
const catHighlightOffsetYInput =
  document.querySelector<HTMLInputElement>("#cat-highlight-offset-y");
const catHighlightRotationInput =
  document.querySelector<HTMLInputElement>("#cat-highlight-rotation");
const catHighlightOpacityInput = document.querySelector<HTMLInputElement>("#cat-highlight-opacity");
const catPupilHighlightMorphScaleInput = document.querySelector<HTMLInputElement>(
  "#cat-pupil-highlight-morph-scale",
);
const catBlinkSideColorInput = document.querySelector<HTMLInputElement>("#cat-blink-side-color");
const catBlinkSideOpacityInput =
  document.querySelector<HTMLInputElement>("#cat-blink-side-opacity");
const catBlinkSideStrokeColorInput = document.querySelector<HTMLInputElement>(
  "#cat-blink-side-stroke-color",
);
const catBlinkSideStrokeWidthInput = document.querySelector<HTMLInputElement>(
  "#cat-blink-side-stroke-width",
);
const catBlinkSideStrokeOpacityInput = document.querySelector<HTMLInputElement>(
  "#cat-blink-side-stroke-opacity",
);
const catBlinkBottomColorInput =
  document.querySelector<HTMLInputElement>("#cat-blink-bottom-color");
const catBlinkBottomOpacityInput = document.querySelector<HTMLInputElement>(
  "#cat-blink-bottom-opacity",
);
const catBlinkBottomStrokeColorInput = document.querySelector<HTMLInputElement>(
  "#cat-blink-bottom-stroke-color",
);
const catBlinkBottomStrokeWidthInput = document.querySelector<HTMLInputElement>(
  "#cat-blink-bottom-stroke-width",
);
const catBlinkBottomStrokeOpacityInput = document.querySelector<HTMLInputElement>(
  "#cat-blink-bottom-stroke-opacity",
);
const catBlinkInDurationInput = document.querySelector<HTMLInputElement>("#cat-blink-in-duration");
const catBlinkHoldDurationInput = document.querySelector<HTMLInputElement>(
  "#cat-blink-hold-duration",
);
const catBlinkOutDurationInput =
  document.querySelector<HTMLInputElement>("#cat-blink-out-duration");
const catBlinkSideDelayInput = document.querySelector<HTMLInputElement>("#cat-blink-side-delay");
const catBlinkMinDelayInput = document.querySelector<HTMLInputElement>("#cat-blink-min-delay");
const catBlinkMaxDelayInput = document.querySelector<HTMLInputElement>("#cat-blink-max-delay");
const catBlinkEaseInInput = document.querySelector<HTMLSelectElement>("#cat-blink-ease-in");
const catBlinkEaseOutInput = document.querySelector<HTMLSelectElement>("#cat-blink-ease-out");
const backgroundColorInput = document.querySelector<HTMLInputElement>("#background-color");
const focusScaleInput = document.querySelector<HTMLInputElement>("#focus-scale");
const focusUpDurationInput = document.querySelector<HTMLInputElement>("#focus-up-duration");
const focusDownDurationInput = document.querySelector<HTMLInputElement>("#focus-down-duration");
const focusMinDelayInput = document.querySelector<HTMLInputElement>("#focus-min-delay");
const focusMaxDelayInput = document.querySelector<HTMLInputElement>("#focus-max-delay");
const focusEaseUpInput = document.querySelector<HTMLSelectElement>("#focus-ease-up");
const focusEaseDownInput = document.querySelector<HTMLSelectElement>("#focus-ease-down");
const fpsValue = document.querySelector<HTMLElement>("#fps-value");
const visibleValue = document.querySelector<HTMLElement>("#visible-value");
const copyJsonButton = document.querySelector<HTMLButtonElement>("#copy-json-button");
const downloadJsonButton = document.querySelector<HTMLButtonElement>("#download-json-button");
const jsonStatus = document.querySelector<HTMLElement>("#json-status");
const mountNode = document.querySelector<HTMLDivElement>("#pixi-stage");

if (
  !countInput ||
  !minEyeSizeInput ||
  !maxEyeSizeInput ||
  !catMixInput ||
  !catMorphRadiusInput ||
  !repulsionRadiusInput ||
  !clickRepulseRadiusInput ||
  !clickRepulseStrengthInput ||
  !clickRepulseEaseInput ||
  !staggerSecondsInput ||
  !shadowOpacityInput ||
  !roundInnerShadowColorInput ||
  !catInnerShadowColorInput ||
  !dropShadowColorInput ||
  !dropShadowOpacityInput ||
  !dropShadowBlurInput ||
  !dropShadowSpreadInput ||
  !irisColorInput ||
  !catEyeColorInput ||
  !roundTranslateStrengthInput ||
  !catTranslateStrengthInput ||
  !roundHighlightScaleInput ||
  !roundHighlightOffsetXInput ||
  !roundHighlightOffsetYInput ||
  !roundHighlightRotationInput ||
  !roundHighlightOpacityInput ||
  !catHighlightScaleInput ||
  !catHighlightOffsetXInput ||
  !catHighlightOffsetYInput ||
  !catHighlightRotationInput ||
  !catHighlightOpacityInput ||
  !catPupilHighlightMorphScaleInput ||
  !catBlinkSideColorInput ||
  !catBlinkSideOpacityInput ||
  !catBlinkSideStrokeColorInput ||
  !catBlinkSideStrokeWidthInput ||
  !catBlinkSideStrokeOpacityInput ||
  !catBlinkBottomColorInput ||
  !catBlinkBottomOpacityInput ||
  !catBlinkBottomStrokeColorInput ||
  !catBlinkBottomStrokeWidthInput ||
  !catBlinkBottomStrokeOpacityInput ||
  !catBlinkInDurationInput ||
  !catBlinkHoldDurationInput ||
  !catBlinkOutDurationInput ||
  !catBlinkSideDelayInput ||
  !catBlinkMinDelayInput ||
  !catBlinkMaxDelayInput ||
  !catBlinkEaseInInput ||
  !catBlinkEaseOutInput ||
  !backgroundColorInput ||
  !focusScaleInput ||
  !focusUpDurationInput ||
  !focusDownDurationInput ||
  !focusMinDelayInput ||
  !focusMaxDelayInput ||
  !focusEaseUpInput ||
  !focusEaseDownInput ||
  !fpsValue ||
  !visibleValue ||
  !copyJsonButton ||
  !downloadJsonButton ||
  !jsonStatus ||
  !mountNode
) {
  throw new Error("Missing prototype controls");
}

const readStoredSettings = (): Partial<StoredSettings> => {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as Partial<StoredSettings>;
  } catch {
    return {};
  }
};

const writeStoredSettings = (settings: StoredSettings) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures and keep the controls functional.
  }
};

const applyStoredNumber = (
  input: HTMLInputElement,
  value: number | undefined,
  fractionDigits?: number,
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return;
  }

  input.value = typeof fractionDigits === "number" ? value.toFixed(fractionDigits) : String(value);
};

const sanitizeHexColor = (value: string | undefined, fallback: string) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/iu.test(value) ? value : fallback;

const hexToNumber = (value: string) => Number.parseInt(value.slice(1), 16);

const sanitizeFocusEase = (value: string | undefined, fallback: FocusEaseName): FocusEaseName =>
  EASE_OPTIONS.some((option) => option.value === value) ? (value as FocusEaseName) : fallback;
const sanitizeClickRepulseEase = (
  value: string | undefined,
  fallback: ClickRepulseEaseName,
): ClickRepulseEaseName =>
  CLICK_REPULSE_EASE_OPTIONS.some((option) => option.value === value)
    ? (value as ClickRepulseEaseName)
    : fallback;

const clampInput = (
  input: HTMLInputElement,
  minValue: number,
  maxValue: number,
  fractionDigits?: number,
) => {
  const rawValue = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : minValue;
  const nextValue = Math.min(Math.max(rawValue, minValue), maxValue);
  input.value =
    typeof fractionDigits === "number" ? nextValue.toFixed(fractionDigits) : String(nextValue);
  return nextValue;
};

const bindNumberInput = (
  input: HTMLInputElement,
  options: {
    min: number;
    max: number;
    fractionDigits?: number;
    apply: (value: number) => void;
  },
) => {
  const commit = () => {
    const nextValue = clampInput(input, options.min, options.max, options.fractionDigits);
    options.apply(nextValue);
  };

  input.addEventListener("change", commit);
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      commit();
    }
  });
};

const bindColorInput = (input: HTMLInputElement, apply: (value: string) => void) => {
  const commit = () => {
    const nextValue = sanitizeHexColor(input.value, DEFAULT_SETTINGS.backgroundColor);
    input.value = nextValue;
    apply(nextValue);
  };

  input.addEventListener("input", commit);
  input.addEventListener("change", commit);
};

const bindSelectInput = <T extends string>(
  input: HTMLSelectElement,
  sanitize: (value: string | undefined) => T,
  apply: (value: T) => void,
) => {
  input.addEventListener("change", () => {
    const nextValue = sanitize(input.value);
    input.value = nextValue;
    apply(nextValue);
  });
};

const storedSettings = readStoredSettings();
applyStoredNumber(countInput, storedSettings.count);
applyStoredNumber(minEyeSizeInput, storedSettings.minEyeSize);
applyStoredNumber(maxEyeSizeInput, storedSettings.maxEyeSize);
applyStoredNumber(catMixInput, storedSettings.catMix, 2);
applyStoredNumber(catMorphRadiusInput, storedSettings.catMorphRadius);
applyStoredNumber(repulsionRadiusInput, storedSettings.repulsionRadius);
applyStoredNumber(clickRepulseRadiusInput, storedSettings.clickRepulseRadius);
applyStoredNumber(clickRepulseStrengthInput, storedSettings.clickRepulseStrength);
clickRepulseEaseInput.value = sanitizeClickRepulseEase(
  storedSettings.clickRepulseEase,
  DEFAULT_SETTINGS.clickRepulseEase,
);
applyStoredNumber(staggerSecondsInput, storedSettings.staggerSeconds, 3);
applyStoredNumber(shadowOpacityInput, storedSettings.shadowOpacity, 2);
roundInnerShadowColorInput.value = sanitizeHexColor(
  storedSettings.roundInnerShadowColor,
  DEFAULT_SETTINGS.roundInnerShadowColor,
);
catInnerShadowColorInput.value = sanitizeHexColor(
  storedSettings.catInnerShadowColor,
  DEFAULT_SETTINGS.catInnerShadowColor,
);
dropShadowColorInput.value = sanitizeHexColor(
  storedSettings.dropShadowColor,
  DEFAULT_SETTINGS.dropShadowColor,
);
applyStoredNumber(dropShadowOpacityInput, storedSettings.dropShadowOpacity, 2);
applyStoredNumber(dropShadowBlurInput, storedSettings.dropShadowBlur, 1);
applyStoredNumber(dropShadowSpreadInput, storedSettings.dropShadowSpread, 1);
applyStoredNumber(focusScaleInput, storedSettings.focusScale, 2);
applyStoredNumber(focusUpDurationInput, storedSettings.focusUpDuration, 2);
applyStoredNumber(focusDownDurationInput, storedSettings.focusDownDuration, 2);
applyStoredNumber(focusMinDelayInput, storedSettings.focusMinDelay, 1);
applyStoredNumber(focusMaxDelayInput, storedSettings.focusMaxDelay, 1);
applyStoredNumber(roundTranslateStrengthInput, storedSettings.roundTranslateStrength, 2);
applyStoredNumber(catTranslateStrengthInput, storedSettings.catTranslateStrength, 2);
applyStoredNumber(roundHighlightScaleInput, storedSettings.roundHighlightScale, 2);
applyStoredNumber(roundHighlightOffsetXInput, storedSettings.roundHighlightOffsetX, 1);
applyStoredNumber(roundHighlightOffsetYInput, storedSettings.roundHighlightOffsetY, 1);
applyStoredNumber(roundHighlightRotationInput, storedSettings.roundHighlightRotationDegrees, 2);
applyStoredNumber(roundHighlightOpacityInput, storedSettings.roundHighlightOpacity, 2);
applyStoredNumber(catHighlightScaleInput, storedSettings.catHighlightScale, 2);
applyStoredNumber(catHighlightOffsetXInput, storedSettings.catHighlightOffsetX, 2);
applyStoredNumber(catHighlightOffsetYInput, storedSettings.catHighlightOffsetY, 2);
applyStoredNumber(catHighlightRotationInput, storedSettings.catHighlightRotationDegrees, 2);
applyStoredNumber(catHighlightOpacityInput, storedSettings.catHighlightOpacity, 2);
applyStoredNumber(catPupilHighlightMorphScaleInput, storedSettings.catPupilHighlightMorphScale, 2);
catBlinkSideColorInput.value = sanitizeHexColor(
  storedSettings.catBlinkSideColor,
  DEFAULT_SETTINGS.catBlinkSideColor,
);
applyStoredNumber(catBlinkSideOpacityInput, storedSettings.catBlinkSideOpacity, 2);
catBlinkSideStrokeColorInput.value = sanitizeHexColor(
  storedSettings.catBlinkSideStrokeColor,
  DEFAULT_SETTINGS.catBlinkSideStrokeColor,
);
applyStoredNumber(catBlinkSideStrokeWidthInput, storedSettings.catBlinkSideStrokeWidth, 1);
applyStoredNumber(catBlinkSideStrokeOpacityInput, storedSettings.catBlinkSideStrokeOpacity, 2);
catBlinkBottomColorInput.value = sanitizeHexColor(
  storedSettings.catBlinkBottomColor,
  DEFAULT_SETTINGS.catBlinkBottomColor,
);
applyStoredNumber(catBlinkBottomOpacityInput, storedSettings.catBlinkBottomOpacity, 2);
catBlinkBottomStrokeColorInput.value = sanitizeHexColor(
  storedSettings.catBlinkBottomStrokeColor,
  DEFAULT_SETTINGS.catBlinkBottomStrokeColor,
);
applyStoredNumber(catBlinkBottomStrokeWidthInput, storedSettings.catBlinkBottomStrokeWidth, 1);
applyStoredNumber(catBlinkBottomStrokeOpacityInput, storedSettings.catBlinkBottomStrokeOpacity, 2);
applyStoredNumber(catBlinkInDurationInput, storedSettings.catBlinkInDuration, 2);
applyStoredNumber(catBlinkHoldDurationInput, storedSettings.catBlinkHoldDuration, 2);
applyStoredNumber(catBlinkOutDurationInput, storedSettings.catBlinkOutDuration, 2);
applyStoredNumber(catBlinkSideDelayInput, storedSettings.catBlinkSideDelay, 2);
applyStoredNumber(catBlinkMinDelayInput, storedSettings.catBlinkMinDelay, 1);
applyStoredNumber(catBlinkMaxDelayInput, storedSettings.catBlinkMaxDelay, 1);
irisColorInput.value = sanitizeHexColor(storedSettings.irisColor, DEFAULT_SETTINGS.irisColor);
catEyeColorInput.value = sanitizeHexColor(storedSettings.catEyeColor, DEFAULT_SETTINGS.catEyeColor);
backgroundColorInput.value = sanitizeHexColor(
  storedSettings.backgroundColor,
  DEFAULT_SETTINGS.backgroundColor,
);
catBlinkEaseInInput.value = sanitizeFocusEase(
  storedSettings.catBlinkEaseIn,
  DEFAULT_SETTINGS.catBlinkEaseIn,
);
catBlinkEaseOutInput.value = sanitizeFocusEase(
  storedSettings.catBlinkEaseOut,
  DEFAULT_SETTINGS.catBlinkEaseOut,
);
focusEaseUpInput.value = sanitizeFocusEase(
  storedSettings.focusEaseUp,
  DEFAULT_SETTINGS.focusEaseUp,
);
focusEaseDownInput.value = sanitizeFocusEase(
  storedSettings.focusEaseDown,
  DEFAULT_SETTINGS.focusEaseDown,
);

const initialCount = clampInput(countInput, 24, 800);
const initialMinEyeSize = clampInput(minEyeSizeInput, 10, 90);
const initialMaxEyeSize = clampInput(maxEyeSizeInput, 20, 140);
const initialCatMix = clampInput(catMixInput, 0, 1, 2);
const initialCatMorphRadius = clampInput(catMorphRadiusInput, 0, 260);
const initialRepulsionRadius = clampInput(repulsionRadiusInput, 0, 220);
const initialClickRepulseRadius = clampInput(clickRepulseRadiusInput, 0, 420);
const initialClickRepulseStrength = clampInput(clickRepulseStrengthInput, 0, 220);
const initialClickRepulseEase = sanitizeClickRepulseEase(
  clickRepulseEaseInput.value,
  DEFAULT_SETTINGS.clickRepulseEase,
);
const initialStaggerSeconds = clampInput(staggerSecondsInput, 0, 0.1, 3);
const initialShadowOpacity = clampInput(shadowOpacityInput, 0, 1, 2);
const initialRoundInnerShadowColor = sanitizeHexColor(
  roundInnerShadowColorInput.value,
  DEFAULT_SETTINGS.roundInnerShadowColor,
);
const initialCatInnerShadowColor = sanitizeHexColor(
  catInnerShadowColorInput.value,
  DEFAULT_SETTINGS.catInnerShadowColor,
);
const initialDropShadowColor = sanitizeHexColor(
  dropShadowColorInput.value,
  DEFAULT_SETTINGS.dropShadowColor,
);
const initialDropShadowOpacity = clampInput(dropShadowOpacityInput, 0, 1, 2);
const initialDropShadowBlur = clampInput(dropShadowBlurInput, 0, 20, 1);
const initialDropShadowSpread = clampInput(dropShadowSpreadInput, 0, 10, 1);
const initialFocusScale = clampInput(focusScaleInput, 1, 2, 2);
const initialFocusUpDuration = clampInput(focusUpDurationInput, 0.01, 2, 2);
const initialFocusDownDuration = clampInput(focusDownDurationInput, 0.01, 2, 2);
const initialFocusMinDelay = clampInput(focusMinDelayInput, 0, 8, 1);
const initialFocusMaxDelay = clampInput(focusMaxDelayInput, 0, 8, 1);
const initialRoundTranslateStrength = clampInput(roundTranslateStrengthInput, 0, 1, 2);
const initialCatTranslateStrength = clampInput(catTranslateStrengthInput, 0, 1, 2);
const initialRoundHighlightScale = clampInput(roundHighlightScaleInput, 0, 2, 2);
const initialRoundHighlightOffsetX = clampInput(roundHighlightOffsetXInput, -100, 100, 1);
const initialRoundHighlightOffsetY = clampInput(roundHighlightOffsetYInput, -100, 100, 1);
const initialRoundHighlightRotationDegrees = clampInput(roundHighlightRotationInput, -180, 180, 2);
const initialRoundHighlightOpacity = clampInput(roundHighlightOpacityInput, 0, 1, 2);
const initialCatHighlightScale = clampInput(catHighlightScaleInput, 0, 2, 2);
const initialCatHighlightOffsetX = clampInput(catHighlightOffsetXInput, -1, 1, 2);
const initialCatHighlightOffsetY = clampInput(catHighlightOffsetYInput, -1, 1, 2);
const initialCatHighlightRotationDegrees = clampInput(catHighlightRotationInput, -180, 180, 2);
const initialCatHighlightOpacity = clampInput(catHighlightOpacityInput, 0, 1, 2);
const initialCatPupilHighlightMorphScale = clampInput(catPupilHighlightMorphScaleInput, 1, 8, 2);
const initialCatBlinkSideColor = sanitizeHexColor(
  catBlinkSideColorInput.value,
  DEFAULT_SETTINGS.catBlinkSideColor,
);
const initialCatBlinkSideOpacity = clampInput(catBlinkSideOpacityInput, 0, 1, 2);
const initialCatBlinkSideStrokeColor = sanitizeHexColor(
  catBlinkSideStrokeColorInput.value,
  DEFAULT_SETTINGS.catBlinkSideStrokeColor,
);
const initialCatBlinkSideStrokeWidth = clampInput(catBlinkSideStrokeWidthInput, 0, 8, 1);
const initialCatBlinkSideStrokeOpacity = clampInput(catBlinkSideStrokeOpacityInput, 0, 1, 2);
const initialCatBlinkBottomColor = sanitizeHexColor(
  catBlinkBottomColorInput.value,
  DEFAULT_SETTINGS.catBlinkBottomColor,
);
const initialCatBlinkBottomOpacity = clampInput(catBlinkBottomOpacityInput, 0, 1, 2);
const initialCatBlinkBottomStrokeColor = sanitizeHexColor(
  catBlinkBottomStrokeColorInput.value,
  DEFAULT_SETTINGS.catBlinkBottomStrokeColor,
);
const initialCatBlinkBottomStrokeWidth = clampInput(catBlinkBottomStrokeWidthInput, 0, 8, 1);
const initialCatBlinkBottomStrokeOpacity = clampInput(catBlinkBottomStrokeOpacityInput, 0, 1, 2);
const initialCatBlinkInDuration = clampInput(catBlinkInDurationInput, 0.01, 2, 2);
const initialCatBlinkHoldDuration = clampInput(catBlinkHoldDurationInput, 0, 2, 2);
const initialCatBlinkOutDuration = clampInput(catBlinkOutDurationInput, 0.01, 2, 2);
const initialCatBlinkSideDelay = clampInput(catBlinkSideDelayInput, 0, 1, 2);
const initialCatBlinkMinDelay = clampInput(catBlinkMinDelayInput, 0, 8, 1);
const initialCatBlinkMaxDelay = clampInput(catBlinkMaxDelayInput, 0, 8, 1);
const initialIrisColor = sanitizeHexColor(irisColorInput.value, DEFAULT_SETTINGS.irisColor);
const initialCatEyeColor = sanitizeHexColor(catEyeColorInput.value, DEFAULT_SETTINGS.catEyeColor);
const initialBackgroundColor = sanitizeHexColor(
  backgroundColorInput.value,
  DEFAULT_SETTINGS.backgroundColor,
);
const initialCatBlinkEaseIn = sanitizeFocusEase(
  catBlinkEaseInInput.value,
  DEFAULT_SETTINGS.catBlinkEaseIn,
);
const initialCatBlinkEaseOut = sanitizeFocusEase(
  catBlinkEaseOutInput.value,
  DEFAULT_SETTINGS.catBlinkEaseOut,
);
const initialFocusEaseUp = sanitizeFocusEase(focusEaseUpInput.value, DEFAULT_SETTINGS.focusEaseUp);
const initialFocusEaseDown = sanitizeFocusEase(
  focusEaseDownInput.value,
  DEFAULT_SETTINGS.focusEaseDown,
);
const safeInitialMinEyeSize = Math.min(initialMinEyeSize, initialMaxEyeSize);
const safeInitialMaxEyeSize = Math.max(initialMinEyeSize, initialMaxEyeSize);
const safeInitialCatBlinkMinDelay = Math.min(initialCatBlinkMinDelay, initialCatBlinkMaxDelay);
const safeInitialCatBlinkMaxDelay = Math.max(initialCatBlinkMinDelay, initialCatBlinkMaxDelay);
const safeInitialFocusMinDelay = Math.min(initialFocusMinDelay, initialFocusMaxDelay);
const safeInitialFocusMaxDelay = Math.max(initialFocusMinDelay, initialFocusMaxDelay);

minEyeSizeInput.value = String(safeInitialMinEyeSize);
maxEyeSizeInput.value = String(safeInitialMaxEyeSize);
catMixInput.value = initialCatMix.toFixed(2);
catMorphRadiusInput.value = String(initialCatMorphRadius);
clickRepulseEaseInput.value = initialClickRepulseEase;
roundInnerShadowColorInput.value = initialRoundInnerShadowColor;
catInnerShadowColorInput.value = initialCatInnerShadowColor;
dropShadowColorInput.value = initialDropShadowColor;
dropShadowOpacityInput.value = initialDropShadowOpacity.toFixed(2);
dropShadowBlurInput.value = initialDropShadowBlur.toFixed(1);
dropShadowSpreadInput.value = initialDropShadowSpread.toFixed(1);
catBlinkMinDelayInput.value = safeInitialCatBlinkMinDelay.toFixed(1);
catBlinkMaxDelayInput.value = safeInitialCatBlinkMaxDelay.toFixed(1);
focusMinDelayInput.value = safeInitialFocusMinDelay.toFixed(1);
focusMaxDelayInput.value = safeInitialFocusMaxDelay.toFixed(1);
roundTranslateStrengthInput.value = initialRoundTranslateStrength.toFixed(2);
catTranslateStrengthInput.value = initialCatTranslateStrength.toFixed(2);
roundHighlightScaleInput.value = initialRoundHighlightScale.toFixed(2);
roundHighlightOffsetXInput.value = initialRoundHighlightOffsetX.toFixed(1);
roundHighlightOffsetYInput.value = initialRoundHighlightOffsetY.toFixed(1);
roundHighlightRotationInput.value = initialRoundHighlightRotationDegrees.toFixed(2);
roundHighlightOpacityInput.value = initialRoundHighlightOpacity.toFixed(2);
catHighlightScaleInput.value = initialCatHighlightScale.toFixed(2);
catHighlightOffsetXInput.value = initialCatHighlightOffsetX.toFixed(2);
catHighlightOffsetYInput.value = initialCatHighlightOffsetY.toFixed(2);
catHighlightRotationInput.value = initialCatHighlightRotationDegrees.toFixed(2);
catHighlightOpacityInput.value = initialCatHighlightOpacity.toFixed(2);
catPupilHighlightMorphScaleInput.value = initialCatPupilHighlightMorphScale.toFixed(2);
catBlinkSideColorInput.value = initialCatBlinkSideColor;
catBlinkSideOpacityInput.value = initialCatBlinkSideOpacity.toFixed(2);
catBlinkSideStrokeColorInput.value = initialCatBlinkSideStrokeColor;
catBlinkSideStrokeWidthInput.value = initialCatBlinkSideStrokeWidth.toFixed(1);
catBlinkSideStrokeOpacityInput.value = initialCatBlinkSideStrokeOpacity.toFixed(2);
catBlinkBottomColorInput.value = initialCatBlinkBottomColor;
catBlinkBottomOpacityInput.value = initialCatBlinkBottomOpacity.toFixed(2);
catBlinkBottomStrokeColorInput.value = initialCatBlinkBottomStrokeColor;
catBlinkBottomStrokeWidthInput.value = initialCatBlinkBottomStrokeWidth.toFixed(1);
catBlinkBottomStrokeOpacityInput.value = initialCatBlinkBottomStrokeOpacity.toFixed(2);
catBlinkInDurationInput.value = initialCatBlinkInDuration.toFixed(2);
catBlinkHoldDurationInput.value = initialCatBlinkHoldDuration.toFixed(2);
catBlinkOutDurationInput.value = initialCatBlinkOutDuration.toFixed(2);
catBlinkSideDelayInput.value = initialCatBlinkSideDelay.toFixed(2);
irisColorInput.value = initialIrisColor;
catEyeColorInput.value = initialCatEyeColor;
backgroundColorInput.value = initialBackgroundColor;
catBlinkEaseInInput.value = initialCatBlinkEaseIn;
catBlinkEaseOutInput.value = initialCatBlinkEaseOut;
focusEaseUpInput.value = initialFocusEaseUp;
focusEaseDownInput.value = initialFocusEaseDown;

let settingsState: StoredSettings = {
  count: initialCount,
  minEyeSize: safeInitialMinEyeSize,
  maxEyeSize: safeInitialMaxEyeSize,
  catMix: initialCatMix,
  catMorphRadius: initialCatMorphRadius,
  repulsionRadius: initialRepulsionRadius,
  clickRepulseRadius: initialClickRepulseRadius,
  clickRepulseStrength: initialClickRepulseStrength,
  clickRepulseEase: initialClickRepulseEase,
  staggerSeconds: initialStaggerSeconds,
  shadowOpacity: initialShadowOpacity,
  roundInnerShadowColor: initialRoundInnerShadowColor,
  catInnerShadowColor: initialCatInnerShadowColor,
  dropShadowColor: initialDropShadowColor,
  dropShadowOpacity: initialDropShadowOpacity,
  dropShadowBlur: initialDropShadowBlur,
  dropShadowSpread: initialDropShadowSpread,
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
  catBlinkMinDelay: safeInitialCatBlinkMinDelay,
  catBlinkMaxDelay: safeInitialCatBlinkMaxDelay,
  catBlinkInDuration: initialCatBlinkInDuration,
  catBlinkHoldDuration: initialCatBlinkHoldDuration,
  catBlinkOutDuration: initialCatBlinkOutDuration,
  catBlinkSideDelay: initialCatBlinkSideDelay,
  catBlinkEaseIn: initialCatBlinkEaseIn,
  catBlinkEaseOut: initialCatBlinkEaseOut,
  backgroundColor: initialBackgroundColor,
  focusScale: initialFocusScale,
  focusUpDuration: initialFocusUpDuration,
  focusDownDuration: initialFocusDownDuration,
  focusMinDelay: safeInitialFocusMinDelay,
  focusMaxDelay: safeInitialFocusMaxDelay,
  focusEaseUp: initialFocusEaseUp,
  focusEaseDown: initialFocusEaseDown,
};

const updateStoredSettings = (patch: Partial<StoredSettings>) => {
  settingsState = { ...settingsState, ...patch };
  writeStoredSettings(settingsState);
};

const serializeSettings = () => JSON.stringify(settingsState, null, 2);

const setJsonStatus = (message: string) => {
  jsonStatus.textContent = message;
};

const fallbackCopyText = (value: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

const copySettingsJson = async () => {
  const json = serializeSettings();

  try {
    await navigator.clipboard.writeText(json);
    setJsonStatus("Copied JSON");
  } catch {
    fallbackCopyText(json);
    setJsonStatus("Copied JSON");
  }
};

const downloadSettingsJson = () => {
  const blob = new Blob([serializeSettings()], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = "pixi-eyes-settings.json";
  anchor.click();
  URL.revokeObjectURL(objectUrl);
  setJsonStatus("Downloaded JSON");
};

const scene = await createHeroScene({
  initialCount,
  initialMinEyeSize: safeInitialMinEyeSize,
  initialMaxEyeSize: safeInitialMaxEyeSize,
  initialCatMix,
  initialCatMorphRadius,
  initialRepulsionRadius: initialRepulsionRadius,
  initialClickRepulseRadius,
  initialClickRepulseStrength,
  initialClickRepulseEase,
  initialStaggerSeconds,
  initialShadowOpacity,
  initialRoundInnerShadowColor: hexToNumber(initialRoundInnerShadowColor),
  initialCatInnerShadowColor: hexToNumber(initialCatInnerShadowColor),
  initialDropShadowColor: hexToNumber(initialDropShadowColor),
  initialDropShadowOpacity,
  initialDropShadowBlur,
  initialDropShadowSpread,
  initialIrisColor: hexToNumber(initialIrisColor),
  initialCatEyeColor: hexToNumber(initialCatEyeColor),
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
  initialCatBlinkSideColor: hexToNumber(initialCatBlinkSideColor),
  initialCatBlinkSideOpacity,
  initialCatBlinkSideStrokeColor: hexToNumber(initialCatBlinkSideStrokeColor),
  initialCatBlinkSideStrokeWidth: initialCatBlinkSideStrokeWidth,
  initialCatBlinkSideStrokeOpacity,
  initialCatBlinkBottomColor: hexToNumber(initialCatBlinkBottomColor),
  initialCatBlinkBottomOpacity,
  initialCatBlinkBottomStrokeColor: hexToNumber(initialCatBlinkBottomStrokeColor),
  initialCatBlinkBottomStrokeWidth: initialCatBlinkBottomStrokeWidth,
  initialCatBlinkBottomStrokeOpacity,
  initialCatBlinkMinDelay: safeInitialCatBlinkMinDelay,
  initialCatBlinkMaxDelay: safeInitialCatBlinkMaxDelay,
  initialCatBlinkInDuration,
  initialCatBlinkHoldDuration,
  initialCatBlinkOutDuration,
  initialCatBlinkSideDelay,
  initialCatBlinkEaseIn,
  initialCatBlinkEaseOut,
  initialBackgroundColor: hexToNumber(initialBackgroundColor),
  initialFocusScale,
  initialFocusUpDuration,
  initialFocusDownDuration,
  initialFocusMinDelay: safeInitialFocusMinDelay,
  initialFocusMaxDelay: safeInitialFocusMaxDelay,
  initialFocusEaseUp,
  initialFocusEaseDown,
  mountNode,
  onMetrics: ({ fps, visibleCount }) => {
    fpsValue.textContent = fps.toFixed(0);
    visibleValue.textContent = String(visibleCount);
  },
});

writeStoredSettings(settingsState);
copyJsonButton.addEventListener("click", () => {
  void copySettingsJson();
});
downloadJsonButton.addEventListener("click", () => {
  downloadSettingsJson();
});

bindNumberInput(countInput, {
  min: 24,
  max: 800,
  apply: (nextCount) => {
    updateStoredSettings({ count: nextCount });
    scene.setCount(nextCount);
  },
});

const syncEyeSizeControls = () => {
  const minValue = clampInput(minEyeSizeInput, 10, 90);
  const maxValue = clampInput(maxEyeSizeInput, 20, 140);
  const safeMin = Math.min(minValue, maxValue);
  const safeMax = Math.max(minValue, maxValue);

  if (safeMin !== minValue) {
    minEyeSizeInput.value = String(safeMin);
  }

  if (safeMax !== maxValue) {
    maxEyeSizeInput.value = String(safeMax);
  }

  updateStoredSettings({
    minEyeSize: safeMin,
    maxEyeSize: safeMax,
  });
  scene.setConfig({
    minEyeSize: safeMin,
    maxEyeSize: safeMax,
  });
};

bindNumberInput(minEyeSizeInput, {
  min: 10,
  max: 90,
  apply: syncEyeSizeControls,
});

bindNumberInput(maxEyeSizeInput, {
  min: 20,
  max: 140,
  apply: syncEyeSizeControls,
});

bindNumberInput(catMixInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatMix) => {
    updateStoredSettings({ catMix: nextCatMix });
    scene.setConfig({ catMix: nextCatMix });
  },
});

bindNumberInput(catMorphRadiusInput, {
  min: 0,
  max: 260,
  apply: (nextCatMorphRadius) => {
    updateStoredSettings({ catMorphRadius: nextCatMorphRadius });
    scene.setConfig({ catMorphRadius: nextCatMorphRadius });
  },
});

bindNumberInput(repulsionRadiusInput, {
  min: 0,
  max: 220,
  apply: (nextRadius) => {
    updateStoredSettings({ repulsionRadius: nextRadius });
    scene.setConfig({ repulsionRadius: nextRadius });
  },
});

bindNumberInput(clickRepulseRadiusInput, {
  min: 0,
  max: 420,
  apply: (nextClickRepulseRadius) => {
    updateStoredSettings({ clickRepulseRadius: nextClickRepulseRadius });
    scene.setConfig({ clickRepulseRadius: nextClickRepulseRadius });
  },
});

bindNumberInput(clickRepulseStrengthInput, {
  min: 0,
  max: 220,
  apply: (nextClickRepulseStrength) => {
    updateStoredSettings({ clickRepulseStrength: nextClickRepulseStrength });
    scene.setConfig({ clickRepulseStrength: nextClickRepulseStrength });
  },
});

bindSelectInput(
  clickRepulseEaseInput,
  (value) => sanitizeClickRepulseEase(value, DEFAULT_SETTINGS.clickRepulseEase),
  (nextClickRepulseEase) => {
    updateStoredSettings({ clickRepulseEase: nextClickRepulseEase });
    scene.setConfig({ clickRepulseEase: nextClickRepulseEase });
  },
);

bindNumberInput(staggerSecondsInput, {
  min: 0,
  max: 0.1,
  fractionDigits: 3,
  apply: (nextStagger) => {
    updateStoredSettings({ staggerSeconds: nextStagger });
    scene.setConfig({ staggerSeconds: nextStagger });
  },
});

bindNumberInput(shadowOpacityInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextShadowOpacity) => {
    updateStoredSettings({ shadowOpacity: nextShadowOpacity });
    scene.setConfig({ shadowOpacity: nextShadowOpacity });
  },
});

bindColorInput(roundInnerShadowColorInput, (nextRoundInnerShadowColor) => {
  updateStoredSettings({ roundInnerShadowColor: nextRoundInnerShadowColor });
  scene.setConfig({ roundInnerShadowColor: hexToNumber(nextRoundInnerShadowColor) });
});

bindColorInput(catInnerShadowColorInput, (nextCatInnerShadowColor) => {
  updateStoredSettings({ catInnerShadowColor: nextCatInnerShadowColor });
  scene.setConfig({ catInnerShadowColor: hexToNumber(nextCatInnerShadowColor) });
});

bindColorInput(dropShadowColorInput, (nextDropShadowColor) => {
  updateStoredSettings({ dropShadowColor: nextDropShadowColor });
  scene.setConfig({ dropShadowColor: hexToNumber(nextDropShadowColor) });
});

bindNumberInput(dropShadowOpacityInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextDropShadowOpacity) => {
    updateStoredSettings({ dropShadowOpacity: nextDropShadowOpacity });
    scene.setConfig({ dropShadowOpacity: nextDropShadowOpacity });
  },
});

bindNumberInput(dropShadowBlurInput, {
  min: 0,
  max: 20,
  fractionDigits: 1,
  apply: (nextDropShadowBlur) => {
    updateStoredSettings({ dropShadowBlur: nextDropShadowBlur });
    scene.setConfig({ dropShadowBlur: nextDropShadowBlur });
  },
});

bindNumberInput(dropShadowSpreadInput, {
  min: 0,
  max: 10,
  fractionDigits: 1,
  apply: (nextDropShadowSpread) => {
    updateStoredSettings({ dropShadowSpread: nextDropShadowSpread });
    scene.setConfig({ dropShadowSpread: nextDropShadowSpread });
  },
});

bindColorInput(irisColorInput, (nextIrisColor) => {
  updateStoredSettings({ irisColor: nextIrisColor });
  scene.setConfig({ irisColor: hexToNumber(nextIrisColor) });
});

bindColorInput(catEyeColorInput, (nextCatEyeColor) => {
  updateStoredSettings({ catEyeColor: nextCatEyeColor });
  scene.setConfig({ catEyeColor: hexToNumber(nextCatEyeColor) });
});

bindNumberInput(roundTranslateStrengthInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextRoundTranslateStrength) => {
    updateStoredSettings({ roundTranslateStrength: nextRoundTranslateStrength });
    scene.setConfig({ roundTranslateStrength: nextRoundTranslateStrength });
  },
});

bindNumberInput(catTranslateStrengthInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatTranslateStrength) => {
    updateStoredSettings({ catTranslateStrength: nextCatTranslateStrength });
    scene.setConfig({ catTranslateStrength: nextCatTranslateStrength });
  },
});

bindNumberInput(roundHighlightScaleInput, {
  min: 0,
  max: 2,
  fractionDigits: 2,
  apply: (nextRoundHighlightScale) => {
    updateStoredSettings({ roundHighlightScale: nextRoundHighlightScale });
    scene.setConfig({ roundHighlightScale: nextRoundHighlightScale });
  },
});

bindNumberInput(roundHighlightOffsetXInput, {
  min: -100,
  max: 100,
  fractionDigits: 1,
  apply: (nextRoundHighlightOffsetX) => {
    updateStoredSettings({ roundHighlightOffsetX: nextRoundHighlightOffsetX });
    scene.setConfig({ roundHighlightOffsetX: nextRoundHighlightOffsetX });
  },
});

bindNumberInput(roundHighlightOffsetYInput, {
  min: -100,
  max: 100,
  fractionDigits: 1,
  apply: (nextRoundHighlightOffsetY) => {
    updateStoredSettings({ roundHighlightOffsetY: nextRoundHighlightOffsetY });
    scene.setConfig({ roundHighlightOffsetY: nextRoundHighlightOffsetY });
  },
});

bindNumberInput(roundHighlightRotationInput, {
  min: -180,
  max: 180,
  fractionDigits: 2,
  apply: (nextRoundHighlightRotationDegrees) => {
    updateStoredSettings({ roundHighlightRotationDegrees: nextRoundHighlightRotationDegrees });
    scene.setConfig({ roundHighlightRotationDegrees: nextRoundHighlightRotationDegrees });
  },
});

bindNumberInput(roundHighlightOpacityInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextRoundHighlightOpacity) => {
    updateStoredSettings({ roundHighlightOpacity: nextRoundHighlightOpacity });
    scene.setConfig({ roundHighlightOpacity: nextRoundHighlightOpacity });
  },
});

bindNumberInput(catHighlightScaleInput, {
  min: 0,
  max: 2,
  fractionDigits: 2,
  apply: (nextCatHighlightScale) => {
    updateStoredSettings({ catHighlightScale: nextCatHighlightScale });
    scene.setConfig({ catHighlightScale: nextCatHighlightScale });
  },
});

bindNumberInput(catHighlightOffsetXInput, {
  min: -1,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatHighlightOffsetX) => {
    updateStoredSettings({ catHighlightOffsetX: nextCatHighlightOffsetX });
    scene.setConfig({ catHighlightOffsetX: nextCatHighlightOffsetX });
  },
});

bindNumberInput(catHighlightOffsetYInput, {
  min: -1,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatHighlightOffsetY) => {
    updateStoredSettings({ catHighlightOffsetY: nextCatHighlightOffsetY });
    scene.setConfig({ catHighlightOffsetY: nextCatHighlightOffsetY });
  },
});

bindNumberInput(catHighlightRotationInput, {
  min: -180,
  max: 180,
  fractionDigits: 2,
  apply: (nextCatHighlightRotationDegrees) => {
    updateStoredSettings({ catHighlightRotationDegrees: nextCatHighlightRotationDegrees });
    scene.setConfig({ catHighlightRotationDegrees: nextCatHighlightRotationDegrees });
  },
});

bindNumberInput(catHighlightOpacityInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatHighlightOpacity) => {
    updateStoredSettings({ catHighlightOpacity: nextCatHighlightOpacity });
    scene.setConfig({ catHighlightOpacity: nextCatHighlightOpacity });
  },
});

bindNumberInput(catPupilHighlightMorphScaleInput, {
  min: 1,
  max: 8,
  fractionDigits: 2,
  apply: (nextCatPupilHighlightMorphScale) => {
    updateStoredSettings({ catPupilHighlightMorphScale: nextCatPupilHighlightMorphScale });
    scene.setConfig({ catPupilHighlightMorphScale: nextCatPupilHighlightMorphScale });
  },
});

bindColorInput(catBlinkSideColorInput, (nextCatBlinkSideColor) => {
  updateStoredSettings({ catBlinkSideColor: nextCatBlinkSideColor });
  scene.setConfig({ catBlinkSideColor: hexToNumber(nextCatBlinkSideColor) });
});

bindNumberInput(catBlinkSideOpacityInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatBlinkSideOpacity) => {
    updateStoredSettings({ catBlinkSideOpacity: nextCatBlinkSideOpacity });
    scene.setConfig({ catBlinkSideOpacity: nextCatBlinkSideOpacity });
  },
});

bindColorInput(catBlinkSideStrokeColorInput, (nextCatBlinkSideStrokeColor) => {
  updateStoredSettings({ catBlinkSideStrokeColor: nextCatBlinkSideStrokeColor });
  scene.setConfig({ catBlinkSideStrokeColor: hexToNumber(nextCatBlinkSideStrokeColor) });
});

bindNumberInput(catBlinkSideStrokeWidthInput, {
  min: 0,
  max: 8,
  fractionDigits: 1,
  apply: (nextCatBlinkSideStrokeWidth) => {
    updateStoredSettings({ catBlinkSideStrokeWidth: nextCatBlinkSideStrokeWidth });
    scene.setConfig({ catBlinkSideStrokeWidth: nextCatBlinkSideStrokeWidth });
  },
});

bindNumberInput(catBlinkSideStrokeOpacityInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatBlinkSideStrokeOpacity) => {
    updateStoredSettings({ catBlinkSideStrokeOpacity: nextCatBlinkSideStrokeOpacity });
    scene.setConfig({ catBlinkSideStrokeOpacity: nextCatBlinkSideStrokeOpacity });
  },
});

bindColorInput(catBlinkBottomColorInput, (nextCatBlinkBottomColor) => {
  updateStoredSettings({ catBlinkBottomColor: nextCatBlinkBottomColor });
  scene.setConfig({ catBlinkBottomColor: hexToNumber(nextCatBlinkBottomColor) });
});

bindNumberInput(catBlinkBottomOpacityInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatBlinkBottomOpacity) => {
    updateStoredSettings({ catBlinkBottomOpacity: nextCatBlinkBottomOpacity });
    scene.setConfig({ catBlinkBottomOpacity: nextCatBlinkBottomOpacity });
  },
});

bindColorInput(catBlinkBottomStrokeColorInput, (nextCatBlinkBottomStrokeColor) => {
  updateStoredSettings({ catBlinkBottomStrokeColor: nextCatBlinkBottomStrokeColor });
  scene.setConfig({ catBlinkBottomStrokeColor: hexToNumber(nextCatBlinkBottomStrokeColor) });
});

bindNumberInput(catBlinkBottomStrokeWidthInput, {
  min: 0,
  max: 8,
  fractionDigits: 1,
  apply: (nextCatBlinkBottomStrokeWidth) => {
    updateStoredSettings({ catBlinkBottomStrokeWidth: nextCatBlinkBottomStrokeWidth });
    scene.setConfig({ catBlinkBottomStrokeWidth: nextCatBlinkBottomStrokeWidth });
  },
});

bindNumberInput(catBlinkBottomStrokeOpacityInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatBlinkBottomStrokeOpacity) => {
    updateStoredSettings({ catBlinkBottomStrokeOpacity: nextCatBlinkBottomStrokeOpacity });
    scene.setConfig({ catBlinkBottomStrokeOpacity: nextCatBlinkBottomStrokeOpacity });
  },
});

bindNumberInput(catBlinkInDurationInput, {
  min: 0.01,
  max: 2,
  fractionDigits: 2,
  apply: (nextCatBlinkInDuration) => {
    updateStoredSettings({ catBlinkInDuration: nextCatBlinkInDuration });
    scene.setConfig({ catBlinkInDuration: nextCatBlinkInDuration });
  },
});

bindNumberInput(catBlinkHoldDurationInput, {
  min: 0,
  max: 2,
  fractionDigits: 2,
  apply: (nextCatBlinkHoldDuration) => {
    updateStoredSettings({ catBlinkHoldDuration: nextCatBlinkHoldDuration });
    scene.setConfig({ catBlinkHoldDuration: nextCatBlinkHoldDuration });
  },
});

bindNumberInput(catBlinkOutDurationInput, {
  min: 0.01,
  max: 2,
  fractionDigits: 2,
  apply: (nextCatBlinkOutDuration) => {
    updateStoredSettings({ catBlinkOutDuration: nextCatBlinkOutDuration });
    scene.setConfig({ catBlinkOutDuration: nextCatBlinkOutDuration });
  },
});

bindNumberInput(catBlinkSideDelayInput, {
  min: 0,
  max: 1,
  fractionDigits: 2,
  apply: (nextCatBlinkSideDelay) => {
    updateStoredSettings({ catBlinkSideDelay: nextCatBlinkSideDelay });
    scene.setConfig({ catBlinkSideDelay: nextCatBlinkSideDelay });
  },
});

const syncCatBlinkDelayControls = () => {
  const minValue = clampInput(catBlinkMinDelayInput, 0, 8, 1);
  const maxValue = clampInput(catBlinkMaxDelayInput, 0, 8, 1);
  const safeMin = Math.min(minValue, maxValue);
  const safeMax = Math.max(minValue, maxValue);

  if (safeMin !== minValue) {
    catBlinkMinDelayInput.value = safeMin.toFixed(1);
  }

  if (safeMax !== maxValue) {
    catBlinkMaxDelayInput.value = safeMax.toFixed(1);
  }

  updateStoredSettings({
    catBlinkMinDelay: safeMin,
    catBlinkMaxDelay: safeMax,
  });
  scene.setConfig({
    catBlinkMinDelay: safeMin,
    catBlinkMaxDelay: safeMax,
  });
};

bindNumberInput(catBlinkMinDelayInput, {
  min: 0,
  max: 8,
  fractionDigits: 1,
  apply: syncCatBlinkDelayControls,
});

bindNumberInput(catBlinkMaxDelayInput, {
  min: 0,
  max: 8,
  fractionDigits: 1,
  apply: syncCatBlinkDelayControls,
});

bindSelectInput(
  catBlinkEaseInInput,
  (value) => sanitizeFocusEase(value, DEFAULT_SETTINGS.catBlinkEaseIn),
  (nextCatBlinkEaseIn) => {
    updateStoredSettings({ catBlinkEaseIn: nextCatBlinkEaseIn });
    scene.setConfig({ catBlinkEaseIn: nextCatBlinkEaseIn });
  },
);

bindSelectInput(
  catBlinkEaseOutInput,
  (value) => sanitizeFocusEase(value, DEFAULT_SETTINGS.catBlinkEaseOut),
  (nextCatBlinkEaseOut) => {
    updateStoredSettings({ catBlinkEaseOut: nextCatBlinkEaseOut });
    scene.setConfig({ catBlinkEaseOut: nextCatBlinkEaseOut });
  },
);

bindColorInput(backgroundColorInput, (nextBackgroundColor) => {
  updateStoredSettings({ backgroundColor: nextBackgroundColor });
  scene.setConfig({ backgroundColor: hexToNumber(nextBackgroundColor) });
});

bindNumberInput(focusScaleInput, {
  min: 1,
  max: 2,
  fractionDigits: 2,
  apply: (nextFocusScale) => {
    updateStoredSettings({ focusScale: nextFocusScale });
    scene.setConfig({ focusScale: nextFocusScale });
  },
});

bindNumberInput(focusUpDurationInput, {
  min: 0.01,
  max: 2,
  fractionDigits: 2,
  apply: (nextFocusUpDuration) => {
    updateStoredSettings({ focusUpDuration: nextFocusUpDuration });
    scene.setConfig({ focusUpDuration: nextFocusUpDuration });
  },
});

bindNumberInput(focusDownDurationInput, {
  min: 0.01,
  max: 2,
  fractionDigits: 2,
  apply: (nextFocusDownDuration) => {
    updateStoredSettings({ focusDownDuration: nextFocusDownDuration });
    scene.setConfig({ focusDownDuration: nextFocusDownDuration });
  },
});

const syncFocusDelayControls = () => {
  const minValue = clampInput(focusMinDelayInput, 0, 8, 1);
  const maxValue = clampInput(focusMaxDelayInput, 0, 8, 1);
  const safeMin = Math.min(minValue, maxValue);
  const safeMax = Math.max(minValue, maxValue);

  if (safeMin !== minValue) {
    focusMinDelayInput.value = safeMin.toFixed(1);
  }

  if (safeMax !== maxValue) {
    focusMaxDelayInput.value = safeMax.toFixed(1);
  }

  updateStoredSettings({
    focusMinDelay: safeMin,
    focusMaxDelay: safeMax,
  });
  scene.setConfig({
    focusMinDelay: safeMin,
    focusMaxDelay: safeMax,
  });
};

bindNumberInput(focusMinDelayInput, {
  min: 0,
  max: 8,
  fractionDigits: 1,
  apply: syncFocusDelayControls,
});

bindNumberInput(focusMaxDelayInput, {
  min: 0,
  max: 8,
  fractionDigits: 1,
  apply: syncFocusDelayControls,
});

bindSelectInput(
  focusEaseUpInput,
  (value) => sanitizeFocusEase(value, DEFAULT_SETTINGS.focusEaseUp),
  (nextFocusEaseUp) => {
    updateStoredSettings({ focusEaseUp: nextFocusEaseUp });
    scene.setConfig({ focusEaseUp: nextFocusEaseUp });
  },
);

bindSelectInput(
  focusEaseDownInput,
  (value) => sanitizeFocusEase(value, DEFAULT_SETTINGS.focusEaseDown),
  (nextFocusEaseDown) => {
    updateStoredSettings({ focusEaseDown: nextFocusEaseDown });
    scene.setConfig({ focusEaseDown: nextFocusEaseDown });
  },
);

window.addEventListener("beforeunload", () => {
  scene.destroy();
});

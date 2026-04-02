// @env browser

// Minimal sidebar UI with slide-in panel

import {
  CONTROL_DEFINITIONS,
  SECTIONS,
  sanitizeHexColor,
  sanitizeFocusEase,
  sanitizeLayoutShape,
  sanitizeCrossType,
} from "../controls";
import type { ControlDefinition } from "../controls";

export type SidebarBindings = {
  destroy: () => void;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

type SceneAPI = {
  setConfig: (config: Record<string, unknown>) => void;
};

type UpdateSettings = (patch: Record<string, number | string>) => void;

const TOGGLE_BUTTON_ID = "pixi-eyes-sidebar-toggle";
const SIDEBAR_ID = "pixi-eyes-sidebar";
const FPS_VALUE_ID = "pixi-eyes-fps";
const VISIBLE_VALUE_ID = "pixi-eyes-visible";

const CSS = `
  #${TOGGLE_BUTTON_ID} {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 9999;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 0.95);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  #${TOGGLE_BUTTON_ID}:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }
  #${SIDEBAR_ID} {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px;
    background: white;
    z-index: 9998;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  #${SIDEBAR_ID}.open {
    transform: translateX(0);
  }
  #${SIDEBAR_ID}-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  #${SIDEBAR_ID}-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(0, 0, 0, 0.45);
  }
  #${SIDEBAR_ID}-close {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: rgba(0, 0, 0, 0.5);
    transition: all 0.15s ease;
  }
  #${SIDEBAR_ID}-close:hover {
    background: rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.8);
  }
  #${SIDEBAR_ID}-metrics {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .pixi-metric {
    flex: 1;
    padding: 0.625rem 0.875rem;
    border-radius: 0.75rem;
    background: rgba(0, 0, 0, 0.04);
  }
  .pixi-metric-label {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(0, 0, 0, 0.4);
  }
  .pixi-metric-value {
    margin-top: 0.375rem;
    font-size: 1.5rem;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.9);
  }
  #${SIDEBAR_ID}-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.25rem;
  }
  .pixi-section {
    margin-bottom: 1.25rem;
  }
  .pixi-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    cursor: pointer;
    user-select: none;
  }
  .pixi-section-title {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(0, 0, 0, 0.35);
  }
  .pixi-section-chevron {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
  }
  .pixi-section.open .pixi-section-chevron {
    transform: rotate(180deg);
  }
  .pixi-section-controls {
    display: grid;
    gap: 0.5rem;
    margin-top: 0.5rem;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .pixi-section.collapsed .pixi-section-controls {
    display: none;
  }
  .pixi-control {
    display: grid;
    grid-template-columns: 1fr 80px;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }
  .pixi-control-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.55);
    letter-spacing: -0.01em;
  }
  .pixi-control-input {
    height: 28px;
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 6px;
    background: white;
    padding: 0 0.5rem;
    font-size: 0.8125rem;
    color: rgba(0, 0, 0, 0.9);
    outline: none;
    transition: border-color 0.15s ease;
  }
  .pixi-control-input:focus {
    border-color: rgba(0, 0, 0, 0.3);
  }
  .pixi-control-input[type="color"] {
    padding: 0.125rem;
    cursor: pointer;
  }
  .pixi-control-input[type="number"] {
    text-align: right;
  }
`;

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

function renderNumberControl(control: ControlDefinition, value: number | string): string {
  const { id, label, min, max, step, default: def } = control;
  const displayValue = getNumberDisplayValue(value, step, def);
  return `
    <label class="pixi-control">
      <span class="pixi-control-label">${label}</span>
      <input id="${id}" class="pixi-control-input" type="number" min="${min}" max="${max}" step="${step}" value="${displayValue}" />
    </label>
  `;
}

function renderColorControl(control: ControlDefinition, value: number | string): string {
  const { id, label, default: def } = control;
  return `
    <label class="pixi-control">
      <span class="pixi-control-label">${label}</span>
      <input id="${id}" class="pixi-control-input" type="color" value="${typeof value === "string" ? value : def}" />
    </label>
  `;
}

function renderSelectControl(control: ControlDefinition, value: number | string): string {
  const { id, label, options } = control;
  if (!options) return "";
  const opts = options
    .map(
      (o) =>
        `<option value="${o.value}"${o.value === value ? " selected" : ""}>${o.label}</option>`,
    )
    .join("");
  return `
    <label class="pixi-control">
      <span class="pixi-control-label">${label}</span>
      <select id="${id}" class="pixi-control-input">${opts}</select>
    </label>
  `;
}

const RENDER_BY_TYPE: Record<string, (ctrl: ControlDefinition, val: number | string) => string> = {
  number: renderNumberControl,
  color: renderColorControl,
  select: renderSelectControl,
};

function renderControl(control: ControlDefinition, value: number | string): string {
  const render = RENDER_BY_TYPE[control.type];
  return render ? render(control, value) : "";
}

function renderSection(section: string, stored: Record<string, number | string>): string {
  const controls = CONTROL_DEFINITIONS.filter((c) => c.section === section);
  const controlsHtml = controls.map((c) => renderControl(c, stored[c.id] ?? c.default)).join("");
  return `
    <div class="pixi-section" data-section="${section}">
      <div class="pixi-section-header">
        <span class="pixi-section-title">${section}</span>
        <span class="pixi-section-chevron">⌄</span>
      </div>
      <div class="pixi-section-controls">${controlsHtml}</div>
    </div>
  `;
}

function renderAllSections(stored: Record<string, number | string>): string {
  return SECTIONS.map((section) => renderSection(section, stored)).join("");
}

function clampInput(
  input: HTMLInputElement,
  min: number,
  max: number,
  fractionDigits?: number,
): number {
  const rawValue = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : min;
  const clamped = Math.min(Math.max(rawValue, min), max);
  if (typeof fractionDigits === "number") {
    input.value = clamped.toFixed(fractionDigits);
  } else {
    input.value = String(clamped);
  }
  return clamped;
}

function bindNumberInput(
  id: string,
  min: number,
  max: number,
  fractionDigits: number | undefined,
  scene: SceneAPI,
  updateStoredSettings: UpdateSettings,
): () => void {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) return () => {};

  const commit = () => {
    const value = clampInput(input, min, max, fractionDigits);
    updateStoredSettings({ [id]: value });
    scene.setConfig({ [id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())]: value });
  };

  input.addEventListener("change", commit);
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
  });

  return () => {
    input.removeEventListener("change", commit);
    input.removeEventListener("blur", commit);
    input.removeEventListener("keydown", commit);
  };
}

function bindColorInput(
  id: string,
  scene: SceneAPI,
  updateStoredSettings: UpdateSettings,
): () => void {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) return () => {};

  const hexToNumber = (value: string) => Number.parseInt(value.slice(1), 16);

  const commit = () => {
    const value = sanitizeHexColor(input.value, "#000000");
    input.value = value;
    updateStoredSettings({ [id]: value });
    scene.setConfig({
      [id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())]: hexToNumber(value),
    });
  };

  input.addEventListener("input", commit);
  input.addEventListener("change", commit);

  return () => {
    input.removeEventListener("input", commit);
    input.removeEventListener("change", commit);
  };
}

function bindSelectInput(
  id: string,
  sanitize: (v: string) => string,
  scene: SceneAPI,
  updateStoredSettings: UpdateSettings,
): () => void {
  const input = document.querySelector<HTMLSelectElement>(`#${id}`);
  if (!input) return () => {};

  const onChange = () => {
    const value = sanitize(input.value);
    input.value = value;
    updateStoredSettings({ [id]: value });
    scene.setConfig({ [id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())]: value });
  };

  input.addEventListener("change", onChange);

  return () => {
    input.removeEventListener("change", onChange);
  };
}

function bindSectionToggle(): () => void {
  const headers = document.querySelectorAll(`#${SIDEBAR_ID} .pixi-section-header`);
  const toggle = (e: Event) => {
    const section = (e.target as Element).closest(".pixi-section");
    if (section) {
      section.classList.toggle("collapsed");
    }
  };
  headers.forEach((header) => header.addEventListener("click", toggle));
  return () => {
    headers.forEach((header) => header.removeEventListener("click", toggle));
  };
}

export function createSidebar(
  scene: SceneAPI,
  updateStoredSettings: UpdateSettings,
  storedSettings: Record<string, number | string>,
): SidebarBindings {
  const styleEl = document.createElement("style");
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  const sectionsHtml = renderAllSections(storedSettings);

  const sidebarHtml = `
    <div id="${SIDEBAR_ID}-header">
      <span id="${SIDEBAR_ID}-title">Pixi Eyes</span>
      <button id="${SIDEBAR_ID}-close">×</button>
    </div>
    <div id="${SIDEBAR_ID}-metrics">
      <div class="pixi-metric">
        <div class="pixi-metric-label">FPS</div>
        <div id="${FPS_VALUE_ID}" class="pixi-metric-value">0</div>
      </div>
      <div class="pixi-metric">
        <div class="pixi-metric-label">Visible</div>
        <div id="${VISIBLE_VALUE_ID}" class="pixi-metric-value">0</div>
      </div>
    </div>
    <div id="${SIDEBAR_ID}-content">${sectionsHtml}</div>
  `;

  const toggleBtn = document.createElement("button");
  toggleBtn.id = TOGGLE_BUTTON_ID;
  toggleBtn.textContent = "⚙️";
  toggleBtn.title = "Toggle settings (S)";

  const sidebar = document.createElement("aside");
  sidebar.id = SIDEBAR_ID;
  sidebar.innerHTML = sidebarHtml;

  document.body.appendChild(toggleBtn);
  document.body.appendChild(sidebar);

  const unbinds: Array<() => void> = [];

  const SANITIZER_BY_ID: Record<string, (v: string) => string> = {
    "layout-shape": (v) => sanitizeLayoutShape(v, "circle"),
    "cross-type": (v) => sanitizeCrossType(v, "x"),
  };

  for (const control of CONTROL_DEFINITIONS) {
    const { id, type, min = 0, max = 100, fractionDigits } = control;

    if (type === "number") {
      unbinds.push(bindNumberInput(id, min, max, fractionDigits, scene, updateStoredSettings));
    }
    if (type === "color") {
      unbinds.push(bindColorInput(id, scene, updateStoredSettings));
    }
    if (type === "select") {
      const sanitize = SANITIZER_BY_ID[id] ?? ((v: string) => sanitizeFocusEase(v, "out-cubic"));
      unbinds.push(bindSelectInput(id, sanitize, scene, updateStoredSettings));
    }
  }

  unbinds.push(bindSectionToggle());

  const closeBtn = document.getElementById(`${SIDEBAR_ID}-close`);
  const toggle = () => {
    sidebar.classList.toggle("open");
  };

  toggleBtn.addEventListener("click", toggle);
  closeBtn?.addEventListener("click", toggle);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggle();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  return {
    destroy: () => {
      unbinds.forEach((unbind) => unbind());
      toggleBtn.remove();
      sidebar.remove();
      styleEl.remove();
      window.removeEventListener("keydown", handleKeyDown);
    },
    toggle,
    open: () => sidebar.classList.add("open"),
    close: () => sidebar.classList.remove("open"),
  };
}

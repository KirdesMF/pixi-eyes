// HTML controls creation and binding

import {
  CONTROL_DEFINITIONS,
  SECTIONS,
  CONTROL_ROW_CLASS,
  LABEL_CLASS,
  NUMBER_INPUT_CLASS,
  COLOR_INPUT_CLASS,
  SELECT_INPUT_CLASS,
  SECTION_LABEL_CLASS,
  sanitizeHexColor,
  sanitizeFocusEase,
  sanitizeLayoutShape,
  sanitizeClickRepulseEase,
  type ControlDefinition,
} from "../controls";

export type ControlBindings = {
  destroy: () => void;
};

/**
 * Clamps an input value between min and max.
 */
export function clampInput(
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

/**
 * Renders a single control as HTML string.
 */
export function renderControl(control: ControlDefinition, value: number | string): string {
  const { id, label, type, min, max, step, default: def, options } = control;

  if (type === "number") {
    const displayValue = getNumberDisplayValue(value, step, def);
    return `
      <label class="${CONTROL_ROW_CLASS}">
        <span class="${LABEL_CLASS}">${label}</span>
        <input id="${id}" class="${NUMBER_INPUT_CLASS}" type="number" min="${min}" max="${max}" step="${step}" value="${displayValue}" />
      </label>
    `;
  }

  if (type === "color") {
    return `
      <label class="${CONTROL_ROW_CLASS}">
        <span class="${LABEL_CLASS}">${label}</span>
        <input id="${id}" class="${COLOR_INPUT_CLASS}" type="color" value="${value || def}" />
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
      <label class="${CONTROL_ROW_CLASS}">
        <span class="${LABEL_CLASS}">${label}</span>
        <select id="${id}" class="${SELECT_INPUT_CLASS}">${opts}</select>
      </label>
    `;
  }

  return "";
}

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

/**
 * Renders a section of controls as HTML string.
 */
export function renderSection(section: string, stored: Record<string, number | string>): string {
  const controls = CONTROL_DEFINITIONS.filter((c) => c.section === section);
  const html = controls.map((c) => renderControl(c, stored[c.id] ?? c.default)).join("");
  return `<div class="grid gap-2"><p class="${SECTION_LABEL_CLASS}">${section}</p>${html}</div>`;
}

/**
 * Renders all control sections as HTML string.
 */
export function renderAllSections(stored: Record<string, number | string>): string {
  return SECTIONS.map((section) => renderSection(section, stored)).join("");
}

/**
 * Binds a number input to settings and scene config.
 */
export function bindNumberInput(
  id: string,
  min: number,
  max: number,
  fractionDigits: number | undefined,
  scene: { setConfig: (config: Record<string, unknown>) => void },
  updateStoredSettings: (patch: Record<string, number | string>) => void,
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

/**
 * Binds a color input to settings and scene config.
 */
export function bindColorInput(
  id: string,
  scene: { setConfig: (config: Record<string, unknown>) => void },
  updateStoredSettings: (patch: Record<string, number | string>) => void,
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

/**
 * Binds a select input to settings and scene config.
 */
export function bindSelectInput(
  id: string,
  sanitize: (v: string) => string,
  scene: { setConfig: (config: Record<string, unknown>) => void },
  updateStoredSettings: (patch: Record<string, number | string>) => void,
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

/**
 * Sets up all control bindings.
 */
export function createControlBindings(
  scene: { setConfig: (config: Record<string, unknown>) => void },
  updateStoredSettings: (patch: Record<string, number | string>) => void,
): ControlBindings {
  const unbinds: Array<() => void> = [];

  const SANITIZER_BY_ID: Record<string, (v: string) => string> = {
    "layout-shape": (v) => sanitizeLayoutShape(v, "circle"),
    "click-repulse-ease": (v) => sanitizeClickRepulseEase(v, "out-elastic"),
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

  return {
    destroy: () => {
      unbinds.forEach((unbind) => unbind());
    },
  };
}

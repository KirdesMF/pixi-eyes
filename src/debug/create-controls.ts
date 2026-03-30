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

export interface ControlBindings {
  destroy: () => void;
}

/**
 * Clamps an input value between min and max.
 */
export const clampInput = (
  input: HTMLInputElement,
  min: number,
  max: number,
  fractionDigits?: number,
): number => {
  const rawValue = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : min;
  const clamped = Math.min(Math.max(rawValue, min), max);
  input.value =
    typeof fractionDigits === "number" ? clamped.toFixed(fractionDigits) : String(clamped);
  return clamped;
};

/**
 * Renders a single control as HTML string.
 */
export const renderControl = (control: ControlDefinition, value: number | string): string => {
  const { id, label, type, min, max, step, default: def, options } = control;

  if (type === "number") {
    const displayValue =
      typeof value === "number" && typeof step === "number"
        ? Number.isFinite(value)
          ? step < 1
            ? value.toFixed(2)
            : String(value)
          : String(def)
        : String(def);
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
};

/**
 * Renders a section of controls as HTML string.
 */
export const renderSection = (section: string, stored: Record<string, number | string>): string => {
  const controls = CONTROL_DEFINITIONS.filter((c) => c.section === section);
  const html = controls.map((c) => renderControl(c, stored[c.id] ?? c.default)).join("");
  return `<div class="grid gap-2"><p class="${SECTION_LABEL_CLASS}">${section}</p>${html}</div>`;
};

/**
 * Renders all control sections as HTML string.
 */
export const renderAllSections = (stored: Record<string, number | string>): string => {
  return SECTIONS.map((section) => renderSection(section, stored)).join("");
};

/**
 * Binds a number input to settings and scene config.
 */
export const bindNumberInput = (
  id: string,
  min: number,
  max: number,
  fractionDigits: number | undefined,
  scene: { setConfig: (config: Record<string, unknown>) => void },
  updateStoredSettings: (patch: Record<string, number | string>) => void,
): (() => void) => {
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
};

/**
 * Binds a color input to settings and scene config.
 */
export const bindColorInput = (
  id: string,
  scene: { setConfig: (config: Record<string, unknown>) => void },
  updateStoredSettings: (patch: Record<string, number | string>) => void,
): (() => void) => {
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
};

/**
 * Binds a select input to settings and scene config.
 */
export const bindSelectInput = (
  id: string,
  sanitize: (v: string) => string,
  scene: { setConfig: (config: Record<string, unknown>) => void },
  updateStoredSettings: (patch: Record<string, number | string>) => void,
): (() => void) => {
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
};

/**
 * Sets up all control bindings.
 */
export const createControlBindings = (
  scene: { setConfig: (config: Record<string, unknown>) => void },
  updateStoredSettings: (patch: Record<string, number | string>) => void,
): ControlBindings => {
  const unbinds: Array<() => void> = [];

  for (const control of CONTROL_DEFINITIONS) {
    const { id, type, min = 0, max = 100, fractionDigits } = control;

    if (type === "number") {
      unbinds.push(bindNumberInput(id, min, max, fractionDigits, scene, updateStoredSettings));
    } else if (type === "color") {
      unbinds.push(bindColorInput(id, scene, updateStoredSettings));
    } else if (type === "select") {
      if (id === "layout-shape") {
        unbinds.push(
          bindSelectInput(id, (v) => sanitizeLayoutShape(v, "circle"), scene, updateStoredSettings),
        );
      } else if (id === "click-repulse-ease") {
        unbinds.push(
          bindSelectInput(
            id,
            (v) => sanitizeClickRepulseEase(v, "out-elastic"),
            scene,
            updateStoredSettings,
          ),
        );
      } else {
        unbinds.push(
          bindSelectInput(
            id,
            (v) => sanitizeFocusEase(v, "out-cubic"),
            scene,
            updateStoredSettings,
          ),
        );
      }
    }
  }

  return {
    destroy: () => {
      unbinds.forEach((unbind) => unbind());
    },
  };
};

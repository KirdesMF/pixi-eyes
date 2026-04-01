// HTML controls creation and binding

import {
  CONTROL_DEFINITIONS,
  sanitizeHexColor,
  sanitizeFocusEase,
  sanitizeLayoutShape,
} from "../controls";

export type ControlBindings = {
  destroy: () => void;
};

/**
 * Clamps an input value between min and max.
 */
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

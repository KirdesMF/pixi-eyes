// HTML controls creation helpers

import {
  CONTROL_DEFINITIONS,
  SECTIONS,
  CONTROL_ROW_CLASS,
  LABEL_CLASS,
  NUMBER_INPUT_CLASS,
  COLOR_INPUT_CLASS,
  SELECT_INPUT_CLASS,
  SECTION_LABEL_CLASS,
  type ControlDefinition,
} from "../controls";

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
export const renderControl = (
  control: ControlDefinition,
  value: number | string,
): string => {
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

// Color helpers

/**
 * Sanitizes a hex color string. Returns the fallback if invalid.
 * Expected format: #RRGGBB (6 hex digits)
 */
export const sanitizeHexColor = (value: string | undefined, fallback: string): string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/iu.test(value) ? value : fallback;

/**
 * Converts a hex color string (#RRGGBB) to a number.
 * Example: "#ffffff" -> 0xffffff
 */
export const hexToNumber = (value: string): number => Number.parseInt(value.slice(1), 16);

/**
 * Converts an RGB object to a number.
 * Example: { r: 255, g: 255, b: 255 } -> 0xffffff
 */
export const rgbToNumber = (rgb: { r: number; g: number; b: number }): number =>
  (rgb.r << 16) | (rgb.g << 8) | rgb.b;

/**
 * Converts a number to a hex color string (#RRGGBB).
 * Example: 0xffffff -> "#ffffff"
 */
export const numberToHex = (value: number): string => {
  const hex = value.toString(16).padStart(6, "0");
  return `#${hex}`;
};

/**
 * Converts a number to an RGB object.
 * Example: 0xffffff -> { r: 255, g: 255, b: 255 }
 */
export const numberToRgb = (value: number): { r: number; g: number; b: number } => ({
  r: (value >> 16) & 0xff,
  g: (value >> 8) & 0xff,
  b: value & 0xff,
});

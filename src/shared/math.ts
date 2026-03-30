// Pure math helpers extracted from eye-field.ts

export const clamp = (value: number, minValue: number, maxValue: number): number =>
  Math.max(minValue, Math.min(value, maxValue));

export const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

export const remap01 = (value: number, start: number, end: number): number =>
  clamp((value - start) / Math.max(end - start, 0.001), 0, 1);

export const smoothstep = (value: number): number => value * value * (3 - 2 * value);

export const easeInSine = (value: number): number => 1 - Math.cos((value * Math.PI) / 2);

export const easeOutCubic = (value: number): number => 1 - (1 - value) ** 3;

export const easeInCubic = (value: number): number => value ** 3;

export const easeInOutCubic = (value: number): number =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

export const easeOutSine = (value: number): number => Math.sin((value * Math.PI) / 2);

export const easeInOutSine = (value: number): number => -(Math.cos(Math.PI * value) - 1) * 0.5;

export const easeInQuad = (value: number): number => value * value;

export const easeOutQuad = (value: number): number => 1 - (1 - value) * (1 - value);

export const easeInOutQuad = (value: number): number =>
  value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;

export const easeInBack = (value: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * value ** 3 - c1 * value * value;
};

export const easeOutBack = (value: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (value - 1) ** 3 + c1 * (value - 1) ** 2;
};

export const easeInOutBack = (value: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return value < 0.5
    ? ((2 * value) ** 2 * ((c2 + 1) * 2 * value - c2)) / 2
    : ((2 * value - 2) ** 2 * ((c2 + 1) * (value * 2 - 2) + c2) + 2) / 2;
};

export const easeOutElastic = (value: number): number => {
  const c4 = (2 * Math.PI) / 3;
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return 2 ** (-10 * value) * Math.sin((value * 10 - 0.75) * c4) + 1;
};

export const easeLinear = (value: number): number => value;

export const smoothTowards = (
  current: number,
  target: number,
  speed: number,
  dt: number,
): number => {
  const t = 1 - Math.exp(-Math.max(speed, 0) * dt);
  return current + (target - current) * t;
};

export const clampMagnitude = (
  x: number,
  y: number,
  maxLength: number,
): { x: number; y: number } => {
  const length = Math.hypot(x, y);
  if (length <= maxLength || length <= 0.0001) {
    return { x, y };
  }

  const scale = maxLength / length;
  return { x: x * scale, y: y * scale };
};

export const hash01 = (value: number): number => {
  const hashed = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return hashed - Math.floor(hashed);
};

export const wrapDegrees = (degrees: number): number => {
  degrees = degrees % 360;
  if (degrees > 180) {
    degrees -= 360;
  }
  if (degrees < -180) {
    degrees += 360;
  }
  return degrees;
};

export const smoothRotateTowards = (
  current: number,
  target: number,
  speed: number,
  dt: number,
): number => {
  const delta = wrapDegrees(target - current);
  const t = 1 - Math.exp(-Math.max(speed, 0) * dt);
  return wrapDegrees(current + delta * t);
};

import type { LayoutShapeName } from "./eye-field";

const TRIANGLE_LAYOUT_HALF_BASE_FACTOR = Math.sqrt(3) * 0.5;

const cross2d = (ax: number, ay: number, bx: number, by: number) => ax * by - ay * bx;

const hash01 = (value: number) => {
  const hashed = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return hashed - Math.floor(hashed);
};

export const resolveRadiusMix = (value: number) =>
  value < 0.34
    ? 0.14 + value * 0.55
    : value < 0.72
      ? 0.48 + (value - 0.34) * 0.35
      : 0.78 + (value - 0.72) * 0.78;

export const resolvePackedRadii = (count: number, minRadius: number, maxRadius: number) => {
  const safeMinRadius = Math.max(Math.min(minRadius, maxRadius), 0);
  const safeMaxRadius = Math.max(Math.max(minRadius, maxRadius), 0);

  return Array.from({ length: count }, (_, index) => {
    const tierMix = count <= 1 ? 1 : index / Math.max(count - 1, 1);
    const radiusT = resolveRadiusMix(tierMix);
    return safeMinRadius + (safeMaxRadius - safeMinRadius) * Math.max(0, Math.min(radiusT, 1));
  });
};

const triangleLayoutVertices = (extent: number) => {
  const halfBase = extent * TRIANGLE_LAYOUT_HALF_BASE_FACTOR;
  return [
    { x: 0, y: -extent },
    { x: halfBase, y: extent * 0.5 },
    { x: -halfBase, y: extent * 0.5 },
  ] as const;
};

const raySegmentDistance = (
  dx: number,
  dy: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => {
  const edgeX = bx - ax;
  const edgeY = by - ay;
  const denominator = cross2d(dx, dy, edgeX, edgeY);
  if (Math.abs(denominator) <= 0.000001) {
    return Number.POSITIVE_INFINITY;
  }

  const distance = cross2d(ax, ay, edgeX, edgeY) / denominator;
  const edgeT = cross2d(ax, ay, dx, dy) / denominator;
  if (distance >= 0 && edgeT >= 0 && edgeT <= 1) {
    return distance;
  }

  return Number.POSITIVE_INFINITY;
};

const shapeBoundaryDistance = (shape: LayoutShapeName, angle: number, extent: number) => {
  const safeExtent = Math.max(extent, 0.001);
  if (shape === "circle") {
    return safeExtent;
  }

  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  if (shape === "square") {
    return safeExtent / Math.max(Math.abs(directionX), Math.abs(directionY), 0.0001);
  }

  const vertices = triangleLayoutVertices(safeExtent);
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < vertices.length; index += 1) {
    const start = vertices[index];
    const end = vertices[(index + 1) % vertices.length];
    const distance = raySegmentDistance(directionX, directionY, start.x, start.y, end.x, end.y);
    if (distance < bestDistance) {
      bestDistance = distance;
    }
  }

  return Number.isFinite(bestDistance) ? bestDistance : safeExtent;
};

export interface PackedPosition {
  x: number;
  y: number;
  r: number;
}

export const packEyePositions = (
  radii: number[],
  clusterRadius: number,
  attempts: number,
  spiralStepDegrees: number,
  radialExponent: number,
  eyeSpiralOffset: number,
  shape: LayoutShapeName,
): PackedPosition[] => {
  const placed: PackedPosition[] = [];
  const safeClusterRadius = Math.max(clusterRadius, 0);
  const maxAttempts = Math.max(1, Math.min(Math.floor(attempts), 512));
  const spiralStep = (spiralStepDegrees * Math.PI) / 180;
  const safeRadialExponent = Math.max(radialExponent, 0.01);

  for (let i = 0; i < radii.length; i += 1) {
    const radius = radii[i];
    let bestX = 0;
    let bestY = 0;
    let bestClearance = Number.NEGATIVE_INFINITY;
    let placedWithoutOverlap = false;

    for (let attempt = 0; attempt <= maxAttempts; attempt += 1) {
      const t = attempt / maxAttempts;
      const angle = (i + 1) * eyeSpiralOffset + attempt * spiralStep;
      const boundaryDistance = shapeBoundaryDistance(shape, angle, safeClusterRadius);
      const maxDistance = Math.max(0, boundaryDistance - radius);
      const distance = maxDistance * t ** safeRadialExponent;
      const candidateX = Math.cos(angle) * distance;
      const candidateY = Math.sin(angle) * distance;

      let clearance = maxDistance - distance;
      let overlaps = false;

      for (const placedCircle of placed) {
        const dx = candidateX - placedCircle.x;
        const dy = candidateY - placedCircle.y;
        const gap = Math.hypot(dx, dy) - (radius + placedCircle.r);

        if (gap < 0) {
          overlaps = true;
        }

        if (gap < clearance) {
          clearance = gap;
        }
      }

      if (!overlaps) {
        placed.push({ x: candidateX, y: candidateY, r: radius });
        placedWithoutOverlap = true;
        break;
      }

      if (clearance > bestClearance) {
        bestClearance = clearance;
        bestX = candidateX;
        bestY = candidateY;
      }
    }

    if (!placedWithoutOverlap) {
      placed.push({ x: bestX, y: bestY, r: radius });
    }
  }

  return placed;
};

export const resolveEyeType = (index: number, count: number, catMix: number): "cat" | "round" =>
  hash01(index * 2.187 + count * 0.713) < Math.max(0, Math.min(catMix, 1)) ? "cat" : "round";

export const staggerDelay = (
  index: number,
  count: number,
  staggerSeconds: number,
  randomize: boolean,
) => {
  const step = Math.max(staggerSeconds, 0);
  if (randomize) {
    return hash01(index * 1.61803398875) * step * Math.max(count - 1, 0);
  }

  return (index - 1) * step;
};

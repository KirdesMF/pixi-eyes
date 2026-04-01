import type { LayoutShapeName } from "../eye/eye-types";

const TRIANGLE_LAYOUT_HALF_BASE_FACTOR = Math.sqrt(3) * 0.5;

function cross2d(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

function hash01(value: number): number {
  const hashed = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return hashed - Math.floor(hashed);
}

export function resolveRadiusMix(value: number): number {
  return value < 0.34
    ? 0.14 + value * 0.55
    : value < 0.72
      ? 0.48 + (value - 0.34) * 0.35
      : 0.78 + (value - 0.72) * 0.78;
}

export function resolvePackedRadii(count: number, minRadius: number, maxRadius: number): number[] {
  const safeMinRadius = Math.max(Math.min(minRadius, maxRadius), 0);
  const safeMaxRadius = Math.max(Math.max(minRadius, maxRadius), 0);

  return Array.from({ length: count }, (_, index) => {
    const tierMix = count <= 1 ? 1 : index / Math.max(count - 1, 1);
    const radiusT = resolveRadiusMix(tierMix);
    return safeMinRadius + (safeMaxRadius - safeMinRadius) * Math.max(0, Math.min(radiusT, 1));
  });
}

function triangleLayoutVertices(extent: number): readonly { x: number; y: number }[] {
  const halfBase = extent * TRIANGLE_LAYOUT_HALF_BASE_FACTOR;
  return [
    { x: 0, y: -extent },
    { x: halfBase, y: extent * 0.5 },
    { x: -halfBase, y: extent * 0.5 },
  ] as const;
}

function raySegmentDistance(
  dx: number,
  dy: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
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

function shapeBoundaryDistance(shape: LayoutShapeName, angle: number, extent: number): number {
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

export type PackedPosition = {
  x: number;
  y: number;
  r: number;
};

export function packEyePositions(
  radii: number[],
  clusterRadius: number,
  attempts: number,
  spiralStepDegrees: number,
  radialExponent: number,
  eyeSpiralOffset: number,
  shape: LayoutShapeName,
  jitter: number = 0, // 0 = perfect alignment, 1 = maximum organic disorder
): PackedPosition[] {
  const placed: PackedPosition[] = [];
  const safeClusterRadius = Math.max(clusterRadius, 0);
  const maxAttempts = Math.max(1, Math.min(Math.floor(attempts), 2048));
  const spiralStep = (spiralStepDegrees * Math.PI) / 180;
  const safeRadialExponent = Math.max(radialExponent, 0.01);
  const jitterAmount = Math.max(0, Math.min(jitter, 1)); // Clamp 0-1

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
      
      // Apply jitter to angle and distance for organic feel
      const jitterAngle = (hash01(i * 7.31) - 0.5) * jitterAmount * 0.4; // ±23° max
      const jitterDistance = (hash01(i * 13.7 + 5) - 0.5) * jitterAmount * 0.3; // ±15% max
      
      const finalAngle = angle + jitterAngle;
      const finalDistance = distance * (1 + jitterDistance);
      
      const candidateX = Math.cos(finalAngle) * finalDistance;
      const candidateY = Math.sin(finalAngle) * finalDistance;

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

    // If no valid position found, use best attempt OR spiral fallback
    if (!placedWithoutOverlap) {
      if (bestClearance > Number.NEGATIVE_INFINITY) {
        placed.push({ x: bestX, y: bestY, r: radius });
      } else {
        // Fallback: place on spiral anyway
        const angle = (i + 1) * eyeSpiralOffset;
        const boundaryDistance = shapeBoundaryDistance(shape, angle, safeClusterRadius);
        const distance = Math.max(0, boundaryDistance - radius) * ((i / radii.length) ** safeRadialExponent);
        placed.push({ 
          x: Math.cos(angle) * distance, 
          y: Math.sin(angle) * distance, 
          r: radius 
        });
      }
    }
  }

  return placed;
}

export function resolveEyeType(index: number, count: number, catMix: number): "cat" | "round" {
  return hash01(index * 2.187 + count * 0.713) < Math.max(0, Math.min(catMix, 1)) ? "cat" : "round";
}

export function staggerDelay(
  index: number,
  count: number,
  staggerSeconds: number,
  randomize: boolean,
): number {
  const step = Math.max(staggerSeconds, 0);
  if (randomize) {
    return hash01(index * 1.61803398875) * step * Math.max(count - 1, 0);
  }

  return (index - 1) * step;
}

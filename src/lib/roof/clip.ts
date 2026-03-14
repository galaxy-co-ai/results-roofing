/**
 * Sutherland-Hodgman polygon clipping against a half-plane.
 *
 * Clips a convex polygon to keep only the side of a line that contains
 * the `keepSide` point.
 *
 * @param polygon - Array of [x, z] vertices (convex, CCW or CW)
 * @param linePoint - A point on the clipping line [x, z]
 * @param lineDir - Direction vector of the clipping line [dx, dz]
 * @param keepSide - A point on the side to keep [x, z]
 * @returns Clipped polygon vertices
 */
export function clipPolygonByLine(
  polygon: [number, number][],
  linePoint: [number, number],
  lineDir: [number, number],
  keepSide: [number, number],
): [number, number][] {
  if (polygon.length < 3) return [];

  // Normal to the line (perpendicular to direction)
  const nx = -lineDir[1];
  const nz = lineDir[0];

  // Determine sign for the "keep" side
  const keepDot = nx * (keepSide[0] - linePoint[0]) + nz * (keepSide[1] - linePoint[1]);
  if (Math.abs(keepDot) < 1e-10) return polygon; // keepSide is on the line — no clip
  const keepSign = keepDot > 0 ? 1 : -1;

  function signedDist(p: [number, number]): number {
    return keepSign * (nx * (p[0] - linePoint[0]) + nz * (p[1] - linePoint[1]));
  }

  const output: [number, number][] = [];
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % n];
    const dCurr = signedDist(current);
    const dNext = signedDist(next);

    if (dCurr >= 0) {
      // Current is inside
      output.push(current);
      if (dNext < 0) {
        // Next is outside — add intersection
        output.push(intersect(current, next, dCurr, dNext));
      }
    } else if (dNext >= 0) {
      // Current outside, next inside — add intersection
      output.push(intersect(current, next, dCurr, dNext));
    }
  }

  return output;
}

function intersect(
  a: [number, number],
  b: [number, number],
  dA: number,
  dB: number,
): [number, number] {
  const t = dA / (dA - dB);
  return [
    a[0] + t * (b[0] - a[0]),
    a[1] + t * (b[1] - a[1]),
  ];
}

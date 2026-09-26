export interface ChartPoint {
  x: number;
  y: number;
}

/**
 * Builds an SVG path with monotone cubic interpolation.
 *
 * The extension renders its chart with recharts' `type='monotone'`, which is d3's
 * curveMonotoneX -- a Fritsch-Carlson spline that never overshoots the data. Plotting
 * plain cubics here would bulge past local minima and make the same series look
 * different from the extension, so the tangent rules are reproduced instead.
 */
export function buildMonotonePath(points: ChartPoint[]): string {
  if (!points.length) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  const n = points.length;
  const dxs: number[] = [];
  const dys: number[] = [];
  const slopes: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;

    dxs.push(dx);
    dys.push(dy);
    slopes.push(dx === 0 ? 0 : dy / dx);
  }

  // Tangents: one-sided at the ends, weighted harmonic mean inside, forced flat at
  // any point where the data turns, which is what keeps the curve monotone.
  const tangents: number[] = [slopes[0]];

  for (let i = 1; i < n - 1; i++) {
    const previous = slopes[i - 1];
    const current = slopes[i];

    if (previous * current <= 0) {
      tangents.push(0);
    } else {
      const dxPrevious = dxs[i - 1];
      const dxCurrent = dxs[i];
      const common = dxPrevious + dxCurrent;

      tangents.push((3 * common) / ((common + dxCurrent) / previous + (common + dxPrevious) / current));
    }
  }

  tangents.push(slopes[n - 2]);

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < n - 1; i++) {
    const third = dxs[i] / 3;
    const c1x = points[i].x + third;
    const c1y = points[i].y + tangents[i] * third;
    const c2x = points[i + 1].x - third;
    const c2y = points[i + 1].y - tangents[i + 1] * third;

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  return path;
}

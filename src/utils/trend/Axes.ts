import { DAY_MS } from "@/utils/Function";
import { BinPoint, BinSize } from "@/utils/trend/Types";

/**
 * Tick positions for TrendPlot's axes. Pure: no rendering.
 * See Types.ts for the units used.
 */

// Candidate y-axis steps, smallest first: 15s, 30s, 1m, 2m, 5m, 10m, 15m, 30m, 1h.
const Y_STEPS_MS = [15, 30, 60, 120, 300, 600, 900, 1800, 3600].map(
  (s) => s * 1000,
);
const MAX_Y_TICKS = 5;

const X_LABELS = 5;

/**
 * Picks round, minute-friendly y-axis ticks covering the highest value.
 *
 * @param peakMs - number: the highest completion time on the chart.
 * @returns yTicks - number[]: tick values from 0 up in equal steps, using the
 *   smallest step from Y_STEPS_MS that needs at most MAX_Y_TICKS steps.
 *   yMaxMs - number: the top of the axis, `peakMs` rounded up to a whole step.
 */
export function yAxisTicks(peakMs: number): {
  yTicks: number[];
  yMaxMs: number;
} {
  const yStep =
    Y_STEPS_MS.find((step) => peakMs / step <= MAX_Y_TICKS) ??
    Y_STEPS_MS[Y_STEPS_MS.length - 1];
  const yMaxMs = Math.ceil(Math.max(peakMs, 1) / yStep) * yStep;
  const yTicks = Array.from(
    { length: yMaxMs / yStep + 1 },
    (_, k) => k * yStep,
  );
  return { yTicks, yMaxMs };
}

/**
 * Picks the dates labelled on the x axis.
 *
 * @param binSize - BinSize: daily bins label every point; others get
 *   X_LABELS evenly spaced dates.
 * @param points - BinPoint[]: the plotted points (used for daily labels).
 * @param xMinMs - number: the left end of the axis.
 * @param xMaxMs - number: the right end of the axis.
 * @returns number[]: label dates, oldest first, without duplicates.
 */
export function xAxisTicks(
  binSize: BinSize,
  points: BinPoint[],
  xMinMs: number,
  xMaxMs: number,
): number[] {
  if (binSize === "day") return points.map((p) => p.dateMs);
  return [
    ...new Set(
      Array.from(
        { length: X_LABELS },
        (_, k) =>
          xMinMs +
          Math.round(((xMaxMs - xMinMs) * k) / (X_LABELS - 1) / DAY_MS) *
            DAY_MS,
      ),
    ),
  ];
}

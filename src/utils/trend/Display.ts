import { BinPoint, BinSize, Timeframe } from "@/utils/trend/Types";

/**
 * Display text shared by the TrendChart parts (header, plot, selector).
 * Trend colors live in the stylesheets as Tailwind `red` (slower) and
 * `green-600` (faster). See Types.ts for the units used.
 */

/** Header title for what each point aggregates. */
export const BIN_TITLES: Record<BinSize, string> = {
  day: "Daily Time",
  week: "Weekly Median",
  month: "Monthly Median",
};

/** Text after the change in the header when nothing is hovered. */
export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  "1W": "Past Week",
  "1M": "Past Month",
  "6M": "Past 6 Months",
  YTD: "Year to Date",
  ALL: "All Time",
};

/**
 * @param dateMs - number: a date.
 * @returns string: short month and day in UTC, e.g. "Jul 8".
 */
export const formatDate = (dateMs: number): string =>
  new Date(dateMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/**
 * @param binSize - BinSize: what the point aggregates.
 * @param point - BinPoint: the hovered point.
 * @returns string: the point's period, e.g. "Oct 8" or "Sep 1 – Sep 30",
 *   with " · No games" when its value was filled in for display.
 */
export function formatPeriod(binSize: BinSize, point: BinPoint): string {
  const period =
    binSize === "day"
      ? formatDate(point.binEndMs)
      : `${formatDate(point.binStartMs)} – ${formatDate(point.binEndMs)}`;
  return point.count ? period : `${period} · No games`;
}

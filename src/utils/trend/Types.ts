/**
 * Shared types for the completion-time trend: produced by buildTrend
 * (BuildTrends.ts) and drawn by TrendChart.
 *
 * Window/Timeframe = domain of the line graph
 * Bin              = interval for which a median is calculated
 *
 * All dates are UTC midnights as epoch milliseconds, matching the daily deal
 * dates; all durations (`timeMs`) are completion times in milliseconds.
 */

/** The timeframes a player can select, in display order. */
export const TIMEFRAMES = ["1W", "1M", "6M", "YTD", "ALL"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

/** How much time one point on the line aggregates. */
export type BinSize = "day" | "week" | "month";

/** What one data point on the line represents in each timeframe. */
export const TIMEFRAME_BIN_SIZE: Record<Timeframe, BinSize> = {
  "1W": "day",
  "1M": "week",
  "6M": "month",
  YTD: "month",
  ALL: "month",
};

/**
 * A value plotted at a date.
 * - dateMs: number, the x position (a date).
 * - timeMs: number, the y value, a completion time in milliseconds.
 */
export type TrendPoint = { dateMs: number; timeMs: number };

/**
 * A point aggregated over one bin. `dateMs` equals `binEndMs`.
 * - binStartMs, binEndMs: number, the bin's first and last day (inclusive).
 * - count: number, games played in the bin. 0 means `timeMs` was filled in for
 *   display only and isn't a real result.
 */
export type BinPoint = TrendPoint & {
  binStartMs: number;
  binEndMs: number;
  count: number;
};

/** What buildTrend returns: everything TrendChart needs to draw one window. */
export type Trend = {
  /** BinSize: what each point aggregates (day, week or month). */
  binSize: BinSize;
  /** number: first day of the selected window. */
  windowStartMs: number;
  /** number: last day of the selected window (today). */
  windowEndMs: number;
  /** BinPoint[]: one point per bin, oldest first; the markers on the line. */
  points: BinPoint[];
  /**
   * TrendPoint[]: the player's line. `points`, plus a leading point at
   * windowStartMs when the first bin ends after it, so the line spans the
   * whole window.
   */
  series: TrendPoint[];
  /** number: the line's value at the window's start (baseline for change). */
  firstTimeMs: number;
  /** number: the line's latest value. */
  lastTimeMs: number;
  /**
   * TrendPoint[]: the global median line, binned like `series` and at the
   * same dates. Empty when there's no global data (e.g. still loading).
   */
  medianSeries: TrendPoint[];
};

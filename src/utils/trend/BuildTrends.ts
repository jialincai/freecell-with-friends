import type { GlobalDailyMedian, UserCompletionTime } from "@/lib/db/games";
import { DAY_MS } from "@/utils/Function";
import {
  BinPoint,
  BinSize,
  Timeframe,
  TIMEFRAME_BIN_SIZE,
  Trend,
  TrendPoint,
} from "@/utils/trend/Types";

/**
 * Builds the completion-time trend for TrendChart.
 * Pure: no React, rendering or fetching. See Types.ts for the terms used.
 *
 * Exports: buildTrend. Everything under "Helpers" is private to this module.
 */

/**
 * Turns a player's completion history, and the global daily medians, into the
 * series for one timeframe.
 *
 * Both lines are binned the same way: each bin's value is the median of the
 * daily values in it (the player's daily times, or the global daily medians).
 * Bins with no values are filled for display only (count 0): before the
 * first filled bin they take its value, after it they repeat the previous
 * bin's value.
 *
 * @param data - UserCompletionTime[]: the player's completed games, one per
 *   date. Must be non-empty and sorted by date ascending, as returned by
 *   GET /api/user/completions.
 * @param globalMedians - GlobalDailyMedian[]: the median across all players
 *   per day, sorted by date ascending, as returned by GET /api/game/medians.
 *   May be empty (e.g. still loading); the global line is then empty too.
 * @param timeframe - Timeframe: the selected window (1W, 1M, 6M, YTD, ALL).
 * @param todayMs - number: today; the window ends here.
 * @returns Trend: the window, its bins as points, and the player and global
 *   median lines.
 */
export function buildTrend(
  data: UserCompletionTime[],
  globalMedians: GlobalDailyMedian[],
  timeframe: Timeframe,
  todayMs: number,
): Trend {
  const binSize = TIMEFRAME_BIN_SIZE[timeframe];
  const windowStartMs = windowStart(
    timeframe,
    todayMs,
    Date.parse(data[0].date),
  );
  const windowEndMs = Math.max(todayMs, windowStartMs + DAY_MS);
  const bins = binRanges(binSize, windowStartMs, windowEndMs);

  const player = binDaily(
    bins,
    data.map((g) => ({
      dateMs: Date.parse(g.date),
      timeMs: g.elapsed_time_ms,
    })),
    windowStartMs,
  );
  const global = binDaily(
    bins,
    globalMedians.map((g) => ({
      dateMs: Date.parse(g.date),
      timeMs: g.median_ms,
    })),
    windowStartMs,
  );

  // `data` is non-empty, so the player's line always has points.
  const { points, series } = player!;
  return {
    binSize,
    windowStartMs,
    windowEndMs,
    points,
    series,
    firstTimeMs: series[0].timeMs,
    lastTimeMs: series[series.length - 1].timeMs,
    medianSeries: global?.series ?? [],
  };
}

// ---------------------------------------------------------------------------
// Helpers (not exported)
// ---------------------------------------------------------------------------

/**
 * Steps a date back by whole calendar months, in UTC.
 *
 * @param dateMs - number: the starting date.
 * @param months - number: how many calendar months to go back. Going past
 *   January rolls into the previous year (Jan 15 - 1 month -> Dec 15).
 * @returns number: the same day of the month, `months` months earlier. If
 *   that month is too short, the day is clamped to its last day
 *   (Mar 31 - 1 month -> Feb 28). Any time of day in `dateMs` is dropped.
 */
function monthsBefore(dateMs: number, months: number): number {
  const d = new Date(dateMs);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() - months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(d.getUTCDate(), lastDay));
}

function windowStart(tf: Timeframe, todayMs: number, firstMs: number) {
  switch (tf) {
    case "1W":
      return todayMs - 6 * DAY_MS; // 7 days including today
    case "1M":
      return monthsBefore(todayMs, 1);
    case "6M":
      return monthsBefore(todayMs, 6);
    case "YTD":
      return Date.UTC(new Date(todayMs).getUTCFullYear(), 0, 1);
    case "ALL":
      return firstMs;
  }
}

// Consecutive bins (inclusive) covering the window.
function binRanges(
  binSize: BinSize,
  windowStartMs: number,
  windowEndMs: number,
) {
  const bins: { binStartMs: number; binEndMs: number }[] = [];
  if (binSize === "day") {
    for (let day = windowStartMs; day <= windowEndMs; day += DAY_MS) {
      bins.push({ binStartMs: day, binEndMs: day });
    }
  } else if (binSize === "week") {
    for (let end = windowEndMs; end >= windowStartMs; end -= 7 * DAY_MS) {
      bins.unshift({
        binStartMs: Math.max(end - 6 * DAY_MS, windowStartMs),
        binEndMs: end,
      });
    }
  } else {
    const d = new Date(windowStartMs);
    const year = d.getUTCFullYear();
    let month = d.getUTCMonth();
    while (Date.UTC(year, month, 1) <= windowEndMs) {
      bins.push({
        binStartMs: Math.max(Date.UTC(year, month, 1), windowStartMs),
        binEndMs: Math.min(Date.UTC(year, month + 1, 0), windowEndMs),
      });
      month++;
    }
  }
  return bins;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Bins a one-value-per-day series and fills empty bins for display.
 *
 * @param bins - the window's bins, oldest first (from binRanges).
 * @param daily - TrendPoint[]: one value per date, sorted by date ascending.
 *   Values outside the bins are ignored except as a fallback (below).
 * @param windowStartMs - number: the window's start; the series gets a
 *   leading point here when the first bin ends later, so it spans the window.
 * @returns points - BinPoint[]: one per bin. A bin's value is the median of
 *   its daily values; empty bins (count 0) take the first filled bin's value
 *   before it and repeat the previous value after it. If no bin has values,
 *   all take the last daily value before the window.
 *   series - TrendPoint[]: `points`, plus the leading point if needed.
 *   Returns null when `daily` is empty, so there's nothing to show.
 */
function binDaily(
  bins: { binStartMs: number; binEndMs: number }[],
  daily: TrendPoint[],
  windowStartMs: number,
): { points: BinPoint[]; series: TrendPoint[] } | null {
  if (daily.length === 0) return null;

  const stats = bins.map((b) => {
    const values = daily
      .filter((d) => d.dateMs >= b.binStartMs && d.dateMs <= b.binEndMs)
      .map((d) => d.timeMs);
    return {
      count: values.length,
      value: values.length ? median(values) : null,
    };
  });

  let carry =
    stats.find((st) => st.value !== null)?.value ??
    daily[daily.length - 1].timeMs;
  const points: BinPoint[] = bins.map((b, i) => {
    carry = stats[i].value ?? carry;
    return { ...b, count: stats[i].count, dateMs: b.binEndMs, timeMs: carry };
  });

  const series: TrendPoint[] =
    points[0].dateMs > windowStartMs
      ? [{ dateMs: windowStartMs, timeMs: points[0].timeMs }, ...points]
      : points;
  return { points, series };
}

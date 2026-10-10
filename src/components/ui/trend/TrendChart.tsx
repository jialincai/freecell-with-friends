"use client";

import { useState } from "react";
import useSWR from "swr";
import type { GlobalDailyMedian, UserCompletionTime } from "@/lib/db/games";
import { getCurrentUTCDateString } from "@/utils/Function";
import { fetcher } from "@/utils/fetcher";
import { buildTrend } from "@/utils/trend/BuildTrends";
import { Timeframe } from "@/utils/trend/Types";
import { BIN_TITLES, TIMEFRAME_LABELS } from "@/utils/trend/Display";
import TrendHeader from "@/components/ui/trend/TrendHeader";
import TrendPlot, { PLOT_INSET_VARS } from "@/components/ui/trend/TrendPlot";
import TimeframeSelector from "@/components/ui/trend/TimeframeSelector";
import styles from "@/styles/ui/trend/TrendChart.module.css";

// Fewer completions than this and the trend isn't meaningful yet.
const MIN_GAMES = 7;

/**
 * The logged-in player's completion-time trend, with a timeframe selector.
 *
 * Fetches GET /api/user/completions and GET /api/game/medians once each
 * (every timeframe is binned from them on the client), builds the series
 * with buildTrend, and
 * holds the selected timeframe and hovered point; TrendHeader, TrendPlot and
 * TimeframeSelector only display them. Shows a "complete N more games"
 * message until the player has MIN_GAMES completions.
 *
 * Layout: must be a child of a 3-column grid (StatsPageUser.module.css
 * `.statsGrid`). It spans all columns and puts its header in the centre one,
 * lining it up with whatever sits there (the stat row).
 */
const TrendChart = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [hovered, setHovered] = useState<number | null>(null);
  const { data } = useSWR<UserCompletionTime[] | null>(
    "/api/user/completions",
    (url: string) => fetcher(url, { silentCodes: [401] }),
  );
  // Global line; the chart shows without it until this loads.
  const { data: globalMedians } = useSWR<GlobalDailyMedian[]>(
    "/api/game/medians",
    (url: string) => fetcher(url),
  );

  if (!data) return <p className={styles.message}>Loading...</p>;
  if (data.length < MIN_GAMES) {
    const remaining = MIN_GAMES - data.length;
    return (
      <p className={styles.message}>
        Complete {remaining} more {remaining === 1 ? "game" : "games"} to see
        your completion time trend.
      </p>
    );
  }

  const trend = buildTrend(
    data,
    globalMedians ?? [],
    timeframe,
    Date.parse(getCurrentUTCDateString()),
  );
  // The whole window's direction; stays fixed while hovering.
  const slower = trend.lastTimeMs > trend.firstTimeMs;

  return (
    <figure className={styles.figure} style={PLOT_INSET_VARS}>
      <TrendHeader
        binSize={trend.binSize}
        timeframe={timeframe}
        firstTimeMs={trend.firstTimeMs}
        lastTimeMs={trend.lastTimeMs}
        active={hovered !== null ? trend.points[hovered] : undefined}
        showGlobalLabel={trend.medianSeries.length > 0}
      />
      <TrendPlot
        trend={trend}
        slower={slower}
        hovered={hovered}
        onHover={setHovered}
        ariaLabel={`${BIN_TITLES[trend.binSize]} completion time, ${TIMEFRAME_LABELS[timeframe]}`}
      />
      <TimeframeSelector
        value={timeframe}
        onChange={(tf) => {
          setTimeframe(tf);
          setHovered(null);
        }}
        slower={slower}
      />
    </figure>
  );
};

export default TrendChart;

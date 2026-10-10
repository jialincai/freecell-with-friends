import { formatTime } from "@/utils/Function";
import { BinPoint, BinSize, Timeframe } from "@/utils/trend/Types";
import {
  BIN_TITLES,
  formatPeriod,
  TIMEFRAME_LABELS,
} from "@/utils/trend/Display";
import styles from "@/styles/ui/trend/TrendHeader.module.css";

type TrendHeaderProps = {
  /** BinSize: picks the title (Daily Time, Weekly Median, ...). */
  binSize: BinSize;
  /** Timeframe: labels the change when nothing is hovered. */
  timeframe: Timeframe;
  /** number: the value the change is measured from (the window's start). */
  firstTimeMs: number;
  /** number: the latest value, shown when nothing is hovered. */
  lastTimeMs: number;
  /** BinPoint, optional: the hovered point, shown instead of the latest. */
  active?: BinPoint;
  /** boolean: show the GLOBAL MEDIAN label (when its line is drawn). */
  showGlobalLabel: boolean;
};

/**
 * TrendChart's header: title, the shown value, its change since the window's
 * start, and the global median label. In HTML (not SVG) so its text matches
 * the stat blocks regardless of how far the plot is scaled.
 */
const TrendHeader = ({
  binSize,
  timeframe,
  firstTimeMs,
  lastTimeMs,
  active,
  showGlobalLabel,
}: TrendHeaderProps) => {
  const shownTimeMs = active?.timeMs ?? lastTimeMs;
  const diffMs = shownTimeMs - firstTimeMs;
  const change = (diffMs / firstTimeMs) * 100;
  const periodLabel = active
    ? formatPeriod(binSize, active)
    : TIMEFRAME_LABELS[timeframe];

  return (
    <div className={styles.header}>
      <span className={styles.title}>{BIN_TITLES[binSize]}</span>
      <span className={styles.value}>{formatTime(shownTimeMs)}</span>
      <span
        className={`${styles.change} ${
          diffMs > 0 ? styles.slower : styles.faster
        }`}
      >
        {`${change > 0 ? "▲ +" : "▼ "}${formatTime(Math.abs(diffMs))} `}
        {`(${change > 0 ? "+" : ""}${Math.abs(change).toFixed(1)}%) `}
        <span className={styles.period}>{periodLabel}</span>
      </span>
      {showGlobalLabel && (
        <span className={styles.globalLabel}>GLOBAL MEDIAN</span>
      )}
    </div>
  );
};

export default TrendHeader;

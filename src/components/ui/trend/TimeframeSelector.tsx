import { Timeframe, TIMEFRAMES } from "@/utils/trend/Types";
import styles from "@/styles/ui/trend/TimeframeSelector.module.css";

type TimeframeSelectorProps = {
  /** Timeframe: the selected option. */
  value: Timeframe;
  /** Called with the option the player picks. */
  onChange: (timeframe: Timeframe) => void;
  /** boolean: the player got slower over the window; colors the selection. */
  slower: boolean;
};

/**
 * The row of timeframe buttons (1W, 1M, 6M, YTD, ALL) under the plot.
 * Lines up with the plot area via the --plot-inset-* variables TrendChart
 * sets (see TrendPlot's PLOT_INSET_VARS).
 */
const TimeframeSelector = ({
  value,
  onChange,
  slower,
}: TimeframeSelectorProps) => {
  const selectedStyle = `
    ${styles.timeframeButtonSelected} 
    ${slower ? styles.timeframeButtonSlower : styles.timeframeButtonFaster}
  `;

  return (
    <div className={styles.timeframeSelector}>
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`
            ${styles.timeframeButton}
            ${tf === value ? selectedStyle : ""}
          `}
        >
          {tf}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;

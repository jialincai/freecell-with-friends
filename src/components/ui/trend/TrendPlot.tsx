import { useId, type CSSProperties } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";
import { scaleLinear, scaleUtc } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { formatTime } from "@/utils/Function";
import { Trend, TrendPoint } from "@/utils/trend/Types";
import { xAxisTicks, yAxisTicks } from "@/utils/trend/Axes";
import { formatDate } from "@/utils/trend/Display";
import styles from "@/styles/ui/trend/TrendPlot.module.css";

const WIDTH = 560;
const HEIGHT = 264;
const PAD = { top: 20, right: 52, bottom: 24, left: 52 };

/**
 * CSS variables for the plot area's left and right inset, as percentages of
 * the plot's width (they scale with the SVG). Set on a parent so HTML can
 * line up with the plot area, e.g. `padding-left: var(--plot-inset-left)`.
 */
export const PLOT_INSET_VARS = {
  "--plot-inset-left": `${(PAD.left / WIDTH) * 100}%`,
  "--plot-inset-right": `${(PAD.right / WIDTH) * 100}%`,
} as CSSProperties;

// Opacity of the parts of the graph outside the hovered period.
const MUTED_OPACITY = 0.3;

// visx axis labels default to Arial 10px; inherit the page font instead.
// Color and size come from the .axisLabel class.
const AXIS_LABEL = {
  className: styles.axisLabel,
  fontFamily: "inherit",
  fontSize: 12,
};

type TrendPlotProps = {
  /** Trend: the series to draw, from buildTrend. */
  trend: Trend;
  /** boolean: the player got slower over the window; colors their line. */
  slower: boolean;
  /** number | null: index into trend.points of the hovered point. */
  hovered: number | null;
  /** Called with the nearest point's index on hover, or null on leave. */
  onHover: (index: number | null) => void;
  /** string: accessible description of the plot. */
  ariaLabel: string;
};

/**
 * The SVG plot, built from visx scales, line paths and axes: the player's
 * line with square markers, and the global median line. Hovering or dragging reports the nearest point; while
 * one is hovered, everything outside its period is muted.
 */
const TrendPlot = ({
  trend,
  slower,
  hovered,
  onHover,
  ariaLabel,
}: TrendPlotProps) => {
  // Strip characters (e.g. ":") that aren't safe inside url(#...).
  const clipId = "hover-" + useId().replace(/[^\w-]/g, "");
  const {
    binSize,
    windowStartMs,
    windowEndMs,
    points,
    series,
    medianSeries,
    firstTimeMs,
  } = trend;

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  // The x axis currently spans exactly the selected window.
  const xScale = scaleUtc({
    domain: [windowStartMs, windowEndMs],
    range: [0, plotW],
  });
  const xLabels = xAxisTicks(binSize, points, windowStartMs, windowEndMs);

  const { yTicks, yMaxMs } = yAxisTicks(
    Math.max(
      ...series.map((p) => p.timeMs),
      ...medianSeries.map((p) => p.timeMs),
    ),
  );
  const yScale = scaleLinear({ domain: [0, yMaxMs], range: [plotH, 0] });

  const x = (p: TrendPoint) => xScale(p.dateMs);
  const y = (p: TrendPoint) => yScale(p.timeMs);

  const active = hovered !== null ? points[hovered] : undefined;
  // The hovered segment and marker are colored by the hovered point's change
  // since the window's start (like the header); the rest keeps the window's.
  const activeTrendClass =
    active && active.timeMs > firstTimeMs ? styles.slower : styles.faster;
  // The hovered point's segment runs from the previous point to it.
  const segmentStartMs =
    hovered !== null && hovered > 0
      ? points[hovered - 1].dateMs
      : windowStartMs;

  // Nearest point to the pointer's x position.
  const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const pointerX = (localPoint(e)?.x ?? 0) - PAD.left;
    let nearest = 0;
    points.forEach((p, i) => {
      const distance = Math.abs(x(p) - pointerX);
      if (distance < Math.abs(x(points[nearest]) - pointerX)) nearest = i;
    });
    onHover(nearest);
  };

  const lines = (
    <>
      {/* median of all players, drawn behind the player line */}
      <LinePath
        data={medianSeries}
        x={x}
        y={y}
        className={`${styles.line} ${styles.medianLine}`}
      />
      <LinePath
        data={series}
        x={x}
        y={y}
        className={`${styles.line} ${styles.playerLine}`}
      />
    </>
  );

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={`${styles.plot} ${slower ? styles.slower : styles.faster}`}
      role="img"
      aria-label={ariaLabel}
    >
      <Group left={PAD.left} top={PAD.top}>
        <AxisLeft
          scale={yScale}
          tickValues={yTicks}
          tickFormat={(timeMs) => formatTime(Number(timeMs))}
          hideAxisLine
          hideTicks
          tickLabelProps={() => ({
            ...AXIS_LABEL,
            textAnchor: "end",
            verticalAnchor: "middle",
          })}
        />
        <AxisBottom
          top={plotH}
          scale={xScale}
          tickValues={xLabels}
          tickFormat={(dateMs) => formatDate(Number(dateMs))}
          tickLength={4}
          axisLineClassName={styles.axisLine}
          tickLineProps={{ className: styles.axisLine }}
          tickLabelProps={(_, k, all) => ({
            ...AXIS_LABEL,
            dy: 2,
            textAnchor:
              k === 0 ? "start" : k === all.length - 1 ? "end" : "middle",
          })}
        />

        {/* While hovering, lines are muted except the hovered period's
            segment, which is redrawn on top at full strength. */}
        {active && (
          <clipPath id={clipId}>
            <rect
              x={xScale(segmentStartMs)}
              y={-PAD.top}
              width={xScale(active.dateMs) - xScale(segmentStartMs)}
              height={HEIGHT}
            />
          </clipPath>
        )}
        <g opacity={active ? MUTED_OPACITY : 1}>{lines}</g>
        {active && (
          <g clipPath={`url(#${clipId})`} className={activeTrendClass}>
            {lines}
          </g>
        )}

        {/* square markers: solid where played and hollow where filled in */}
        {points.map((p, i) => {
          const size = hovered === i ? 9 : 7;
          return (
            <rect
              key={p.dateMs}
              x={x(p) - size / 2}
              y={y(p) - size / 2}
              width={size}
              height={size}
              className={`${styles.marker} ${
                p.count ? styles.markerSolid : styles.markerHollow
              } ${hovered === i ? activeTrendClass : ""}`}
              opacity={active && hovered !== i ? MUTED_OPACITY : 1}
            />
          );
        })}

        {/* scrub area over the plot */}
        <rect
          width={plotW}
          height={plotH}
          className={styles.scrubArea}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => onHover(null)}
        />
      </Group>
    </svg>
  );
};

export default TrendPlot;

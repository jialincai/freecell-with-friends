import { StatsState } from "@phaser/stats/state/StatsState";
import { Stats } from "../state/Stats";

export function withPauseTime(
  state: StatsState,
  pauseTime: number,
): StatsState {
  return { ...state, pauseTime: pauseTime };
}

export function withStartTime(
  state: StatsState,
  startTime: number,
): StatsState {
  return { ...state, startTime: startTime };
}

export function serializeStats(stats: Stats): string {
  return JSON.stringify(stats);
}

export function deserializeStats(json: string): Stats | null {
  try {
    const parsed = JSON.parse(json);

    if (
      typeof parsed?.data?.seed === "number" &&
      typeof parsed?.state?.startTime === "number" &&
      typeof parsed?.state?.pauseTime === "number"
    ) {
      return parsed as Stats;
    }
  } catch {
    console.warn("Failed to deserialize stats");
  }

  return null;
}

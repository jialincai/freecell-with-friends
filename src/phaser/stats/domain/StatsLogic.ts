import { StatsState } from "@phaser/stats/state/StatsState";

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

import { StatState } from "@phaser/stat/Stat";
import { Stat } from "@phaser/stat/Stat";

export function withPauseTime(
  state: StatState,
  pauseTime: number,
): StatState {
  return { ...state, pauseTime: pauseTime };
}

export function withStartTime(
  state: StatState,
  startTime: number,
): StatState {
  return { ...state, startTime: startTime };
}

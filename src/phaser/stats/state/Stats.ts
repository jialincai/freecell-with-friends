import { StatsData } from "@phaser/stats/StatsData";
import { StatsState } from "@phaser/stats/state/StatsState";

export type Stats = {
  data: StatsData;
  state: StatsState;
};

export function createStats(
  seed: number,
  startTime: number,
  pauseTime: number,
): Stats {
  return {
    data: {
      seed,
    },
    state: {
      startTime,
      pauseTime,
    },
  };
}

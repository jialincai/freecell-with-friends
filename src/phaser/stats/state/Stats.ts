import { StatsData } from "@phaser/stats/StatsData";
import { StatsState } from "@phaser/stats/state/StatsState";

export type Stats = {
  data: StatsData;
  state: StatsState;
};

export function createStats(seed: number, startTime: number, pauseTime: number): Stats {
  return {
    data: { seed },
    state: { startTime, pauseTime },
  };
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

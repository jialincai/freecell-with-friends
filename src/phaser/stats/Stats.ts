export type StatsData = {
  seed: number;
};

export type StatsState = {
  startTime: number;
  pauseTime: number;
};


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
    data: { seed },
    state: { startTime, pauseTime },
  };
}

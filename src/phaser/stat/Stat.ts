export type StatData = {
  seed: number;
};

export type StatState = {
  startTime: number;
  pauseTime: number;
};

export type Stat = {
  data: StatData;
  state: StatState;
};

export function createStat(
  seed: number,
  startTime: number,
  pauseTime: number,
): Stat {
  return {
    data: { seed },
    state: { startTime, pauseTime },
  };
}

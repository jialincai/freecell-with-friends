export type MetaData = {
  version: string;
  seed: number;
};

export type MetaState = {
  isComplete: boolean;
};

export type Meta = {
  data: MetaData;
  state: MetaState;
};

export function createMeta(
  version: string,
  seed: number,
  isComplete: boolean,
): Meta {
  return {
    data: { version, seed },
    state: { isComplete },
  };
}

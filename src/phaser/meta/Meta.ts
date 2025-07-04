export type MetaData = {
  version: string;
  seed: number;
};

export type MetaState = {
  complete: boolean;
};

export type Meta = {
  data: MetaData;
  state: MetaState;
};

export function createMeta(
  version: string,
  seed: number,
  complete: boolean,
): Meta {
  return {
    data: { version, seed },
    state: { complete },
  };
}

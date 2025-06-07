export const SAVE_VERSION = 1;
export const SAVE_KEY = "freecellwithfriends_save";

export interface ISaveChunk<T> {
  id: string;
  save(): T;
  load(data: T): void;
}

export type SaveData = {
  version: number;
};

export type SaveState = {
  chunks: Record<string, unknown>;
};

export type Save = {
  data: SaveData;
  state: SaveState;
};

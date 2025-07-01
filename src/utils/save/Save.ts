export const SAVE_VERSION = "1.0.0";
export const SAVE_KEY = "freecellwithfriends_save";

export type SaveData = {
  version: string;
};

export type SaveState = {
  chunks: Record<string, any>;
};

export type Save = {
  data: SaveData;
  state: SaveState;
};

export const createSave = (): Save => ({
  data: { version: SAVE_VERSION },
  state: { chunks: {} },
});

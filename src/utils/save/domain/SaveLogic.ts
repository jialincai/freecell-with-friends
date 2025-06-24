import { Save, SaveState, SAVE_VERSION } from "@utils/save/Save";
import { SaveableRegistry, ISaveable } from "@utils/save/ISaveable";

export function withSaveable(
  registry: SaveableRegistry,
  saveable: ISaveable<any>,
): SaveableRegistry {
  return {
    ...registry,
    [saveable.id]: saveable,
  };
}

export function serializeChunks(chunks: SaveableRegistry): Save {
  const state: SaveState = { chunks: {} };
  for (const [id, chunk] of Object.entries(chunks)) {
    state.chunks[id] = chunk.getSnapshot();
  }

  return {
    data: {
      version: SAVE_VERSION,
    },
    state,
  };
}

export function deserializeChunks(
  save: Save,
  keys: readonly string[],
): Record<string, unknown> {
  const result = {} as Record<string, unknown>;

  if (save.data.version !== SAVE_VERSION) {
    console.warn("Save version mismatch — ignoring load.");
    return result;
  }

  for (const key of keys) {
    const data = save.state.chunks[key];
    if (data !== undefined) {
      result[key] = data;
    }
  }

  return result;
}

import { ISaveChunk, Save, SaveState, SAVE_VERSION } from "@utils/save/Save";

export function serializeChunks(chunks: Record<string, ISaveChunk<unknown>>): Save {
  const state: SaveState = { chunks: {} };
  for (const [id, chunk] of Object.entries(chunks)) {
    state.chunks[id] = chunk.save();
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
  keys: readonly string[]
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
import { SAVE_KEY } from "@utils/save/Save";
import { withSaveable, deserializeChunks, serializeChunks } from "@utils/save/domain/SaveLogic";
import type { Save } from "@utils/save/Save";
import type { SaveableRegistry, ISaveable } from "@utils/save/ISaveable";

class SaveController {
  public registry: SaveableRegistry;
  public save: Save;

  constructor(registry: SaveableRegistry, save: Save) {
    this.registry = registry;
    this.save = save;
  }

  registerSaveable(saveable: ISaveable<any>) {
    this.registry = withSaveable(this.registry, saveable);
  }

  saveToStorage() {
    const save = serializeChunks(this.registry);
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }

  loadFromStorage() {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return;

    try {
      const save = JSON.parse(json) as Save;
      const data = deserializeChunks(save, Object.keys(this.registry));

      for (const [key, value] of Object.entries(data)) {
        this.registry[key]?.loadFromSnapshot(value);
      }
    } catch (e) {
      console.warn("Failed to load save file.");
    }
  }
}

export default SaveController;

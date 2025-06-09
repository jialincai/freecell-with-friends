import { ISaveable } from "@utils/save/ISaveable";
import { Stat } from "@phaser/stat/Stat";

export class StatSaveable implements ISaveable<Stat> {
  public id = "stats";
  public ref: Stat;

  constructor(stats: Stat) {
    this.ref = stats;
  }

  getSnapshot(): Stat {
    return structuredClone(this.ref);
  }

  loadFromSnapshot(data: Stat): void {
    this.ref.data = { ...data.data };
    this.ref.state = { ...data.state };
  }
}

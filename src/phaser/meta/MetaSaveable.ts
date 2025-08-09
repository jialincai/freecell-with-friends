import { ISaveable } from "@/utils/save/ISaveable";
import { Meta } from "@/phaser/meta/Meta";

class MetaSaveable implements ISaveable<Meta> {
  public id = "meta";

  constructor(
    public get: () => Meta,
    public set: (data: Meta) => void,
  ) {}

  getSnapshot(): Meta {
    return structuredClone(this.get());
  }

  loadFromSnapshot(data: Meta): void {
    this.set(data);
  }
}

export default MetaSaveable;

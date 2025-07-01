import { ISaveable } from "@utils/save/ISaveable";
import { Meta } from "@phaser/meta/Meta";

export class MetaSaveable implements ISaveable<Meta> {
  public id = "meta";
  public ref: Meta;

  constructor(state: Meta) {
    this.ref = state;
  }

  getSnapshot(): Meta {
    return structuredClone(this.ref);
  }

  loadFromSnapshot(data: Meta): void {
    this.ref.data = { ...data.data };
    this.ref.state = { ...data.state };
  }
}

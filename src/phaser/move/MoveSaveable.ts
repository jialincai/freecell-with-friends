import { ISaveable } from "@utils/save/ISaveable";
import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@phaser/move/CardMoveSequence";

class MoveSaveable implements ISaveable<CardMoveSequence[]> {
  public id = "move";

  constructor(
    public get: () => CardMoveSequence[],
    public set: (data: CardMoveSequence[]) => void,
  ) {}

  getSnapshot(): CardMoveSequence[] {
    return structuredClone(this.get());
  }

  loadFromSnapshot(data: CardMoveSequence[]): void {
    const cleaned = data.map((seq) => createCardMoveSequence(seq.steps));
    this.set(cleaned);
  }
}

export default MoveSaveable;

import { ISaveable } from "@utils/save/ISaveable";
import { CardMoveSequence } from "@phaser/move/CardMoveSequence";
import { PubSubStack } from "@utils/Function";

class MoveSaveable implements ISaveable<CardMoveSequence[]> {
  public id: string;
  public ref: PubSubStack<CardMoveSequence>;

  constructor(moveHistory: PubSubStack<CardMoveSequence>) {
    this.id = "move";
    this.ref = moveHistory;
  }

  getSnapshot(): CardMoveSequence[] {
    return this.ref.toArray();
  }

  loadFromSnapshot(data: CardMoveSequence[]): void {
    this.ref.clear();
    for (const move of data) {
      this.ref.push(move);
    }
  }
}

export default MoveSaveable;

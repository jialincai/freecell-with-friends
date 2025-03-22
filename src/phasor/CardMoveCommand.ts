import { Command } from "@utils/Function";

import Card from "./Card";
import { PileId } from "./constants/table";

export class CardMoveCommand implements Command {
  constructor(
    public readonly card: Card,
    public readonly source: PileId,
    public readonly p1: number,
    public readonly destination: PileId,
    public readonly p2: number,
  ) {}

  do(): void {
    this.card.reposition(this.destination, this.p2);
  }

  undo(): void {
    this.card.reposition(this.source, this.p1);
  }
}

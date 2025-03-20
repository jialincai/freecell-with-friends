import { Command } from "@utils/Functions";

import Card from "./Card";
import { PileId } from "./constants/table";

export class CardMoveCommand implements Command {
  constructor(
    private card: Card,
    private source: PileId,
    private p1: number,
    private destination: PileId,
    private p2: number,
  ) {}

  do(): void {
    this.card.reposition(this.destination, this.p2);
  }

  undo(): void {
    this.card.reposition(this.source, this.p1);
  }
}

import Phaser from "phaser";

import { PileId } from "@phasor/constants/table";
import { Deck } from "@phasor/deck/state/Deck";

import { CardController } from "@phasor/card/controller/CardController";

export class DeckController {
  constructor(
    public readonly model: Deck,
    public readonly cardControllers: CardController[],
  ) {}

  getCards(): CardController[] {
    return this.cardControllers;
  }

  getCardChildren(card: CardController): CardController[] {
    const { pile, position } = card.model.state;
    return this.cardControllers.filter(
      (c) => c.model.state.pile === pile && c.model.state.position >= position,
    );
  }

  getPileChildren(pileId: PileId): CardController[] {
    return this.cardControllers
      .filter((c) => c.model.state.pile === pileId)
      .sort((a, b) => a.model.state.position - b.model.state.position);
  }
}

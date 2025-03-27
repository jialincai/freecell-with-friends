import Phaser from "phaser";

import { PileId } from "phaser/constants/table";
import { Deck } from "phaser/deck/state/Deck";

import { CardView } from "phaser/card/CardView";
import { CardController } from "phaser/card/controller/CardController";

export class DeckController {
  readonly model: Deck;
  private cardControllers: CardController[];

  constructor(deck: Deck, scene: Phaser.Scene) {
    this.model = deck;

    this.cardControllers = deck.cards.map((model) => {
      const view = new CardView(scene);
      return new CardController(model, view);
    });
  }

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


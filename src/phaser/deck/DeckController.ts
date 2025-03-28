import { CardController } from "@phaser/card/CardController";
import { PileId } from "@phaser/constants/table";
import { Deck } from "@phaser/deck/state/Deck";
import { deal, shuffle } from "@phaser/deck/domain/DeckLogic";

export class DeckController {
  public model: Deck;
  public readonly cardControllers: CardController[];

  constructor(
    scene: Phaser.Scene,
    deck: Deck,
  ) {
    this.model = deck;
    this.cardControllers = this.model.cards.map((card) => {
      return new CardController(scene, card);
    });
  }

  getCardsStartingFrom(card: CardController): CardController[] {
    const { pile, position } = card.model.state;
    return this.getCardsInPile(pile).filter(
      (c) => c.model.state.position >= position
    );
  }

  getCardsInPile(pileId: PileId): CardController[] {
    return this.cardControllers
      .filter((c) => c.model.state.pile === pileId)
      .sort((a, b) => a.model.state.position - b.model.state.position);
  }

  deal(): void {
    this.model = deal(this.model);
    this.cardControllers.forEach((c, i) => c.setModel(this.model.cards[i]));
  }

  shuffle(seed: number): void {
    this.model = shuffle(this.model, seed);
    this.cardControllers.forEach((c, i) => c.setModel(this.model.cards[i]));
  }
}

import { CardController } from "@phaser/card/CardController";
import { PileId } from "@phaser/constants/table";
import { Deck } from "@phaser/deck/state/Deck";
import { dealCards, shuffleCards } from "@phaser/deck/domain/DeckLogic";
import { CardMoves } from "@phaser/move/CardMoves";
import { CardId } from "@phaser/card/domain/CardId";

export class DeckController {
  public model: Deck;
  public readonly cardControllers: CardController[];

  constructor(scene: Phaser.Scene, deck: Deck) {
    this.model = deck;
    this.cardControllers = this.model.cards.map((card) => {
      return new CardController(scene, card);
    });
  }

  getCardsStartingFrom(card: CardController): CardController[] {
    const { pile, position } = card.model.state;
    return this.getCardsInPile(pile).filter(
      (c) => c.model.state.position >= position,
    );
  }

  getCardsInPile(pileId: PileId): CardController[] {
    return this.cardControllers
      .filter((c) => c.model.state.pile === pileId)
      .sort((a, b) => a.model.state.position - b.model.state.position);
  }

  executeCardMoves(cardMoves: CardMoves) {
    cardMoves.sequence.forEach((move) => {
      const cardController = this.findCardControllerWithId(move.card);
      cardController?.setPilePosition(move.toPile, move.toPosition);
    });
  }

  dealCards(): void {
    this.model = dealCards(this.model);
    this.cardControllers.forEach((c, i) => c.setModel(this.model.cards[i]));
  }

  shuffleCards(seed: number): void {
    this.model = shuffleCards(this.model, seed);
    this.cardControllers.forEach((c, i) => c.setModel(this.model.cards[i]));
  }

  private findCardControllerWithId(cardId: CardId): CardController | undefined {
    return this.cardControllers.find(
      (controller) => controller.model.data.id === cardId,
    );
  }
}

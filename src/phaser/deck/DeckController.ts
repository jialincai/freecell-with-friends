import { CardController } from "@phaser/card/CardController";
import { PileId } from "@phaser/constants/table";
import { Deck } from "@phaser/deck/state/Deck";
import {
  dealCards,
  getDeckAfterCardMoves,
  shuffleCards,
} from "@phaser/deck/domain/DeckLogic";
import { CardMoveSequence } from "@phaser/move/CardMoveSequence";
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

  executeCardMoveSequence(cardMoves: CardMoveSequence) {
    this.model = getDeckAfterCardMoves(this.model, cardMoves);
    this.cardControllers.forEach((c, i) => c.setModel(this.model.cards[i]));
  }

  // TODO: This function is for debugging only.
  // Please remove and replace with proper animations in the future.
  async executeCardMoveSequenceWithDelay(
    cardMoves: CardMoveSequence,
    delayMs: number,
  ) {
    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    for (const { card, toPile, toPosition } of cardMoves.steps) {
      this.getCardControllerWithId(card)?.setPilePosition(toPile, toPosition);

      await wait(delayMs);
    }
  }

  dealCards(): void {
    this.model = dealCards(this.model);
    this.cardControllers.forEach((c, i) => c.setModel(this.model.cards[i]));
  }

  shuffleCards(seed: number): void {
    this.model = shuffleCards(this.model, seed);
    this.cardControllers.forEach((c, i) => c.setModel(this.model.cards[i]));
  }

  private getCardControllerWithId(cardId: CardId): CardController | undefined {
    return this.cardControllers.find(
      (controller) => controller.model.data.id === cardId,
    );
  }
}

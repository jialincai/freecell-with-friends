import { CardController } from "@phaser/card/CardController";
import { PileId } from "@phaser/constants/table";
import { Deck } from "@phaser/deck/state/Deck";
import {
  applyCardMoves,
  setupTableauDrag,
  shuffleCards,
} from "@phaser/deck/domain/DeckLogic";
import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@phaser/move/CardMoveSequence";
import { CardId } from "@phaser/card/domain/CardId";
import { getCardWorldPosition } from "@phaser/card/domain/CardViewLogic";

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
    this.model = applyCardMoves(this.model, cardMoves);
    this.cardControllers.forEach((c, i) => c.setModel(this.model.cards[i]));
  }

  async executeCardMoveSequenceWithTweens(
    cardMoves: CardMoveSequence,
    scene: Phaser.Scene,
    tweenDuration: number,
  ): Promise<void> {
    for (let i = 0; i < cardMoves.steps.length; i++) {
      const step = cardMoves.steps[i];
      const controller = this.getCardControllerWithId(step.card);
      if (!controller) continue;

      const targetPosition = getCardWorldPosition({
        pile: step.toPile,
        position: step.toPosition,
        flipped: true,
      });

      await new Promise<void>((resolve) => {
        controller.view.setDepth(100 + i);
        scene.tweens.add({
          targets: controller.view,
          x: targetPosition.x,
          y: targetPosition.y,
          duration: tweenDuration,
          ease: "Cubic",
          onComplete: () => {
            this.executeCardMoveSequence(createCardMoveSequence([step]));
            resolve();
          },
        });
      });
    }
  }

  dealCards(): void {
    this.model = dealCards(this.model);
    this.model = setupTableauDrag(this.model);
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

import { PileId } from "@/phaser/constants/table";
import { CardView } from "@/phaser/card/CardView";
import * as CardLogic from "@/phaser/card/domain/CardLogic";
import { Card } from "@/phaser/card/state/Card";

export class CardController {
  public model: Card;
  public readonly view: CardView;

  constructor(scene: Phaser.Scene, card: Card) {
    this.model = card;
    this.view = new CardView(scene, card);
    this.view.applyState(this.model);
  }

  setModel(card: Card): void {
    this.model = card;
    this.view.applyState(this.model);
  }

  setFaceUp(): void {
    this.model.state = CardLogic.withFaceUp(this.model.state);
    this.view.applyState(this.model);
  }

  setFaceDown(): void {
    this.model.state = CardLogic.withFaceDown(this.model.state);
    this.view.applyState(this.model);
  }

  setPilePosition(pile: PileId, position: number): void {
    this.model.state = CardLogic.withPilePosition(
      this.model.state,
      pile,
      position,
    );
    this.view.applyState(this.model);
  }
}

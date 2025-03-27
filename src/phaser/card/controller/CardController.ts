// card/CardController.ts

import { Card } from "phaser/card/state/Card";
import { CardView } from "phaser/card/CardView";
import { PileId } from "phaser/constants/table";
import * as CardLogic from "phaser/card/domain/CardLogic";

export class CardController {
  constructor(
    public readonly model: Card,
    private readonly view: CardView, // 🔐 make it private
  ) {
    this.updateView();
  }

  updateView(): void {
    this.view.updateFromModel(this.model);
  }

  flip(): void {
    this.model.state = CardLogic.flipFaceUp(this.model.state);
    this.updateView();
  }

  flipBack(): void {
    this.model.state = CardLogic.flipFaceDown(this.model.state);
    this.updateView();
  }

  reposition(pile: PileId, position: number): void {
    this.model.state = CardLogic.reposition(this.model.state, pile, position);
    this.updateView();
  }

  getView(): CardView {
    return this.view;
  }
}


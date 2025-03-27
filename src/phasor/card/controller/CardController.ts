// card/CardController.ts

import { Card } from "@phasor/card/state/Card";
import { CardView } from "@phasor/card/CardView";
import { PileId } from "@phasor/constants/table";
import * as CardLogic from "@phasor/card/domain/CardLogic";

export class CardController {
  constructor(
    public readonly model: Card,
    public readonly view: CardView,
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
}

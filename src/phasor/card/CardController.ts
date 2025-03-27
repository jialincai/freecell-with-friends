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

  withFaceUp(): void {
    this.model.state = CardLogic.withFaceUp(this.model.state);
    this.updateView();
  }

  withFaceDown(): void {
    this.model.state = CardLogic.withFaceDown(this.model.state);
    this.updateView();
  }

  withReposition(pile: PileId, position: number): void {
    this.model.state = CardLogic.withReposition(
      this.model.state,
      pile,
      position,
    );
    this.updateView();
  }
}

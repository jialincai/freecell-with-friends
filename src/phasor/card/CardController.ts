import { PileId } from "@phasor/constants/table";
import { CardView } from "@phasor/card/CardView";
import * as CardLogic from "@phasor/card/domain/CardLogic";
import { Card } from "@phasor/card/state/Card";

export class CardController {
  constructor(
    public readonly model: Card,
    public readonly view: CardView,
  ) {
    this.syncViewToModel();
  }

  syncViewToModel(): void {
    this.view.applyState(this.model);
  }

  setFaceUp(): void {
    this.model.state = CardLogic.withFaceUp(this.model.state);
    this.syncViewToModel();
  }

  setFaceDown(): void {
    this.model.state = CardLogic.withFaceDown(this.model.state);
    this.syncViewToModel();
  }

  setPilePosition(pile: PileId, position: number): void {
    this.model.state = CardLogic.withPilePosition(
      this.model.state,
      pile,
      position,
    );
    this.syncViewToModel();
  }
}

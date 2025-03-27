import { CardController } from "@phasor/card/CardController";
import { PileId } from "@phasor/constants/table";
import { Deck } from "@phasor/deck/state/Deck";
import { deal, shuffle } from "@phasor/deck/domain/DeckLogic";

export class DeckController {
  constructor(
    public model: Deck,
    public readonly cardControllers: CardController[],
  ) {}

  cardChildren(card: CardController): CardController[] {
    const { pile, position } = card.model.state;
    return this.cardControllers.filter(
      (c) => c.model.state.pile === pile && c.model.state.position >= position,
    );
  }

  pileChildren(pileId: PileId): CardController[] {
    return this.cardControllers
      .filter((c) => c.model.state.pile === pileId)
      .sort((a, b) => a.model.state.position - b.model.state.position);
  }

  deal(): void {
    this.model = deal(this.model);
    this.cardControllers.forEach((c) => c.updateView());
  }

  shuffle(seed: number): void {
    this.model = shuffle(this.model, seed);
    this.cardControllers.forEach((c) => c.updateView());
  }
}

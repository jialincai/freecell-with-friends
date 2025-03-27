import { PileView } from "@phasor/pile/PileView";
import { Pile } from "@phasor/pile/state/Pile";

export class PileController {
  constructor(
    public readonly model: Pile,
    public readonly view: PileView,
  ) {}

  setTint(tint: number): void {
    this.view.setTint(tint);
  }

  clearTint(): void {
    this.view.clearTint();
  }
}

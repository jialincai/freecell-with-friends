import { PileView } from "@phaser/pile/PileView";
import { Pile } from "@phaser/pile/state/Pile";

export class PileController {
  public readonly model: Pile;
  public readonly view: PileView;

  constructor(
    scene: Phaser.Scene,
    pile: Pile,
  ) {
    this.model = pile;
    this.view = new PileView(scene, pile);
  }

  setTint(tint: number): void {
    this.view.setTint(tint);
  }

  clearTint(): void {
    this.view.clearTint();
  }
}

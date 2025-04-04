import * as Phaser from "phaser";
import { PILE_POSITIONS, TABLEAU_PILES } from "@phaser/constants/table";
import { Pile } from "@phaser/pile/state/Pile";
import { CARD_DIMENSIONS, STACK_OFFSET } from "@phaser/constants/dimensions";

export class PileView extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, model: Pile) {
    super(
      scene,
      PILE_POSITIONS[model.data.id].x,
      PILE_POSITIONS[model.data.id].y,
      CARD_DIMENSIONS.width,
      CARD_DIMENSIONS.height,
      0x000000,
      0,
    );

    this.setName(model.data.id);
    this.setStrokeStyle(1, 0xffffff);

    const addHeight = TABLEAU_PILES.includes(model.data.id)
      ? STACK_OFFSET * 10
      : 0;
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        0,
        0,
        CARD_DIMENSIONS.width,
        CARD_DIMENSIONS.height + addHeight,
      ),
      Phaser.Geom.Rectangle.Contains,
      true,
    );

    scene.add.existing(this);
  }

  setTint(tint: number): void {
    this.setFillStyle(tint, 0.75);
  }

  clearTint(): void {
    this.setFillStyle(0x000000, 0);
  }
}

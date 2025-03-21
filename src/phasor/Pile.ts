import * as Phaser from "phaser";

import { CARD_DIMENSIONS, STACK_OFFSET } from "./constants/deck";
import { PileId, PILE_POSITIONS, TABLEAU_PILES } from "./constants/table";

export default class Pile extends Phaser.GameObjects.Rectangle {
  public pileId: PileId;

  public constructor(scene: Phaser.Scene, pileId: PileId) {
    // Create rectangle for visual outline only
    super(
      scene,
      PILE_POSITIONS[pileId].x,
      PILE_POSITIONS[pileId].y,
      CARD_DIMENSIONS.width,
      CARD_DIMENSIONS.height,
      0x000000,
      0, // transparent fill
    );
    this.setStrokeStyle(1, 0xffffff);

    // Set unique pile ID
    this.pileId = pileId;
    this.setName(pileId);

    // Manually set larger hit area for drop zone
    const addHeight = TABLEAU_PILES.includes(pileId) ? STACK_OFFSET * 10 : 0;
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

    // Add to scene
    scene.add.existing(this);
  }

  public setTint(tint: number): void {
    this.setFillStyle(tint, 0.75);
  }

  public clearTint(): void {
    this.setFillStyle(0x000000, 0);
  }
}

import * as Phaser from "phaser";

import { CARD_DIMENSIONS, STACK_OFFSET } from "./constants/deck";
import { PileId, PILE_POSITIONS, TABLEAU_PILES } from "./constants/table";

export default class Pile extends Phaser.GameObjects.Zone {
  public pileId: PileId;
  private visual?: Phaser.GameObjects.Graphics;

  public constructor(scene: Phaser.Scene, pileId: PileId) {
    super(scene, 0, 0, 0, 0);

    this.pileId = pileId;

    // Additional height for tableau
    const addHeight = TABLEAU_PILES.includes(this.pileId)
      ? STACK_OFFSET * 10
      : 0;
    const addWidth = 0;

    // Get position
    const position = PILE_POSITIONS[this.pileId];

    // Make zone
    this.setPosition(position.x + addWidth / 2, position.y + addHeight / 2);
    this.setSize(
      CARD_DIMENSIONS.width + addWidth,
      CARD_DIMENSIONS.height + addHeight,
    );

    const zone = this.setRectangleDropZone(this.width, this.height);
    zone.setName(this.pileId);

    // Drop zone visual
    if (this.pileId !== PileId.None) {
      const gfx = scene.add.graphics();

      // No fill by default
      gfx.lineStyle(1, 0xffffff);
      gfx.strokeRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        CARD_DIMENSIONS.width,
        CARD_DIMENSIONS.height,
      );

      this.visual = gfx;
    }

    scene.add.existing(this);
  }

  public setTint(tint: number): void {
    if (this.visual) {
      this.visual.clear();

      // Add fill with provided tint when highlighted
      this.visual.fillStyle(tint, .75);
      this.visual.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        CARD_DIMENSIONS.width,
        CARD_DIMENSIONS.height,
      );

      this.visual.lineStyle(1, 0xffffff);
      this.visual.strokeRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        CARD_DIMENSIONS.width,
        CARD_DIMENSIONS.height,
      );
    }
  }

  public clearTint(): void {
    if (this.visual) {
      this.visual.clear();

      // Back to transparent fill (no fill), just outline
      this.visual.lineStyle(1, 0xffffff);
      this.visual.strokeRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        CARD_DIMENSIONS.width,
        CARD_DIMENSIONS.height,
      );
    }
  }
}

import * as Phaser from "phaser";
import { PILE_POSITIONS, TABLEAU_PILES } from "@/phaser/constants/table";
import { Pile } from "@/phaser/pile/state/Pile";
import {
  CARD_DIMENSIONS,
  RECT_CORNER_RADIUS,
  PILE_LINE_WIDTH,
  PILE_SCALE,
  STACK_OFFSET,
} from "@/phaser/constants/dimensions";
import { BORDER_COLOR } from "@/phaser/constants/colors";

export class PileView extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, model: Pile) {
    super(scene);

    const { width, height } = CARD_DIMENSIONS;
    const pileId = model.data.id;
    const position = PILE_POSITIONS[pileId];
    const isTableau = TABLEAU_PILES.includes(pileId);
    const addHeight = isTableau ? STACK_OFFSET * 10 : 0;

    this.setName(pileId);
    this.setPosition(position.x, position.y);

    this.drawPile(0x000000, 0); // Initial transparent fill

    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -width / 2,
        -height / 2,
        width,
        height + addHeight,
      ),
      Phaser.Geom.Rectangle.Contains,
      true,
    );

    scene.add.existing(this);
  }

  setTint(tint: number): void {
    this.drawPile(tint, 0.75);
  }

  clearTint(): void {
    this.drawPile(0x000000, 0);
  }

  private drawPile(fillColor: number, fillAlpha: number): void {
    const width = CARD_DIMENSIONS.width * PILE_SCALE;
    const height = CARD_DIMENSIONS.height * PILE_SCALE;

    this.clear();
    this.lineStyle(PILE_LINE_WIDTH, BORDER_COLOR, 1);
    this.fillStyle(fillColor, fillAlpha);
    this.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      RECT_CORNER_RADIUS,
    );
    this.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      RECT_CORNER_RADIUS,
    );
  }
}

import * as Phaser from "phaser";
import { CARD_DIMENSIONS, STACK_OFFSET } from "./constants/deck";
import { PILE_POSITIONS, TABLEAU_PILES, PileId } from "./constants/table";

/**
 * Visual representation of a pile.
 * Note: Caller must manually add this to the scene using `scene.add.existing(pileView)`
 */
export default class PileView extends Phaser.GameObjects.Rectangle {
  public pileId: PileId;

  constructor(scene: Phaser.Scene, pileId: PileId) {
    // Create transparent outline at pile position
    const { x, y } = PILE_POSITIONS[pileId];
    super(scene, x, y, CARD_DIMENSIONS.width, CARD_DIMENSIONS.height, 0x000000, 0);

    this.pileId = pileId;
    this.setName(pileId);
    this.setStrokeStyle(1, 0xffffff);

    // Set interactive area, larger for tableau piles
    const addHeight = TABLEAU_PILES.includes(pileId) ? STACK_OFFSET * 10 : 0;
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, CARD_DIMENSIONS.width, CARD_DIMENSIONS.height + addHeight),
      Phaser.Geom.Rectangle.Contains,
      true
    );
  }

  // Apply tinted fill
  public setTint(tint: number): void {
    this.setFillStyle(tint, 0.75);
  }

  // Clear tinted fill
  public clearTint(): void {
    this.setFillStyle(0x000000, 0);
  }
}
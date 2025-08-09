import * as Phaser from "phaser";

import { CARD_BACK_INDEX } from "@/phaser/constants/deck";
import { Card } from "@/phaser/card/state/Card";
import {
  getCardWorldPosition,
  getSpriteIndex,
} from "@/phaser/card/domain/CardViewLogic";
import { CARD_DIMENSIONS } from "@/phaser/constants/dimensions";

export class CardView extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, model: Card) {
    super(scene, 0, 0, "img_cards", CARD_BACK_INDEX);
    this.setName(model.data.id);
    this.setDisplaySize(CARD_DIMENSIONS.width, CARD_DIMENSIONS.height);
    this.setInteractive({ draggable: true });
    this.applyState(model);
    scene.add.existing(this);
  }

  applyState(model: Card) {
    const { suit, rank } = model.data;
    const { position, flipped } = model.state;

    const frame = flipped ? getSpriteIndex(suit, rank) : CARD_BACK_INDEX;
    this.setTexture("img_cards", frame);

    if (flipped) this.setInteractive();
    else this.disableInteractive();

    this.setDepth(position + 10);
    const { x, y } = getCardWorldPosition(model.state);
    this.setPosition(x, y);
  }
}

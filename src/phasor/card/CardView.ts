import * as Phaser from "phaser";

import {
  CARD_BACK_INDEX,
  CARD_DIMENSIONS,
  STACK_OFFSET,
  SPRITE_CARD_WIDTH,
  SUIT_IMAGE_INDEX,
  Suit,
} from "@phasor/constants/deck";
import { PILE_POSITIONS, TABLEAU_PILES } from "@phasor/constants/table";
import { Card } from "@phasor/card/state/Card";
import { CardState } from "@phasor/card/state/CardState";

export class CardView extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, model: Card) {
    super(scene, 0, 0, "img_cards", CARD_BACK_INDEX);
    this.setDisplaySize(CARD_DIMENSIONS.width, CARD_DIMENSIONS.height);
    this.setInteractive();
    scene.add.existing(this);
    this.applyState(model);
  }

  applyState(model: Card) {
    const { suit, value } = model.data;
    const { position, flipped } = model.state;

    const frame = flipped ? this.getSpriteIndex(suit, value) : CARD_BACK_INDEX;

    this.setTexture("img_cards", frame);
    this.setDepth(position + 10);

    const { x, y } = this.getCardWorldPosition(model.state);
    this.setPosition(x, y);

    this.input!.draggable = flipped;
  }

  private getSpriteIndex(suit: Suit, value: number): number {
    return SUIT_IMAGE_INDEX[suit] * SPRITE_CARD_WIDTH + value - 1;
  }

  private getCardWorldPosition(state: CardState): { x: number; y: number } {
    const { pile, position } = state;
    const base = PILE_POSITIONS[pile];
    const yOffset = TABLEAU_PILES.includes(pile) ? position * STACK_OFFSET : 0;
    return { x: base.x, y: base.y + yOffset };
  }
}

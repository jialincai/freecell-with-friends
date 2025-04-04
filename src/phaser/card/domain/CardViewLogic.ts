import {
  SPRITE_CARD_WIDTH,
  Suit,
  SUIT_IMAGE_INDEX,
} from "@phaser/constants/deck";
import { PILE_POSITIONS, TABLEAU_PILES } from "@phaser/constants/table";
import { CardState } from "@phaser/card/state/CardState";
import { STACK_OFFSET } from "@phaser/constants/dimensions";

export function getCardWorldPosition(state: CardState): {
  x: number;
  y: number;
} {
  const { pile, position } = state;
  const base = PILE_POSITIONS[pile];
  const yOffset = TABLEAU_PILES.includes(pile) ? position * STACK_OFFSET : 0;
  return { x: base.x, y: base.y + yOffset };
}

export function getSpriteIndex(suit: Suit, value: number): number {
  return SUIT_IMAGE_INDEX[suit] * SPRITE_CARD_WIDTH + value - 1;
}

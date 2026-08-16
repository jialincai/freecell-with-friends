import { GAME_SCALE } from "@/phaser/constants/scale";

/**
 * Screen dimensions
 */
export const SCREEN_DIMENSIONS = {
  height: Math.round(3250 * GAME_SCALE),
  width: Math.round(1650 * GAME_SCALE),
};

/**
 * Card dimensions (10:7 height width).
 * TODO: public/img/cards.png is still exported at the pre-GAME_SCALE
 * resolution (200x280 per frame). Re-export it to match these dimensions
 * to reclaim the spritesheet's GPU texture memory as well.
 */
export const CARD_DIMENSIONS = {
  height: Math.round(280 * GAME_SCALE),
  width: Math.round(200 * GAME_SCALE),
};

/**
 * Button dimensions
 */
export const BUTTON_DIMENSIONS = {
  height: Math.round(75 * GAME_SCALE),
  width: Math.round(250 * GAME_SCALE),
};
export const BUTTON_MARGIN = Math.round(30 * GAME_SCALE);

/**
 * Pile dimensions
 */
export const PILE_LINE_WIDTH = Math.round(3 * GAME_SCALE);
export const RECT_CORNER_RADIUS = Math.round(8 * GAME_SCALE);
export const PILE_SCALE = 0.95;

/**
 * Offsets between cards and piles
 */
export const STACK_OFFSET = CARD_DIMENSIONS.height / 2;
export const STACK_DRAG_OFFSET = CARD_DIMENSIONS.height / 1.5;
export const PILE_OFFSET = Math.round(5 * GAME_SCALE);

// Pile Y positions
export const TOP_PILE_Y = Math.round(330 * GAME_SCALE);
export const BOTTOM_PILE_Y = Math.round(650 * GAME_SCALE);

/**
 * Active board dimensions
 * height -- 13 cards
 * width  --  8 piles
 */
export const BOARD_DIMENSIONS = {
  height: CARD_DIMENSIONS.height * 13,
  width: 8 * CARD_DIMENSIONS.width + (8 - 1) * PILE_OFFSET,
};

/** Padding game board */
export const BORDER_PAD_DIMENSIONS = {
  height: Math.round(48 * GAME_SCALE),
  width: (SCREEN_DIMENSIONS.width - BOARD_DIMENSIONS.width) / 2,
};

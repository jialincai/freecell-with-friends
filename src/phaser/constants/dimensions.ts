/**
 * Screen dimensions
 */
export const SCREEN_DIMENSIONS = {
  height: 900,
  width: 900,
};

/**
 * Card dimensions (10:7 height width).
 */
export const CARD_DIMENSIONS = {
  height: 120,
  width: 84,
};

/**
 * Offsets between cards and piles
 */
export const STACK_OFFSET = CARD_DIMENSIONS.height / 2;
export const STACK_DRAG_OFFSET = CARD_DIMENSIONS.height / 2;
export const PILE_OFFSET = 5;

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
export const BORDER_PAD =
  (SCREEN_DIMENSIONS.width - BOARD_DIMENSIONS.width) / 2;

/**
 * Screen dimensions
 */
export const SCREEN_DIMENSIONS = {
  height: 3250,
  width: 1650,
};

/**
 * Card dimensions (10:7 height width).
 */
export const CARD_DIMENSIONS = {
  height: 280,
  width: 200,
};

/**
 * Button dimensions
 */
export const BUTTON_DIMENSIONS = {
  height: 75,
  width: 250,
};
export const BUTTON_MARGIN = 30;

/**
 * Pile dimensions
 */
export const PILE_LINE_WIDTH = 3;
export const RECT_CORNER_RADIUS = 8;
export const PILE_SCALE = 0.95;

/**
 * Offsets between cards and piles
 */
export const STACK_OFFSET = CARD_DIMENSIONS.height / 2;
export const STACK_DRAG_OFFSET = CARD_DIMENSIONS.height / 1.5;
export const PILE_OFFSET = 5;

// Pile Y positions
export const TOP_PILE_Y = 330;
export const BOTTOM_PILE_Y = 650;

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
  height: 48,
  width: (SCREEN_DIMENSIONS.width - BOARD_DIMENSIONS.width) / 2,
};

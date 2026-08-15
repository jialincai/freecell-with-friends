/**
 * Uniform scale applied to every pixel dimension below, relative to the
 * original desktop-sized layout. Phaser.Scale.FIT already CSS-scales the
 * canvas to fit any container visually, so this factor only changes the
 * WebGL backing-buffer resolution (and therefore GPU memory footprint) —
 * it does not change how large the board appears on screen. Lowered for
 * mobile (esp. iOS Safari) where a 1650x3250 framebuffer plus a 2800x1120
 * card spritesheet texture was a suspected contributor to renderer crashes.
 */
export const GAME_SCALE = 0.5;

/**
 * Screen dimensions
 */
export const SCREEN_DIMENSIONS = {
  height: 3250 * GAME_SCALE,
  width: 1650 * GAME_SCALE,
};

/**
 * Card dimensions (10:7 height width).
 */
export const CARD_DIMENSIONS = {
  height: 280 * GAME_SCALE,
  width: 200 * GAME_SCALE,
};

/**
 * Button dimensions
 */
export const BUTTON_DIMENSIONS = {
  height: 75 * GAME_SCALE,
  width: 250 * GAME_SCALE,
};
export const BUTTON_MARGIN = 30 * GAME_SCALE;

/**
 * Pile dimensions
 */
export const PILE_LINE_WIDTH = 3 * GAME_SCALE;
export const RECT_CORNER_RADIUS = 8 * GAME_SCALE;
export const PILE_SCALE = 0.95;

/**
 * Offsets between cards and piles
 */
export const STACK_OFFSET = CARD_DIMENSIONS.height / 2;
export const STACK_DRAG_OFFSET = CARD_DIMENSIONS.height / 1.5;
export const PILE_OFFSET = 5 * GAME_SCALE;

// Pile Y positions
export const TOP_PILE_Y = 330 * GAME_SCALE;
export const BOTTOM_PILE_Y = 650 * GAME_SCALE;

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
  height: 48 * GAME_SCALE,
  width: (SCREEN_DIMENSIONS.width - BOARD_DIMENSIONS.width) / 2,
};

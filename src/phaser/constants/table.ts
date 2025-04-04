import { BORDER_PAD, CARD_DIMENSIONS, PILE_OFFSET } from "./dimensions";

/**
 * Define the constants for the table.
 */
export enum PileId {
  Cell1 = "CELL_1",
  Cell2 = "CELL_2",
  Cell3 = "CELL_3",
  Cell4 = "CELL_4",
  Tableau1 = "TABLEAU_1",
  Tableau2 = "TABLEAU_2",
  Tableau3 = "TABLEAU_3",
  Tableau4 = "TABLEAU_4",
  Tableau5 = "TABLEAU_5",
  Tableau6 = "TABLEAU_6",
  Tableau7 = "TABLEAU_7",
  Tableau8 = "TABLEAU_8",
  Foundation1 = "FOUNDATION_1",
  Foundation2 = "FOUNDATION_2",
  Foundation3 = "FOUNDATION_3",
  Foundation4 = "FOUNDATION_4",
  None = "NONE",
}

/**
 * Define cells
 */
export const CELL_PILES = [
  PileId.Cell1,
  PileId.Cell2,
  PileId.Cell3,
  PileId.Cell4,
];

/**
 * Define tableau piles
 */
export const TABLEAU_PILES = [
  PileId.Tableau1,
  PileId.Tableau2,
  PileId.Tableau3,
  PileId.Tableau4,
  PileId.Tableau5,
  PileId.Tableau6,
  PileId.Tableau7,
  PileId.Tableau8,
];

/**
 * Define foundation piles
 */
export const FOUNDATION_PILES = [
  PileId.Foundation1,
  PileId.Foundation2,
  PileId.Foundation3,
  PileId.Foundation4,
];

/**
 * Positions of piles on screen
 */
const CARD_CENTER_X = (col: number) =>
  BORDER_PAD +
  CARD_DIMENSIONS.width / 2 +
  col * (CARD_DIMENSIONS.width + PILE_OFFSET);

// Optionally, center Y positions vertically
const TOP_PILE_Y = 120;
const BOTTOM_PILE_Y = 280;

export const PILE_POSITIONS: Record<PileId, Phaser.Math.Vector2> = {
  // Cells
  [PileId.Cell1]: new Phaser.Math.Vector2(CARD_CENTER_X(0), TOP_PILE_Y),
  [PileId.Cell2]: new Phaser.Math.Vector2(CARD_CENTER_X(1), TOP_PILE_Y),
  [PileId.Cell3]: new Phaser.Math.Vector2(CARD_CENTER_X(2), TOP_PILE_Y),
  [PileId.Cell4]: new Phaser.Math.Vector2(CARD_CENTER_X(3), TOP_PILE_Y),

  // Foundations
  [PileId.Foundation1]: new Phaser.Math.Vector2(CARD_CENTER_X(4), TOP_PILE_Y),
  [PileId.Foundation2]: new Phaser.Math.Vector2(CARD_CENTER_X(5), TOP_PILE_Y),
  [PileId.Foundation3]: new Phaser.Math.Vector2(CARD_CENTER_X(6), TOP_PILE_Y),
  [PileId.Foundation4]: new Phaser.Math.Vector2(CARD_CENTER_X(7), TOP_PILE_Y),

  // Tableaus
  [PileId.Tableau1]: new Phaser.Math.Vector2(CARD_CENTER_X(0), BOTTOM_PILE_Y),
  [PileId.Tableau2]: new Phaser.Math.Vector2(CARD_CENTER_X(1), BOTTOM_PILE_Y),
  [PileId.Tableau3]: new Phaser.Math.Vector2(CARD_CENTER_X(2), BOTTOM_PILE_Y),
  [PileId.Tableau4]: new Phaser.Math.Vector2(CARD_CENTER_X(3), BOTTOM_PILE_Y),
  [PileId.Tableau5]: new Phaser.Math.Vector2(CARD_CENTER_X(4), BOTTOM_PILE_Y),
  [PileId.Tableau6]: new Phaser.Math.Vector2(CARD_CENTER_X(5), BOTTOM_PILE_Y),
  [PileId.Tableau7]: new Phaser.Math.Vector2(CARD_CENTER_X(6), BOTTOM_PILE_Y),
  [PileId.Tableau8]: new Phaser.Math.Vector2(CARD_CENTER_X(7), BOTTOM_PILE_Y),

  // Fallback
  [PileId.None]: new Phaser.Math.Vector2(0, 0),
};

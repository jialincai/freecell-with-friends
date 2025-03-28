import { CARD_DIMENSIONS } from "./deck";

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
 * Offsets for card positions
 */
const PILE_OFFSET = CARD_DIMENSIONS.width + 10;

/**
 * Positions of piles on screen
 */
export const PILE_POSITIONS: Record<PileId, Phaser.Math.Vector2> = {
  [PileId.Cell1]: new Phaser.Math.Vector2(80, 120),
  [PileId.Cell2]: new Phaser.Math.Vector2(80 + PILE_OFFSET, 120),
  [PileId.Cell3]: new Phaser.Math.Vector2(80 + 2 * PILE_OFFSET, 120),
  [PileId.Cell4]: new Phaser.Math.Vector2(80 + 3 * PILE_OFFSET, 120),

  [PileId.Foundation1]: new Phaser.Math.Vector2(80 + 4 * PILE_OFFSET, 120),
  [PileId.Foundation2]: new Phaser.Math.Vector2(80 + 5 * PILE_OFFSET, 120),
  [PileId.Foundation3]: new Phaser.Math.Vector2(80 + 6 * PILE_OFFSET, 120),
  [PileId.Foundation4]: new Phaser.Math.Vector2(80 + 7 * PILE_OFFSET, 120),

  [PileId.Tableau1]: new Phaser.Math.Vector2(80, 280),
  [PileId.Tableau2]: new Phaser.Math.Vector2(80 + PILE_OFFSET, 280),
  [PileId.Tableau3]: new Phaser.Math.Vector2(80 + 2 * PILE_OFFSET, 280),
  [PileId.Tableau4]: new Phaser.Math.Vector2(80 + 3 * PILE_OFFSET, 280),
  [PileId.Tableau5]: new Phaser.Math.Vector2(80 + 4 * PILE_OFFSET, 280),
  [PileId.Tableau6]: new Phaser.Math.Vector2(80 + 5 * PILE_OFFSET, 280),
  [PileId.Tableau7]: new Phaser.Math.Vector2(80 + 6 * PILE_OFFSET, 280),
  [PileId.Tableau8]: new Phaser.Math.Vector2(80 + 7 * PILE_OFFSET, 280),

  [PileId.None]: new Phaser.Math.Vector2(0, 0),
};

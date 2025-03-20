import Deck from "./Deck";
import Card from "./Card";
import {
  CELL_PILES,
  FOUNDATION_PILES,
  PileId,
  TABLEAU_PILES,
} from "./constants/table";

import {
  isValidSequence,
  hasAlternatingColor,
  isDescendingOrder,
  isAscendingOrder,
  hasSameSuit,
} from "./Validation";

/**
 * Defines the drop rules for different pile types.
 */
const DROP_RULES: Record<PileId, (deck: Deck, card: Card) => boolean> =
  Object.fromEntries([
    // Cell piles: Only a single card can be placed.
    ...CELL_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const pileAfterDrop = [
          ...deck.pileChildren(pileId),
          ...deck.cardChildren(card),
        ];
        return pileAfterDrop.length === 1;
      },
    ]),

    // Foundation piles: Cards must be placed in ascending order and match suit.
    ...FOUNDATION_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const pileAfterDrop = [
          ...deck.pileChildren(pileId),
          ...deck.cardChildren(card),
        ];
        if (pileAfterDrop[0].value !== 1) return false;
        return isValidSequence(
          [...deck.pileChildren(pileId), ...deck.cardChildren(card)],
          [hasSameSuit, isAscendingOrder],
        );
      },
    ]),

    // Tableau piles: Cards must alternate in color and be placed in descending order.
    ...TABLEAU_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const pileAfterDrop = [
          ...deck.pileChildren(pileId),
          ...deck.cardChildren(card),
        ];
        const activeSequence = pileAfterDrop.slice(
          -deck.cardChildren(card).length - 1,
        );
        return isValidSequence(activeSequence, [
          hasAlternatingColor,
          isDescendingOrder,
        ]);
      },
    ]),
  ]);

/**
 * Defines the drag rules for different pile types.
 */
const DRAG_RULES: Record<PileId, (deck: Deck, card: Card) => boolean> =
  Object.fromEntries([
    // Cell piles: Cell cards can always be dragged.
    ...CELL_PILES.map((pileId) => [
      pileId,
      (_deck: Deck, _card: Card) => {
        return true;
      },
    ]),

    // Foundation piles: Foundation cards can never be dragged.
    ...FOUNDATION_PILES.map((pileId) => [
      pileId,
      (_deck: Deck, _card: Card) => {
        return false;
      },
    ]),

    // Tableau piles: Tableau cards can be dragged if they are in a valid sequence.
    ...TABLEAU_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const dragChildren = deck.cardChildren(card);
        const maxMoveSize = [...TABLEAU_PILES, ...CELL_PILES].reduce(
          (accum, pileId) => {
            return accum + Number(deck.pileChildren(pileId).length === 0);
          },
          1,
        );

        return (
          dragChildren.length <= maxMoveSize &&
          isValidSequence(dragChildren, [
            hasAlternatingColor,
            isDescendingOrder,
          ])
        );
      },
    ]),
  ]);

/**
 * Evaluates which piles a card can be dropped onto.
 *
 * @param {Deck} deck - The current deck state.
 * @param {Card} card - The card being moved.
 * @param {PileId[]} pileIds - A collection of target pile IDs.
 * @returns {boolean[]} An array indicating whether each pile allows the drop, in the same order.
 */
export function evaluateDropPiles(
  deck: Deck,
  card: Card,
  pileIds: PileId[],
): boolean[] {
  return pileIds.map((pileId) => DROP_RULES[pileId]?.(deck, card) ?? false);
}

/**
 * Retrieves only the piles where a card can be legally dropped.
 *
 * @param {Deck} deck - The current deck state.
 * @param {Card} card - The card being moved.
 * @param {PileId[]} pileIds - A collection of target pile IDs.
 * @returns {PileId[]} An array of valid pile IDs where the card can be dropped.
 */
export function getValidDropPiles(
  deck: Deck,
  card: Card,
  pileIds: PileId[],
): PileId[] {
  return pileIds.filter((pileId) => DROP_RULES[pileId]?.(deck, card) ?? false);
}

/**
 * Computes the new placements for a set of cards after a move.
 *
 * @param {Deck} deck - The current deck state.
 * @param {Card[]} cards - The cards being moved.
 * @param {PileId} pileId - The target pile ID.
 * @returns {Array<{ pileId: PileId; position: number }>} The new positions of the moved cards.
 */
export function getUpdatedCardPlacements(
  deck: Deck,
  cards: Card[],
  pileId: PileId,
): Array<{ pileId: PileId; position: number }> {
  const basePosition = deck.pileChildren(pileId).length;
  return cards.map((_, index) => ({
    pileId,
    position: basePosition + index,
  }));
}

/**
 * Checks if a card (and its children) can be moved.
 * @param deck The current deck state.
 * @param card The card being moved.
 * @returns Whether the move is allowed.
 */
export function canMoveCard(deck: Deck, card: Card): boolean {
  return DRAG_RULES[card.pile]?.(deck, card) ?? false;
}

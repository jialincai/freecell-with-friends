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
          ...deck.getPileChildren(pileId),
          ...deck.getCardChildren(card),
        ];
        return pileAfterDrop.length === 1;
      },
    ]),

    // Foundation piles: Cards must be placed in ascending order and match suit.
    ...FOUNDATION_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const pileAfterDrop = [
          ...deck.getPileChildren(pileId),
          ...deck.getCardChildren(card),
        ];
        if (pileAfterDrop[0].value !== 1) return false;
        return isValidSequence(
          [...deck.getPileChildren(pileId), ...deck.getCardChildren(card)],
          [hasSameSuit, isAscendingOrder],
        );
      },
    ]),

    // Tableau piles: Cards must alternate in color and be placed in descending order.
    // Additionally, card count must not exceed max drop size.
    ...TABLEAU_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const dragChildren = deck.getCardChildren(card);
        if (dragChildren.length > _getMaxMovableStackSize(deck, pileId))
          return false;

        const pileAfterDrop = [
          ...deck.getPileChildren(pileId),
          ...dragChildren,
        ];
        const activeSequence = pileAfterDrop.slice(-dragChildren.length - 1);
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
        const dragChildren = deck.getCardChildren(card);
        return (
          dragChildren.length <= _getMaxMovableStackSize(deck, PileId.None) &&
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
  const basePosition = deck.getPileChildren(pileId).length;
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
export function canMoveCard(card: Card, deck: Deck): boolean {
  return DRAG_RULES[card.pile]?.(deck, card) ?? false;
}

/**
 * Calculates the maximum number of cards that can be moved in a single stack.
 * Based on Freecell-style rules: (empty cells + 1) * 2^(empty tableaus excluding the target).
 *
 * @param deck - The current deck state
 * @param targetPileId - The pile the stack will be dropped on. If PileId.None, all tableau piles are considered.
 */
function _getMaxMovableStackSize(deck: Deck, targetPileId: PileId): number {
  const emptyCellCount = deck.getEmptyPiles(CELL_PILES).length;
  const emptyTableauCount = deck.getEmptyPiles(
    TABLEAU_PILES.filter((id) => id !== targetPileId),
  ).length;

  return (emptyCellCount + 1) * 2 ** emptyTableauCount;
}

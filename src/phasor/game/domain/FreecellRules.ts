import { Card } from "@phasor/card/state/Card";
import { Deck } from "@phasor/deck/state/Deck";
import {
  PileId,
  CELL_PILES,
  FOUNDATION_PILES,
  TABLEAU_PILES,
} from "@phasor/constants/table";
import {
  isDifferentColor,
  isSameSuit,
  isAscending,
  isDescending,
  isValidStack,
} from "@phasor/card/domain/CardComparison";
import { cardChildren, pileChildren } from "@phasor/deck/domain/DeckLogic";

// DROP RULES — defines legal drop destinations by pile type
const DROP_RULES: Record<PileId, (deck: Deck, card: Card) => boolean> =
  Object.fromEntries([
    ...CELL_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const resultingPile = [
          ...getPileChildren(deck, pileId),
          ...getCardChildren(deck, card),
        ];
        return resultingPile.length === 1;
      },
    ]),

    ...FOUNDATION_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const resultingPile = [
          ...getPileChildren(deck, pileId),
          ...getCardChildren(deck, card),
        ];
        if (resultingPile[0]?.data.value !== 1) return false;

        return isValidStack(
          resultingPile.map((c) => c.data),
          [isSameSuit, isAscending],
        );
      },
    ]),

    ...TABLEAU_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const stack = getCardChildren(deck, card);
        if (stack.length > maxStackSize(deck, pileId)) return false;

        const resultingPile = [...getPileChildren(deck, pileId), ...stack];
        const activeSequence = resultingPile.slice(-stack.length - 1);

        return isValidStack(
          activeSequence.map((c) => c.data),
          [isDifferentColor, isDescending],
        );
      },
    ]),
  ]);

// DRAG RULES — defines whether a card can be picked up from its pile
const DRAG_RULES: Record<PileId, (deck: Deck, card: Card) => boolean> =
  Object.fromEntries([
    ...CELL_PILES.map((pileId) => [pileId, () => true]),
    ...FOUNDATION_PILES.map((pileId) => [pileId, () => false]),
    ...TABLEAU_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const stack = getCardChildren(deck, card);
        return (
          stack.length <= maxStackSize(deck, PileId.None) &&
          isValidStack(
            stack.map((c) => c.data),
            [isDifferentColor, isDescending],
          )
        );
      },
    ]),
  ]);

/**
 * Returns booleans indicating if the card can be dropped on each pile.
 */
export function canDropOnEach(
  deck: Deck,
  card: Card,
  piles: PileId[],
): boolean[] {
  return piles.map((id) => DROP_RULES[id]?.(deck, card) ?? false);
}

/**
 * Returns all piles where the card can legally be dropped.
 */
export function getDroppablePiles(
  deck: Deck,
  card: Card,
  piles: PileId[],
): PileId[] {
  return piles.filter((id) => DROP_RULES[id]?.(deck, card) ?? false);
}

/**
 * Computes new pile/position assignments for a card stack drop.
 */
export function getDropPlacements(
  deck: Deck,
  cards: Card[],
  pileId: PileId,
): Array<{ pileId: PileId; position: number }> {
  const startPosition = getPileChildren(deck, pileId).length;
  return cards.map((_, i) => ({
    pileId,
    position: startPosition + i,
  }));
}

/**
 * Determines whether a card can be picked up from its current pile.
 */
export function canMoveCard(card: Card, deck: Deck): boolean {
  return DRAG_RULES[card.state.pile]?.(deck, card) ?? false;
}

/**
 * Calculates how many cards can be moved in a stack based on free cells/tableaus.
 */
function maxStackSize(deck: Deck, excludePile: PileId): number {
  const emptyCells = CELL_PILES.filter(
    (id) => getPileChildren(deck, id).length === 0,
  ).length;

  const emptyTableaus = TABLEAU_PILES.filter(
    (id) => id !== excludePile && getPileChildren(deck, id).length === 0,
  ).length;

  return (emptyCells + 1) * 2 ** emptyTableaus;
}

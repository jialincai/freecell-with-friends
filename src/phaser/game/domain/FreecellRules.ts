import {
  CELL_PILES,
  FOUNDATION_PILES,
  PileId,
  TABLEAU_PILES,
} from "phaser/constants/table";
import { Card } from "phaser/card/state/Card";
import {
  isAscending,
  isDescending,
  isDifferentColor,
  isFollowingRules,
  isSameSuit,
} from "phaser/card/domain/CardComparison";
import {
  getCardsInPile,
  getCardsStartingFrom,
} from "phaser/deck/domain/DeckLogic";
import { Deck } from "phaser/deck/state/Deck";

export function mapValidDropPiles(
  deck: Deck,
  card: Card,
  piles: PileId[],
): boolean[] {
  return piles.map((id) => DROP_RULES[id]?.(deck, card) ?? false);
}

export function filterValidDropPiles(
  deck: Deck,
  card: Card,
  piles: PileId[],
): PileId[] {
  return piles.filter((id) => DROP_RULES[id]?.(deck, card) ?? false);
}

export function calculateNewPilePosition(
  deck: Deck,
  cards: Card[],
  pileId: PileId,
): Array<{ pile: PileId; position: number }> {
  const startPosition = getCardsInPile(deck, pileId).length;
  return cards.map((_, i) => ({
    pile: pileId,
    position: startPosition + i,
  }));
}

export function canMoveCard(deck: Deck, card: Card): boolean {
  return DRAG_RULES[card.state.pile]?.(deck, card) ?? false;
}

/**
 * Calculates how many cards can be moved according to formula:
 * maxMoveSize = (emptyCells + 1) * 2^emptyTableaus
 */
function calculateMaxMoveSize(deck: Deck, excludePile: PileId): number {
  const emptyCells = CELL_PILES.filter(
    (id) => getCardsInPile(deck, id).length === 0,
  ).length;

  const emptyTableaus = TABLEAU_PILES.filter(
    (id) => id !== excludePile && getCardsInPile(deck, id).length === 0,
  ).length;

  return (emptyCells + 1) * 2 ** emptyTableaus;
}

const DROP_RULES: Record<PileId, (deck: Deck, card: Card) => boolean> =
  Object.fromEntries([
    /**
     * Cell piles any card as long as the pile is empty.
     */
    ...CELL_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const resultingPile = [
          ...getCardsInPile(deck, pileId),
          ...getCardsStartingFrom(deck, card),
        ];
        return resultingPile.length === 1;
      },
    ]),
    /**
     * Foundation piles accept sequentially ascending cards with the same suit.
     * The first card must be of value 1.
     */
    ...FOUNDATION_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const resultingPile = [
          ...getCardsInPile(deck, pileId),
          ...getCardsStartingFrom(deck, card),
        ];
        if (resultingPile[0]?.data.value !== 1) return false;

        return isFollowingRules(
          resultingPile.map((c) => c.data),
          [isSameSuit, isAscending],
        );
      },
    ]),
    /**
     * Tableau piles accept sequentially descending cards with different colors.
     * The size of the moved stack must be valid.
     */
    ...TABLEAU_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const stack = getCardsStartingFrom(deck, card);
        if (stack.length > calculateMaxMoveSize(deck, pileId)) return false;

        const resultingPile = [...getCardsInPile(deck, pileId), ...stack];
        const activeSequence = resultingPile.slice(-stack.length - 1);

        return isFollowingRules(
          activeSequence.map((c) => c.data),
          [isDifferentColor, isDescending],
        );
      },
    ]),
  ]);

// DRAG RULES — defines whether a card can be picked up from its pile
const DRAG_RULES: Record<PileId, (deck: Deck, card: Card) => boolean> =
  Object.fromEntries([
    /**
     * Cell piles always allow drag.
     */
    ...CELL_PILES.map((pileId) => [pileId, () => true]),
    /**
     * Foundation piles never allow drag.
     */
    ...FOUNDATION_PILES.map((pileId) => [pileId, () => false]),
    /**
     * Tableau piles allow drag for sequentially descending careds of alternating color.
     * The size of the moved stack must be valid.
     */
    ...TABLEAU_PILES.map((pileId) => [
      pileId,
      (deck: Deck, card: Card) => {
        const stack = getCardsStartingFrom(deck, card);
        if (stack.length > calculateMaxMoveSize(deck, pileId)) return false;

        return isFollowingRules(
          stack.map((c) => c.data),
          [isDifferentColor, isDescending],
        );
      },
    ]),
  ]);

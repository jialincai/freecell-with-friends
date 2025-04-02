import {
  CELL_PILES,
  FOUNDATION_PILES,
  PileId,
  TABLEAU_PILES,
} from "@phaser/constants/table";
import { Card } from "@phaser/card/state/Card";
import {
  isAscending,
  isDescending,
  isDifferentColor,
  isFollowingRules,
  isSameSuit,
} from "@phaser/card/domain/CardComparison";
import {
  applyCardMoves,
  filterEmptyPiles,
  filterNonEmptyPiles,
  getCardsInPile,
  getCardsStartingFrom,
} from "@phaser/deck/domain/DeckLogic";
import { Deck } from "@phaser/deck/state/Deck";
import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@phaser/move/CardMoveSequence";
import { CardMove, createCardMove } from "@phaser/move/CardMove";

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

export function canMoveCard(deck: Deck, card: Card): boolean {
  return DRAG_RULES[card.state.pile]?.(deck, card) ?? false;
}

export function calculateMaxMoveSize(
  emptyCells: number,
  emptyTableaus: number,
): number {
  return (emptyCells + 1) << emptyTableaus;
}

export function calculateMinTempTableaus(
  moveSize: number,
  emptyCells: number,
): number {
  return Math.ceil(Math.log2(moveSize / (emptyCells + 1)));
}

export function areAllTableausOrdered(deck: Deck): boolean {
  const areAllTableausOrdered = TABLEAU_PILES.every((pileId) => {
    const cardsInPile = getCardsInPile(deck, pileId).map((card) => card.data);
    return isFollowingRules(cardsInPile, [isDescending, isDifferentColor]);
  });

  return areAllTableausOrdered;
}

export function areFoundationsFull(deck: Deck): boolean {
  const cardCount = FOUNDATION_PILES.reduce(
    (sum, pileId) => sum + getCardsInPile(deck, pileId).length,
    0,
  );

  return cardCount === 52;
}

export function createAutocompleteSequence(deck: Deck): CardMoveSequence {
  let deckState: Deck = structuredClone(deck);
  const moveList: CardMove[] = [];

  while (!areFoundationsFull(deckState)) {
    const movablePiles = filterNonEmptyPiles(deckState, [...TABLEAU_PILES, ...CELL_PILES]);

    for (const sourcePileId of movablePiles) {
      const sourceCards = getCardsInPile(deckState, sourcePileId);
      const topCard = sourceCards.at(-1);
      if (!topCard) continue;

      const destinationFoundation = FOUNDATION_PILES.find(foundationId =>
        DROP_RULES[foundationId](deckState, topCard),
      );
      if (!destinationFoundation) continue;

      const targetIndex = getCardsInPile(deckState, destinationFoundation).length;

      const move = createCardMove(
        topCard.data.id,
        sourcePileId,
        topCard.state.position,
        destinationFoundation,
        targetIndex,
      );

      moveList.push(move);
      deckState = applyCardMoves(deckState, createCardMoveSequence([move]));
      break; // Apply one move per loop iteration
    }
  }

  return createCardMoveSequence(moveList);
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
        if (resultingPile[0]?.data.rank !== 1) return false;

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
        const emptyCells = filterEmptyPiles(deck, CELL_PILES);
        const availableTableaus = filterEmptyPiles(
          deck,
          TABLEAU_PILES.filter((pile) => pile !== pileId),
        );
        if (
          stack.length >
          calculateMaxMoveSize(emptyCells.length, availableTableaus.length)
        )
          return false;

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
        const emptyCells = filterEmptyPiles(deck, CELL_PILES);
        const availableTableaus = filterEmptyPiles(
          deck,
          TABLEAU_PILES.filter((pile) => pile !== pileId),
        );
        if (
          stack.length >
          calculateMaxMoveSize(emptyCells.length, availableTableaus.length)
        )
          return false;

        return isFollowingRules(
          stack.map((c) => c.data),
          [isDifferentColor, isDescending],
        );
      },
    ]),
  ]);

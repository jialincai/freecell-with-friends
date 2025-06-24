import {
  CELL_PILES,
  FOUNDATION_PILES,
  PileId,
  TABLEAU_PILES,
} from "@phaser/constants/table";
import {
  filterEmptyPiles,
  getCardsInPile,
  applyCardMoves,
  filterNonEmptyPiles,
} from "@phaser/deck/domain/DeckLogic";
import { Deck } from "@phaser/deck/state/Deck";
import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@phaser/move/CardMoveSequence";
import { CardMove, createCardMove } from "@phaser/move/CardMove";
import {
  areFoundationsFull,
  calculateMaxMoveSize,
  calculateMinTempTableaus,
  filterValidDropPiles,
} from "@phaser/game/domain/FreecellRules";

/**
 * Expands a simplified move sequence into intermediate steps using free cells
 * and potentially a temporary tableau pile when required.
 *
 * Assumptions for a valid simplified sequence:
 * 1. The number of cards to move does not exceed the maximum legal move size.
 * 2. Cards are moved from the bottom of one pile to another.
 * 3. Cards are ordered by ascending position (topmost card is last).
 *
 * Recursively expands the move using this strategy:
 * - If the move fits within free cells only, spread children into cells, move top, and reassemble.
 * - Otherwise, calculate how many cards can be moved with one fewer tableau pile (approaching base case).
 *   Recursively split the move into three parts:
 *   1. Move the largest chunk that can be handled with one fewer tableau to a temporary tableau.
 *   2. Move the remaining cards to the target.
 *   3. Move the cards from the temporary tableau to the target.
 *
 * Undefined behavior occurs if the input sequence violates the assumptions.
 */
export function expand(
  deck: Deck,
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  const moveSize = cardMoves.steps.length;
  const [firstStep] = cardMoves.steps;

  const emptyCells = filterEmptyPiles(deck, CELL_PILES);
  if (moveSize <= emptyCells.length + 1) {
    return expandWithFreeCells(deck, cardMoves);
  }

  const availableTableaus = filterEmptyPiles(
    deck,
    TABLEAU_PILES.filter((pile) => pile !== firstStep.toPile),
  );

  return expandWithTempTableau(deck, cardMoves, availableTableaus[0]);
}

function expandWithTempTableau(
  deck: Deck,
  cardMoves: CardMoveSequence,
  tempTableau: PileId,
): CardMoveSequence {
  const moveSize = cardMoves.steps.length;
  const [firstStep] = cardMoves.steps;

  const emptyCells = filterEmptyPiles(deck, CELL_PILES);
  const minTempTableaus = calculateMinTempTableaus(moveSize, emptyCells.length);
  const cardsToTemp = calculateMaxMoveSize(
    emptyCells.length,
    minTempTableaus - 1,
  );

  let deckState: Deck = structuredClone(deck);
  const moveToTemp = expand(
    deck,
    createPileToPileCardMoveSequence(
      deck,
      firstStep.fromPile,
      tempTableau,
      cardsToTemp,
    ),
  );
  deckState = applyCardMoves(deckState, moveToTemp);

  const moveToTarget = expand(
    deckState,
    createPileToPileCardMoveSequence(
      deckState,
      firstStep.fromPile,
      firstStep.toPile,
      moveSize - cardsToTemp,
    ),
  );
  deckState = applyCardMoves(deckState, moveToTarget);

  const moveFromTemp = expand(
    deckState,
    createPileToPileCardMoveSequence(
      deckState,
      tempTableau,
      firstStep.toPile,
      cardsToTemp,
    ),
  );

  return createCardMoveSequence([
    ...moveToTemp.steps,
    ...moveToTarget.steps,
    ...moveFromTemp.steps,
  ]);
}

function expandWithFreeCells(
  deck: Deck,
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  const [topCardMove, ...restMoves] = cardMoves.steps;
  const emptyCells = filterEmptyPiles(deck, CELL_PILES);

  const moveChildrenToCells = [...restMoves]
    .reverse()
    .map((step, i) =>
      createCardMove(
        step.card,
        step.fromPile,
        step.fromPosition,
        emptyCells[i],
        0,
      ),
    );

  const moveTopCard = createCardMove(
    topCardMove.card,
    topCardMove.fromPile,
    topCardMove.fromPosition,
    topCardMove.toPile,
    topCardMove.toPosition,
  );

  const moveChildrenToTarget = restMoves.map((step, i) =>
    createCardMove(
      step.card,
      emptyCells[restMoves.length - i - 1],
      0,
      step.toPile,
      step.toPosition,
    ),
  );

  return createCardMoveSequence([
    ...moveChildrenToCells,
    moveTopCard,
    ...moveChildrenToTarget,
  ]);
}

/**
 * Creates a sequence of card moves that transfers all cards to foundation piles in the correct order.
 *
 * Assumes the deck is in a state where all tableau piles are in descending, alternating-color order,
 * and that no further player interaction is required (i.e., auto-completable).
 */
export function createAutocompleteCardMoveSequence(
  deck: Deck,
): CardMoveSequence {
  let deckState = structuredClone(deck);
  const moveList = [];

  while (!areFoundationsFull(deckState)) {
    const movablePiles = filterNonEmptyPiles(deckState, [
      ...TABLEAU_PILES,
      ...CELL_PILES,
    ]);

    for (const sourcePileId of movablePiles) {
      const sourceCards = getCardsInPile(deckState, sourcePileId);
      const bottom = sourceCards.at(-1);
      if (!bottom) continue;

      const destinationFoundation = filterValidDropPiles(
        deckState,
        bottom,
        FOUNDATION_PILES,
      )?.[0];
      if (!destinationFoundation) continue;

      const move = createCardMove(
        bottom.data.id,
        sourcePileId,
        bottom.state.position,
        destinationFoundation,
        getCardsInPile(deckState, destinationFoundation).length,
      );

      moveList.push(move);
      deckState = applyCardMoves(deckState, createCardMoveSequence([move]));
      break; // Apply one move per loop iteration
    }
  }

  return createCardMoveSequence(moveList);
}

function createPileToPileCardMoveSequence(
  deck: Deck,
  fromPile: PileId,
  toPile: PileId,
  numCardsToMove: number,
): CardMoveSequence {
  const sourcePileCards = getCardsInPile(deck, fromPile);
  const destinationPileCards = getCardsInPile(deck, toPile);

  const startFromPosition = sourcePileCards.length - numCardsToMove;
  const startToPosition = destinationPileCards.length;

  const moveSteps = sourcePileCards
    .slice(-numCardsToMove)
    .map((card, index) =>
      createCardMove(
        card.data.id,
        fromPile,
        startFromPosition + index,
        toPile,
        startToPosition + index,
      ),
    );

  return createCardMoveSequence(moveSteps);
}

export function invertCardMoveSequence(
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  return createCardMoveSequence(
    [...cardMoves.steps]
      .reverse()
      .map((move) =>
        createCardMove(
          move.card,
          move.toPile,
          move.toPosition,
          move.fromPile,
          move.fromPosition,
        ),
      ),
  );
}

export function flattenCardMoveSequences(
  sequences: CardMoveSequence[],
): CardMoveSequence {
  const moveByCard: Record<string, CardMove> = sequences.reduce(
    (acc, sequence) => {
      for (const move of sequence.steps) {
        const existing = acc[move.card];

        acc[move.card] = existing
          ? {
              ...existing,
              toPile: move.toPile,
              toPosition: move.toPosition,
            }
          : { ...move };
      }
      return acc;
    },
    {} as Record<string, CardMove>,
  );

  return createCardMoveSequence(Object.values(moveByCard));
}

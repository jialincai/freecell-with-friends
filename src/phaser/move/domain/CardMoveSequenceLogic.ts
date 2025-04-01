import { CELL_PILES, PileId, TABLEAU_PILES } from "@phaser/constants/table";
import {
  filterEmptyPiles,
  getCardsInPile,
  applyCardMoves,
} from "@phaser/deck/domain/DeckLogic";
import { Deck } from "@phaser/deck/state/Deck";
import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@phaser/move/CardMoveSequence";
import { createCardMove } from "@phaser/move/CardMove";
import {
  calculateMaxMoveSizeSimple,
  calculateMinTempTableaus,
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
  const minTempTableaus = calculateMinTempTableaus(
    moveSize,
    emptyCells.length,
  );
  const cardsToTemp = calculateMaxMoveSizeSimple(
    emptyCells.length,
    minTempTableaus - 1,
  );

  const moveToTemp = expand(
    deck,
    createPileToPileCardMoveSequence(
      deck,
      firstStep.fromPile,
      tempTableau,
      cardsToTemp,
    ),
  );
  const deckAfterTemp = applyCardMoves(deck, moveToTemp);

  const moveToTarget = expand(
    deckAfterTemp,
    createPileToPileCardMoveSequence(
      deckAfterTemp,
      firstStep.fromPile,
      firstStep.toPile,
      moveSize - cardsToTemp,
    ),
  );
  const deckAfterTarget = applyCardMoves(deckAfterTemp, moveToTarget);

  const moveFromTemp = expand(
    deckAfterTarget,
    createPileToPileCardMoveSequence(
      deckAfterTarget,
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

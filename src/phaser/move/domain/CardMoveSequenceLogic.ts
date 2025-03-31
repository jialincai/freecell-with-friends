import { CELL_PILES, PileId, TABLEAU_PILES } from "@phaser/constants/table";
import {
  filterEmptyPiles,
  getCardsInPile,
  applyCardMoves,
} from "@phaser/deck/domain/DeckLogic";
import { Deck } from "@phaser/deck/state/Deck";
import { calculateMaxMoveSize } from "@phaser/game/domain/FreecellRules";
import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@phaser/move/CardMoveSequence";
import { CardMove, createCardMove } from "@phaser/move/CardMove";

/**
 * Expands a simplified move sequence to include intermediate steps.
 * Undefined error if move sequence is invalid.
 */
export function expand(
  deck: Deck,
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  const moveSize = cardMoves.steps.length;
  const [first] = cardMoves.steps;

  const emptyCells = filterEmptyPiles(deck, CELL_PILES).length;
  const emptyTableaus = filterEmptyPiles(
    deck,
    TABLEAU_PILES.filter((p) => p !== first.toPile),
  );
  const maxMoveSize = calculateMaxMoveSize(deck, []);
  const maxCellOnlyMoveSize = calculateMaxMoveSize(deck, TABLEAU_PILES);
  const minTableaus = calculateMinTableaus(moveSize, emptyCells);

  if (moveSize > maxMoveSize) {
    throw new Error(
      `Move size (${moveSize}) exceeds allowed maximum (${maxMoveSize}).`,
    );
  }
  if (minTableaus > emptyTableaus.length) {
    throw new Error(
      `Cannot expand move sequence: requires ${minTableaus} empty tableaus, but only ${emptyTableaus.length} available.`,
    );
  }

  // Base Case
  if (moveSize <= maxCellOnlyMoveSize) {
    return expandViaFreeCells(deck, cardMoves);
  } else {
    const temp = emptyTableaus[0];
    return expandViaTempTableauRecursive(deck, cardMoves, temp);
  }
}

/**
 * Recursively expands a move sequence using one temporary tableau pile.
 */
function expandViaTempTableauRecursive(
  deck: Deck,
  cardMoves: CardMoveSequence,
  temp: PileId,
): CardMoveSequence {
  const [firstMove] = cardMoves.steps;
  const moveSize = cardMoves.steps.length;
  const cellLimit = calculateMaxMoveSize(deck, TABLEAU_PILES);

  const firstPart = expand(
    deck,
    createCardMoveSequenceFromDeck(deck, firstMove.fromPile, temp, cellLimit),
  );
  const deckAfterFirst = applyCardMoves(deck, firstPart);

  const secondPart = expand(
    deckAfterFirst,
    createCardMoveSequenceFromDeck(
      deckAfterFirst,
      firstMove.fromPile,
      firstMove.toPile,
      moveSize - cellLimit,
    ),
  );
  const deckAfterSecond = applyCardMoves(deckAfterFirst, secondPart);

  const thirdPart = expand(
    deckAfterSecond,
    createCardMoveSequenceFromDeck(
      deckAfterSecond,
      temp,
      firstMove.toPile,
      cellLimit,
    ),
  );

  return createCardMoveSequence([
    ...firstPart.steps,
    ...secondPart.steps,
    ...thirdPart.steps,
  ]);
}

function expandViaFreeCells(
  deck: Deck,
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  const [top, ...children] = cardMoves.steps;

  const empty = filterEmptyPiles(
    deck,
    [...CELL_PILES, ...TABLEAU_PILES].filter((p) => p !== top.toPile),
  );

  const childrenToCells = [...children]
    .reverse()
    .map((step, i) =>
      createCardMove(step.card, step.fromPile, step.fromPosition, empty[i], 0),
    );

  const topToTarget = createCardMove(
    top.card,
    top.fromPile,
    top.fromPosition,
    top.toPile,
    top.toPosition,
  );

  const childrenToTarget = children.map((step, i) =>
    createCardMove(
      step.card,
      empty[children.length - i - 1],
      0,
      step.toPile,
      step.toPosition,
    ),
  );

  return createCardMoveSequence([
    ...childrenToCells,
    topToTarget,
    ...childrenToTarget,
  ]);
}

/**
 * Calculates the number of empty tableau piles required to legally move a given number of cards.
 */
function calculateMinTableaus(moveSize: number, emptyCells: number): number {
  return Math.ceil(Math.log2(moveSize / (emptyCells + 1)));
}

/**
 * Generates a move sequence for the last N cards in a pile.
 */
function createCardMoveSequenceFromDeck(
  deck: Deck,
  fromPile: PileId,
  toPile: PileId,
  nCardsToMove: number,
): CardMoveSequence {
  const from = getCardsInPile(deck, fromPile);
  const to = getCardsInPile(deck, toPile);

  const startFrom = from.length - nCardsToMove;
  const startTo = to.length;

  const steps = from
    .slice(-nCardsToMove)
    .map((card, i) =>
      createCardMove(
        card.data.id,
        fromPile,
        startFrom + i,
        toPile,
        startTo + i,
      ),
    );

  return createCardMoveSequence(steps);
}

/**
 * Reverses a move sequence for undo logic.
 */
export function deriveUndo(cardMoves: CardMoveSequence): CardMoveSequence {
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

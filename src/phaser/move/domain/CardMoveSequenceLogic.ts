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
import { createCardMove } from "../CardMove";

/**
 * Expands a simplified move sequence to include temporary intermediates states.
 * Assuming same pile card moves will occur by ascending position.
 * Undefined behavior if the move provided is not legal.
 */
export function expand(
  deck: Deck,
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  const emptyCells = filterEmptyPiles(deck, CELL_PILES);
  const emptyTableaus = filterEmptyPiles(deck, TABLEAU_PILES);
  const moveSize = cardMoves.steps.length;
  const maxMoveSize = calculateMaxMoveSize(deck, []);
  const maxCellOnlyMoveSize = calculateMaxMoveSize(deck, TABLEAU_PILES);

  if (moveSize > maxMoveSize) {
    throw new Error(
      `Cannot expand move sequence: move size (${moveSize}) exceeds max move size (${maxMoveSize}).`,
    );
  }

  // 0 Tableaus required (Base case)
  if (cardMoves.steps.length <= maxCellOnlyMoveSize) {
    return handleBaseCase(deck, cardMoves);
    // 1 Tableau required
  } else if (
    cardMoves.steps.length <= calculateMaxMoveSize(deck, TABLEAU_PILES.slice(1))
  ) {
    let workingDeck = deck;
    const source = cardMoves.steps[0].fromPile;
    const target = cardMoves.steps[0].toPile;
    const tableau = emptyTableaus[0];

    const maxToTableau = expand(
      deck,
      createCardMoveSequenceFromDeck(
        deck,
        source,
        tableau,
        maxCellOnlyMoveSize,
      ),
    );
    workingDeck = applyCardMoves(deck, maxToTableau);

    const remainingToTarget = expand(
      deck,
      createCardMoveSequenceFromDeck(
        deck,
        source,
        target,
        moveSize - maxCellOnlyMoveSize,
      ),
    );
    workingDeck = applyCardMoves(deck, remainingToTarget);

    // Move tableau to target
    const tableauToTarget = expand(
      deck,
      createCardMoveSequenceFromDeck(
        deck,
        tableau,
        target,
        maxCellOnlyMoveSize,
      ),
    );

    return createCardMoveSequence([
      ...maxToTableau.steps,
      ...remainingToTarget.steps,
      ...tableauToTarget.steps,
    ]);
  }
}

function handleBaseCase(
  deck: Deck,
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  const emptyCells = filterEmptyPiles(deck, CELL_PILES);
  const [top, ...children] = cardMoves.steps;

  const childrenToCells = [...children]
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
      emptyCells[children.length - i - 1],
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

function createCardMoveSequenceFromDeck(
  deck: Deck,
  fromPile: PileId,
  toPile: PileId,
  count: number,
): CardMoveSequence {
  const fromCards = getCardsInPile(deck, fromPile);
  const toCards = getCardsInPile(deck, toPile);

  const cardsToMove = fromCards.slice(-count); // get last N cards
  const startFromPosition = fromCards.length - count;
  const startToPosition = toCards.length;

  const steps = cardsToMove.map((card, i) =>
    createCardMove(
      card.data.id,
      fromPile,
      startFromPosition + i,
      toPile,
      startToPosition + i,
    ),
  );

  return createCardMoveSequence(steps);
}

export function deriveUndo(cardMoves: CardMoveSequence): CardMoveSequence {
  return createCardMoveSequence(
    [...cardMoves.steps].reverse().map((move) => {
      return {
        card: move.card,
        fromPile: move.toPile,
        fromPosition: move.toPosition,
        toPile: move.fromPile,
        toPosition: move.fromPosition,
      };
    }),
  );
}

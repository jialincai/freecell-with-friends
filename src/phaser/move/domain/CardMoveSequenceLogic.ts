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
  const [firstMove] = cardMoves.steps;
  const { fromPile: source, toPile: target } = firstMove;

  const moveSize = cardMoves.steps.length;
  const maxMoveSize = calculateMaxMoveSize(deck, []);
  const maxCellOnlyMoveSize = calculateMaxMoveSize(deck, TABLEAU_PILES);

  console.log(`source: ${source}, target: ${target}`);
  console.log(`moveSize: ${moveSize}, maxMoveSize: ${maxMoveSize}`);

  if (moveSize > maxMoveSize) {
    throw new Error(
      `Move size (${moveSize}) exceeds allowed max (${maxMoveSize})`,
    );
  }

  if (moveSize <= maxCellOnlyMoveSize) {
    return expandCellOnlyMove(deck, cardMoves);
  }

  const emptyTableaus = filterEmptyPiles(
    deck,
    TABLEAU_PILES.filter((p) => p !== target),
  );

  if (moveSize <= calculateMaxMoveSize(deck, emptyTableaus.slice(1))) {
    const tableau = emptyTableaus[0];

    const moveToTemp = expand(
      deck,
      createCardMoveSequenceFromDeck(
        deck,
        source,
        tableau,
        maxCellOnlyMoveSize,
      ),
    );
    const deckAfterTemp = applyCardMoves(deck, moveToTemp);

    const moveRemaining = expand(
      deckAfterTemp,
      createCardMoveSequenceFromDeck(
        deckAfterTemp,
        source,
        target,
        moveSize - maxCellOnlyMoveSize,
      ),
    );
    const deckAfterRemaining = applyCardMoves(deckAfterTemp, moveRemaining);

    const moveTempToTarget = expand(
      deckAfterRemaining,
      createCardMoveSequenceFromDeck(
        deckAfterRemaining,
        tableau,
        target,
        maxCellOnlyMoveSize,
      ),
    );

    return createCardMoveSequence([
      ...moveToTemp.steps,
      ...moveRemaining.steps,
      ...moveTempToTarget.steps,
    ]);
  }

  console.log("No expansion case matched.");
  return cardMoves;
}

function expandCellOnlyMove(
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

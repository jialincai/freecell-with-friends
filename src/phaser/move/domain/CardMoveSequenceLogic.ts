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
import { CardMove, createCardMove } from "@phaser/move/CardMove";
import { calculateMaxMoveSize, calculateMaxMoveSizeSimple, calculateMinTempTableausSimple } from "@phaser/game/domain/FreecellRules";

/**
 * Expands a simplified move sequence to include intermediate steps.
 *
 * A simplified move sequence has the following attributes
 * 1) Doesn't exceed maximum number of movable cards.
 * 1) N number of cards from the bottom of one pile moved to another pile.
 * 2) Cards moved in descending position order.
 *
 * This function yeilds undefined behavior if move sequence
 * does not adhere to these rules.
 */
export function expand(
  deck: Deck,
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  const moveSize = cardMoves.steps.length;
  const [firstStep] = cardMoves.steps;

  const emptyCells = filterEmptyPiles(deck, CELL_PILES);
  if (moveSize <= emptyCells.length + 1) {
    return expandViaCells(deck, cardMoves);
  }

  console.log("attempting recursion");
  const tempTableaus = filterEmptyPiles(
    deck,
    TABLEAU_PILES.filter((pile) => pile !== firstStep.toPile),
  );
  return expandViaTempTableauPilesRecursive(deck, cardMoves, tempTableaus[0]);
}

function expandViaTempTableauPilesRecursive(
  deck: Deck,
  cardMoves: CardMoveSequence,
  temp: PileId,
): CardMoveSequence {
  const moveSize = cardMoves.steps.length;
  const [firstStep] = cardMoves.steps;

  const emptyCells = filterEmptyPiles(deck, CELL_PILES);
  const tempTableaus = filterEmptyPiles(
    deck,
    TABLEAU_PILES.filter((pile) => pile !== firstStep.toPile),
  );
  const minTableau = calculateMinTempTableausSimple(moveSize, emptyCells.length);
  const subOne = calculateMaxMoveSizeSimple(emptyCells.length, minTableau - 1);

  const sourceToTempTableau = expand(
    deck,
    createCardMoveSequenceFromDeck(
      deck,
      firstStep.fromPile,
      temp,
      subOne,
    ),
  );
  const deckAfterSourceToTempTableau = applyCardMoves(deck, sourceToTempTableau);

  const sourceToTarget = expand(
    deckAfterSourceToTempTableau,
    createCardMoveSequenceFromDeck(
      deckAfterSourceToTempTableau,
      firstStep.fromPile,
      firstStep.toPile,
      moveSize - subOne,
    ),
  );
  const deckAfterSourceToTarget = applyCardMoves(deckAfterSourceToTempTableau, sourceToTarget);

  const tempTableauToTarget = expand(
    deckAfterSourceToTarget,
    createCardMoveSequenceFromDeck(
      deckAfterSourceToTarget,
      temp,
      firstStep.toPile,
      subOne,
    ),
  );

  return createCardMoveSequence([
    ...sourceToTempTableau.steps,
    ...sourceToTarget.steps,
    ...tempTableauToTarget.steps,
  ]);
}

function expandViaCells(
  deck: Deck,
  cardMoves: CardMoveSequence,
): CardMoveSequence {
  const [top, ...children] = cardMoves.steps;
  const emptyCells = filterEmptyPiles(deck, CELL_PILES);

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

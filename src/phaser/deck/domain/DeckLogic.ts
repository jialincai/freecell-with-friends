import { Card } from "@phaser/card/state/Card";
import { Deck } from "@phaser/deck/state/Deck";
import { PileId, TABLEAU_PILES } from "@phaser/constants/table";
import { withFaceUp, withPilePosition } from "@phaser/card/domain/CardLogic";
import { CardMoveSequence } from "@phaser/move/CardMoveSequence";

export function applyCardMoves(
  deck: Deck,
  cardMoves: CardMoveSequence,
): Deck {
  const updatedCards = cardMoves.steps.reduce((cards, move) => {
    return cards.map((card) => {
      if (card.data.id !== move.card) return card;

      return {
        ...card,
        state: withPilePosition(card.state, move.toPile, move.toPosition),
      };
    });
  }, deck.cards);

  return {
    ...deck,
    cards: updatedCards,
  };
}

export function getCardsInPile(deck: Deck, pileId: PileId): Card[] {
  return deck.cards
    .filter((card) => card.state.pile === pileId)
    .sort((a, b) => a.state.position - b.state.position);
}

export function getCardsStartingFrom(deck: Deck, target: Card): Card[] {
  return getCardsInPile(deck, target.state.pile).filter(
    (card) => card.state.position >= target.state.position,
  );
}

export function filterEmptyPiles(deck: Deck, piles: PileId[]) {
  return piles.filter((pile) => {
    return getCardsInPile(deck, pile).length === 0;
  });
}

export function dealCards(deck: Deck): Deck {
  const cards = deck.cards.map((card, index) => {
    const pile = TABLEAU_PILES[index % 8];
    const position = Math.floor(index / 8);

    return {
      ...card,
      state: {
        ...withFaceUp(card.state),
        pile,
        position,
      },
    };
  });

  return { ...deck, cards };
}

export function shuffleCards(deck: Deck, seed: number): Deck {
  const a = 214013;
  const c = 2531011;
  const m = 2147483648;
  let rng = seed >>> 0;

  const shuffled = [...deck.cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    rng = (a * rng + c) % m >>> 0;
    const j = Math.floor((rng / 65536) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    ...deck,
    cards: shuffled.reverse(),
  };
}

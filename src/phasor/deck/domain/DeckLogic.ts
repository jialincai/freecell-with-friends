import { Card } from "@phasor/card/state/Card";
import { Deck } from "@phasor/deck/state/Deck";
import { PileId, TABLEAU_PILES } from "@phasor/constants/table";
import { withFaceUp } from "@phasor/card/domain/CardLogic";

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

export function deal(deck: Deck): Deck {
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

export function shuffle(deck: Deck, seed: number): Deck {
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

import { Card } from "@phasor/card/state/Card";
import { Deck } from "@phasor/deck/state/Deck";
import { PileId } from "@phasor/constants/table";

export function pileChildren(deck: Deck, pileId: PileId): Card[] {
  return deck.cards
    .filter((card) => card.state.pile === pileId)
    .sort((a, b) => a.state.position - b.state.position);
}

export function cardChildren(deck: Deck, target: Card): Card[] {
  return pileChildren(deck, target.state.pile).filter(
    (card) => card.state.position >= target.state.position,
  );
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

import { Card } from "@phaser/card/state/Card";
import { Deck } from "@phaser/deck/state/Deck";
import { PileId, TABLEAU_PILES } from "@phaser/constants/table";
import { withFaceUp, withPilePosition } from "@phaser/card/domain/CardLogic";
import { CardMoveSequence } from "@phaser/move/CardMoveSequence";
import { Rank, Suit } from "@phaser/constants/deck";

export function calculateNewPilePosition(
  deck: Deck,
  cards: Card[],
  pileId: PileId,
): Array<{ pile: PileId; position: number }> {
  const startPosition = getCardsInPile(deck, pileId).length;
  return cards.map((_, i) => ({
    pile: pileId,
    position: startPosition + i,
  }));
}

export function applyCardMoves(deck: Deck, cardMoves: CardMoveSequence): Deck {
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

// TODO: This function is for debugging only.
// Please remove this function or move into a test in the future.
export function setupTableauDrag(deck: Deck): Deck {
  const sorted = [...deck.cards].sort((a, b) => b.data.rank - a.data.rank);

  // Group by suit
  const hearts = sorted.filter((c) => c.data.suit === Suit.Hearts);
  const diamonds = sorted.filter((c) => c.data.suit === Suit.Diamonds);
  const spades = sorted.filter((c) => c.data.suit === Suit.Spades);
  const clubs = sorted.filter((c) => c.data.suit === Suit.Clubs);

  // Build one stack starting with red, one with black
  const redFirstStack = buildAlternatingStack([...hearts], [...clubs], "red");
  const blackFirstStack = buildAlternatingStack(
    [...spades],
    [...diamonds],
    "black",
  );

  // Assign stacks to Tableau1 and Tableau2
  redFirstStack.forEach((card, i) => {
    card.state = {
      ...withFaceUp(card.state),
      pile: PileId.Tableau1,
      position: i,
    };
  });

  blackFirstStack.forEach((card, i) => {
    card.state = {
      ...withFaceUp(card.state),
      pile: PileId.Tableau2,
      position: i,
    };
  });

  // Collect all used card IDs
  const usedIds = new Set(
    [...redFirstStack, ...blackFirstStack].map((c) => c.data.id),
  );

  // Put the remaining cards into PileId.None
  const rest = deck.cards
    .filter((c) => !usedIds.has(c.data.id))
    .map((card) => ({
      ...card,
      state: {
        ...withFaceUp(card.state),
        pile: PileId.None,
        position: 0,
      },
    }));

  return {
    cards: [...redFirstStack, ...blackFirstStack, ...rest],
  };
}

// TODO: This function is for debugging only. It's a helper for setupTableauDrag.
// Please remove this function or move into a test in the future.
function buildAlternatingStack(
  redSuitCards: Card[],
  blackSuitCards: Card[],
  startingColor: "red" | "black",
  maxLength = 13,
): Card[] {
  const stack: Card[] = [];
  let rank = Rank.King;
  let color = startingColor;

  while (rank >= Rank.Ace && stack.length < maxLength) {
    const source = (color === "red" ? redSuitCards : blackSuitCards).filter(
      (card) => card.data.rank === rank && !stack.includes(card),
    );

    if (source.length > 0) {
      const card = source[0];
      stack.push(card);
      color = color === "red" ? "black" : "red";
    }

    rank--;
  }

  return stack;
}

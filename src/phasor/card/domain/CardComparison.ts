import { CardData } from "@phasor/card/CardData";
import { SUIT_COLOR } from "@phasor/constants/deck";

export const isValidStack = (
  cards: CardData[],
  predicates: ((a: CardData, b: CardData) => boolean)[],
): boolean =>
  cards.every(
    (card, index) =>
      index === 0 ||
      predicates.every((predicates) => predicates(card, cards[index - 1])),
  );

export const isSameColor = (a: CardData, b: CardData): boolean =>
  SUIT_COLOR[a.suit] === SUIT_COLOR[b.suit];

export const isDifferentColor = (a: CardData, b: CardData): boolean =>
  SUIT_COLOR[a.suit] !== SUIT_COLOR[b.suit];

export const isSameSuit = (a: CardData, b: CardData): boolean =>
  a.suit === b.suit;

export const hasDifferentSuit = (a: CardData, b: CardData): boolean =>
  a.suit !== b.suit;

export const isDescending = (a: CardData, b: CardData): boolean =>
  a.value === b.value - 1;

export const isAscending = (a: CardData, b: CardData): boolean =>
  a.value === b.value + 1;

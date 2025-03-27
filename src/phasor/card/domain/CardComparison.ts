import { CardData } from "@phasor/card/CardData";
import { SUIT_COLOR } from "@phasor/constants/deck";

export const isValidStack = (
  cards: CardData[],
  predicates: ((a: CardData, b: CardData) => boolean)[],
): boolean => {
  return cards.every(
    (card, index) =>
      index === 0 ||
      predicates.every((predicate) => predicate(card, cards[index - 1])),
  );
}

export const isSameColor = (a: CardData, b: CardData): boolean => {
  return SUIT_COLOR[a.suit] === SUIT_COLOR[b.suit];
}

export const isDifferentColor = (a: CardData, b: CardData): boolean => {
  return SUIT_COLOR[a.suit] !== SUIT_COLOR[b.suit];
}

export const isSameSuit = (a: CardData, b: CardData): boolean => {
  return a.suit === b.suit;
}

export const isDifferentSuit = (a: CardData, b: CardData): boolean => {
  return a.suit !== b.suit;
}

export const isDescending = (a: CardData, b: CardData): boolean => {
  return a.value === b.value - 1;
}

export const isAscending = (a: CardData, b: CardData): boolean => {
  return a.value === b.value + 1;
}

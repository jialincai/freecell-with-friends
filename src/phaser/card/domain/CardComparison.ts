import { CardData } from "phaser/card/CardData";
import { SUIT_COLOR } from "phaser/constants/deck";

/**
 * Higher-order function to validate a sequence of cards based on multiple checks.
 */
export const isValidSequence = (
  cards: CardData[],
  checks: ((a: CardData, b: CardData) => boolean)[],
): boolean =>
  cards.every(
    (card, index) =>
      index === 0 || checks.every((check) => check(card, cards[index - 1])),
  );

/**
 * Checks if two cards have alternating colors.
 */
export const hasAlternatingColor = (a: CardData, b: CardData): boolean =>
  SUIT_COLOR[a.suit] !== SUIT_COLOR[b.suit];

/**
 * Checks if two cards have the same color.
 */
export const hasSameColor = (a: CardData, b: CardData): boolean =>
  SUIT_COLOR[a.suit] === SUIT_COLOR[b.suit];

/**
 * Checks if two cards have the same suit.
 */
export const hasSameSuit = (a: CardData, b: CardData): boolean =>
  a.suit === b.suit;

/**
 * Checks if two cards are in descending order.
 */
export const isDescendingOrder = (a: CardData, b: CardData): boolean =>
  a.value === b.value - 1;

/**
 * Checks if two cards are in ascending order.
 */
export const isAscendingOrder = (a: CardData, b: CardData): boolean =>
  a.value === b.value + 1;

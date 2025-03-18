import Card from "./Card";
import { SUIT_COLOR } from "./constants/deck";

/**
 * Higher-order function to validate a sequence of cards based on multiple checks.
 */
export const isValidSequence = (
    cards: Card[],
    checks: ((card1: Card, card2: Card) => boolean)[]
): boolean =>
    cards.every((child, index) =>
        index === 0 || checks.every(check => check(child, cards[index - 1]))
    );

/**
 * Checks if two cards have alternating colors.
 */
export const hasAlternatingColor = (card1: Card, card2: Card): boolean =>
    SUIT_COLOR[card1.suit] !== SUIT_COLOR[card2.suit];

/**
 * Checks if two cards have the same color.
 */
export const hasSameColor = (card1: Card, card2: Card): boolean =>
    SUIT_COLOR[card1.suit] === SUIT_COLOR[card2.suit];

/**
 * Checks if two cards have the same suit.
 */
export const hasSameSuit = (card1: Card, card2: Card): boolean =>
    card1.suit === card2.suit;

/**
 * Checks if two cards are in descending order.
 */
export const isDescendingOrder = (card1: Card, card2: Card): boolean =>
    card1.value === card2.value - 1;

/**
 * Checks if two cards are in ascending order.
 */
export const isAscendingOrder = (card1: Card, card2: Card): boolean =>
    card1.value === card2.value + 1;

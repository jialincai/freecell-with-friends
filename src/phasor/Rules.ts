import Deck from "./Deck";
import Card from "./Card";
import { CELL_PILES, FOUNDATION_PILES, PileId, TABLEAU_PILES } from "./constants/table";
import { SUIT_COLOR } from "./constants/deck";

/**
 * Defines the drop rules for different pile types.
 */
const DROP_RULES: Record<PileId, (deck: Deck, card: Card) => boolean> = Object.fromEntries([
    // Cell piles: Only one card can be placed, and the pile must be empty.
    ...CELL_PILES.map(pileId => [pileId, (deck: Deck, card: Card) => {
        const topCard = deck.topCard(pileId);
        const dragChildren = deck.cardChildren(card);
        return !topCard && dragChildren.length === 1;
    }]),
    
    // Foundation piles: Cards must be placed in ascending order and match suit.
    ...FOUNDATION_PILES.map(pileId => [pileId, (deck: Deck, card: Card) => {
        const topCard = deck.topCard(pileId);
        if (!topCard) return card.value === 1; // Only aces can be placed in an empty foundation pile.
        return card.suit === topCard.suit && card.value === topCard.value + 1;
    }]),
    
    // Tableau piles: Cards must alternate in color and be placed in descending order.
    ...TABLEAU_PILES.map(pileId => [pileId, (deck: Deck, card: Card) => {
        const topCard = deck.topCard(pileId);
        const dragChildren = deck.cardChildren(card);
        if (!topCard) return true; // Any card can be placed on an empty tableau pile.
        return dragChildren.length > 0 && dragChildren.every((child, index) => {
            const prevCard: Card = index === 0 ? topCard : dragChildren[index - 1];
            return (
                SUIT_COLOR[child.suit] !== SUIT_COLOR[prevCard.suit] && // Must be opposite colors.
                child.value === prevCard.value - 1 // Must be in descending order.
            );
        });
    }])
]);

/**
 * Evaluates which piles a card can be dropped onto.
 *
 * @param {Deck} deck - The current deck state.
 * @param {Card} card - The card being moved.
 * @param {PileId[]} pileIds - A collection of target pile IDs.
 * @returns {boolean[]} An array indicating whether each pile allows the drop, in the same order.
 */
export function evaluateDropPiles(deck: Deck, card: Card, pileIds: PileId[]): boolean[] {
    return pileIds.map(pileId => DROP_RULES[pileId]?.(deck, card) ?? false);
}

/**
 * Retrieves only the piles where a card can be legally dropped.
 *
 * @param {Deck} deck - The current deck state.
 * @param {Card} card - The card being moved.
 * @param {PileId[]} pileIds - A collection of target pile IDs.
 * @returns {PileId[]} An array of valid pile IDs where the card can be dropped.
 */
export function getValidDropPiles(deck: Deck, card: Card, pileIds: PileId[]): PileId[] {
    return pileIds.filter(pileId => DROP_RULES[pileId]?.(deck, card) ?? false);
}

/**
 * Computes the new placements for a set of cards after a move.
 *
 * @param {Deck} deck - The current deck state.
 * @param {Card[]} cards - The cards being moved.
 * @param {PileId} pileId - The target pile ID.
 * @returns {Array<{ pileId: PileId; position: number }>} The new positions of the moved cards.
 */
export function getUpdatedCardPlacements(
    deck: Deck,
    cards: Card[],
    pileId: PileId
): Array<{ pileId: PileId; position: number }> {
    // Get the top card in the target pile
    const topCard = deck.topCard(pileId);

    // Calculate new positions
    const basePosition = topCard ? topCard.position + 1 : 0;
    return cards.map((_, index) => ({
        pileId,
        position: basePosition + index,
    }));
}

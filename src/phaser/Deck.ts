import * as Phaser from "phaser";

import Card from "./Card";
import { NUM_CARDS, Suit } from "./constants/deck";
import type { PileId } from "./constants/table";
import { TABLEAU_PILES } from "./constants/table";

const NUM_VALUES = 13;

export default class Deck {
  public cards: Card[] = [];

  public constructor(scene: Phaser.Scene) {
    for (let i = 1; i < NUM_VALUES + 1; i += 1) {
      Object.values(Suit).forEach((t) => {
        this.cards.push(new Card(scene, t, i));
      });
    }

    this.cards = this.shuffle(this.cards, 476);
    this.deal(scene);
  }

  public deal(scene: Phaser.Scene): void {
    // Flip all back
    this.cards.forEach((card: Card) => {
      card.flip(scene);
    });

    for (let cardIndex = 0; cardIndex < NUM_CARDS; cardIndex += 1) {
      const col = cardIndex % 8;
      const row = Math.floor(cardIndex / 8);
      this.cards[cardIndex].reposition(TABLEAU_PILES[col], row);
    }
  }

  public shuffle(deck: Card[], seed: number): Card[] {
    const a = 214013;
    const c = 2531011;
    const m = 2147483648;
    let rng = seed >>> 0;

    for (let i = 51; i > 0; i--) {
      rng = (a * rng + c) % m >>> 0;
      const j = Math.floor((rng / 65536) % (i + 1));

      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    deck.reverse();
    return deck;
  }

  /**
   * Retrieves all cards in the specified pile, sorted by ascending position.
   *
   * @param {PileId} pile - The ID of the pile to retrieve cards from.
   * @returns {Card[]} An array of cards in the pile, sorted by position.
   */
  public pileChildren(pile: PileId): Card[] {
    return this.cards
      .filter((curr: Card) => curr.pile === pile)
      .sort((a: Card, b: Card) => a.position - b.position);
  }

  /**
   * Returns the given card and all following cards in the same pile.
   *
   * @param {Card} card - The reference card.
   * @returns {Card[]} Cards in the same pile, sorted by ascending position.
   */
  public cardChildren(card: Card): Card[] {
    return this.pileChildren(card.pile).filter(
      (curr: Card) => curr.position >= card.position,
    );
  }
}

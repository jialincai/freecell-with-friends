import { Deck } from "@phaser/deck/state/Deck";
import { CardMove, createCardMove } from "@phaser/move/CardMove";
import { PileId } from "@phaser/constants/table";
import { getCardsInPile } from "@phaser/deck/domain/DeckLogic";
import { filterValidDropPiles } from "@phaser/game/domain/FreecellRules";
import { Card } from "@phaser/card/state/Card";

export function getSingleCardMoves(
  deck: Deck,
  sources: PileId[],
  targets: PileId[],
): CardMove[] {
  return sources
    .map((pile) => getCardsInPile(deck, pile).at(-1))
    .filter((card): card is Card => Boolean(card))
    .flatMap((card) =>
      filterValidDropPiles(deck, card, targets).map((target) =>
        createCardMove(
          card.data.id,
          card.state.pile,
          card.state.position,
          target,
          getCardsInPile(deck, target).length,
        ),
      ),
    );
}

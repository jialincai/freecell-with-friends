import { PileId } from "@phasor/constants/table";
import { cardMoveCommandData } from "@phasor/command/CommandData";
import { CardController } from "@phasor/card/CardController";

export type CardMoveCommand = {
  data: cardMoveCommandData;
};

export function createCardMoveCommand(
  card: CardController,
  newPile: PileId,
  newPosition: number,
): CardMoveCommand {
  return {
    data: {
      card: card,
      fromPile: card.model.state.pile,
      fromPosition: card.model.state.position,
      toPile: newPile,
      toPosition: newPosition,
    },
  };
}

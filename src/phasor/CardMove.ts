import { Command } from "@utils/Function";
import Card from "./Card";
import { PileId } from "./constants/table";

/**
 * Represents a command that moves a card from one pile to another.
 * This command includes both the data describing the move and the behavior
 * to execute (`do`) and reverse (`undo`) it.
 */
export type CardMoveCommand = Command & {
  type: "card-move";
  data: {
    card: Card;
    from: { pileId: PileId; position: number };
    to: { pileId: PileId; position: number };
  };
};

/**
 * Creates a CardMoveCommand using the provided card and move details.
 * The returned command object includes:
 * - `type`: used to identify the command type (for inspection or interpretation)
 * - `data`: metadata about the move, including the card and source/target locations
 * - `do`: executes the move
 * - `undo`: reverses the move
 *
 * @param card The card to move.
 * @param from The source pile and position.
 * @param to The destination pile and position.
 * @returns A fully functional CardMoveCommand.
 */
export function createCardMoveCommand(
  card: Card,
  from: { pileId: PileId; position: number },
  to: { pileId: PileId; position: number },
): CardMoveCommand {
  return {
    type: "card-move",
    data: { card, from, to },
    do: () => card.reposition(to.pileId, to.position),
    undo: () => card.reposition(from.pileId, from.position),
  };
}

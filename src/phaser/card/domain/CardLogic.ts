import { PileId } from "phaser/constants/table";
import { CardState } from "phaser/card/state/CardState";

export function flipFaceUp(state: CardState): CardState {
  return { ...state, flipped: true };
}

export function flipFaceDown(state: CardState): CardState {
  return { ...state, flipped: false };
}

export function reposition(
  state: CardState,
  pile: PileId,
  position: number,
): CardState {
  return { ...state, pile, position };
}

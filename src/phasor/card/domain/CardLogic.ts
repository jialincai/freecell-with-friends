import { PileId } from "@phasor/constants/table";
import { CardState } from "@phasor/card/state/CardState";

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

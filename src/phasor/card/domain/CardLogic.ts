import { PileId } from "@phasor/constants/table";
import { CardState } from "@phasor/card/state/CardState";

export function withFaceUp(state: CardState): CardState {
  return { ...state, flipped: true };
}

export function withFaceDown(state: CardState): CardState {
  return { ...state, flipped: false };
}

export function withPilePosition(
  state: CardState,
  pile: PileId,
  position: number,
): CardState {
  return { ...state, pile, position };
}

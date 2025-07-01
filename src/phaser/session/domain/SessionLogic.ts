import { SessionState } from "@phaser/session/Session";

export function withPauseTime(
  state: SessionState,
  pauseTime: number,
): SessionState {
  return { ...state, pauseTime: pauseTime };
}

export function withStartTime(
  state: SessionState,
  startTime: number,
): SessionState {
  return { ...state, startTime: startTime };
}

import { SessionState } from "@/phaser/session/Session";

export function withTimeElapsedMs(
  state: SessionState,
  timeElapsedMs: number,
): SessionState {
  return { ...state, timeElapsedMs: timeElapsedMs };
}

export function formatTimerText(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `Time: ${minutes}:${seconds}`;
}

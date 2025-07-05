export type SessionData = Record<string, never>;

export type SessionState = {
  timeElapsedMs: number;
};

export type Session = {
  data: SessionData;
  state: SessionState;
};

export function createSession(): Session {
  return {
    data: {},
    state: { timeElapsedMs: 0 },
  };
}

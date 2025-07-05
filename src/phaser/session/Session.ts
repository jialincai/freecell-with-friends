export type SessionData = {};

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

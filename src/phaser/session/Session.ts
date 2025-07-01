export type SessionData = {};

export type SessionState = {
  startTime: number;
  pauseTime: number;
};

export type Session = {
  data: SessionData;
  state: SessionState;
};

export function createSession(startTime: number, pauseTime: number): Session {
  return {
    data: {},
    state: { startTime, pauseTime },
  };
}

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE seeds (
  date DATE PRIMARY KEY
);

CREATE TABLE completions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seed_date DATE REFERENCES seeds(date),
  completion_time_ms INTEGER NOT NULL CHECK(completion_time_ms >= 0),
  move_history JSONB NOT NULL,
  PRIMARY KEY(user_id, seed_date)
);

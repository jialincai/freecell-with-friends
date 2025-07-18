CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  ms_seed INTEGER UNIQUE NOT NULL,
  date DATE UNIQUE NOT NULL
);

COPY deals (ms_seed, date)
FROM '/docker-entrypoint-initdb.d/freecell_deals_seeded_20250718.csv'
WITH (FORMAT csv);

CREATE TABLE completions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  completion_time_ms INTEGER NOT NULL CHECK (
    completion_time_ms >= 0 AND completion_time_ms <= 86400000
  ),
  move_history JSONB NOT NULL,
  PRIMARY KEY(user_id, deal_id)
);
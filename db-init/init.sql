SET timezone = 'UTC';

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  seed INTEGER UNIQUE NOT NULL,
  date DATE UNIQUE NOT NULL
);

/*
This command is for REMOTE DEVELOPMENT ONLY.
Do not run this command in Neon's SQL editor.
*/
COPY deals (seed, date)
FROM '/docker-entrypoint-initdb.d/freecell_deals_shuffled_20260809.csv'
WITH (FORMAT csv, HEADER);

CREATE TABLE games (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  elapsed_time_ms INTEGER NOT NULL CHECK (
    elapsed_time_ms >= 0 AND elapsed_time_ms <= 86400000
  ),
  moves JSONB NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY(user_id, deal_id)
);

CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  curr INTEGER NOT NULL DEFAULT 0,
  max INTEGER NOT NULL DEFAULT 0,
  last_deal_id INTEGER NOT NULL DEFAULT -1
);

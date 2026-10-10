INSERT INTO games (user_id, deal_id, elapsed_time_ms, moves, completed)
SELECT
  u.id,
  d.id,
  -- 2-12 minutes, trending faster over time
  (120000 + random() * 600000 * (1 - 0.4 * (d.date - (CURRENT_DATE - :days)) / :days::float))::int,
  '[]'::jsonb,
  true
FROM users u
JOIN deals d
  ON d.date >= CURRENT_DATE - :days
 AND d.date < CURRENT_DATE
WHERE u.email = :'email'
  AND random() > 0.2
ON CONFLICT (user_id, deal_id) DO NOTHING;

-- Fake players, so the global median differs from your own times.
\if :{?players}
\else
  \set players 20
\endif

INSERT INTO users (id, email)
SELECT gen_random_uuid(), 'seed-player-' || n || '@seed.invalid'
FROM generate_series(1, :players) AS n
ON CONFLICT (email) DO NOTHING;

-- Each fake player gets a typical pace of 3-9 minutes; each game varies
-- from half to one and a half times that.
WITH fake_players AS MATERIALIZED (
  SELECT id, 180000 + random() * 360000 AS pace_ms
  FROM users
  WHERE email LIKE 'seed-player-%@seed.invalid'
)
INSERT INTO games (user_id, deal_id, elapsed_time_ms, moves, completed)
SELECT
  p.id,
  d.id,
  (p.pace_ms * (0.5 + random()))::int,
  '[]'::jsonb,
  true
FROM fake_players p
JOIN deals d
  ON d.date >= CURRENT_DATE - :days
 AND d.date < CURRENT_DATE
WHERE random() > 0.3
ON CONFLICT (user_id, deal_id) DO NOTHING;

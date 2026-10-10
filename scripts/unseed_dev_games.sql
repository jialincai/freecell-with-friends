DELETE FROM games
USING users
WHERE games.user_id = users.id
  AND users.email = :'email'
  AND games.moves = '[]'::jsonb;

-- Fake players; their games are removed with them (ON DELETE CASCADE).
DELETE FROM users
WHERE email LIKE 'seed-player-%@seed.invalid';

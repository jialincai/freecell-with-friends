import sql from "@/lib/db";
import { Streak } from "./streaks";

type Sql = typeof sql;

export async function upsertNewUser({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  await sql.begin(async (sql) => {
    await sql`
            INSERT INTO users (id, email)
            VALUES (${userId}, ${email})
            ON CONFLICT (id) DO NOTHING
        `;
    await sql`
            INSERT INTO streaks (user_id)
            VALUES (${userId})
            ON CONFLICT (user_id) DO NOTHING
        `;
  });
}

export async function upsertGame(
  {
    userId,
    dealId,
    elapsedTimeMs,
    moves,
    completed,
  }: {
    userId: string;
    dealId: number;
    elapsedTimeMs: number;
    moves: string;
    completed: boolean;
  },
  tx: Sql = sql,
) {
  // Once a game is marked completed, the server's state is authoritative:
  // further upserts (e.g. late progress syncs from the client) are no-ops.
  await tx`
    INSERT INTO games (user_id, deal_id, elapsed_time_ms, moves, completed)
    VALUES (${userId}, ${dealId}, ${elapsedTimeMs}, ${moves}::jsonb, ${completed})
    ON CONFLICT (user_id, deal_id) DO UPDATE
    SET elapsed_time_ms = EXCLUDED.elapsed_time_ms,
        moves = EXCLUDED.moves,
        completed = games.completed OR EXCLUDED.completed
    WHERE games.completed = false
  `;
}

export async function updateStreakAndCompleteGame({
  userId,
  dealId,
  elapsedTimeMs,
  moves,
}: {
  userId: string;
  dealId: number;
  elapsedTimeMs: number;
  moves: string;
}) {
  await sql.begin(async (tx) => {
    // Lock the game row first: if it's already completed, this is a repeat
    // sync (e.g. the client re-posting a completion it already recorded
    // after a remount/refresh) and the streak must not be touched again,
    // since last_deal_id has already advanced to today's deal.
    const [existingGame] = await tx`
      SELECT completed FROM games
      WHERE user_id = ${userId} AND deal_id = ${dealId}
      FOR UPDATE
    `;
    if (existingGame?.completed) {
      return;
    }

    const [streak] = await tx<Streak[]>`
      SELECT * FROM streaks
      WHERE user_id = ${userId}
      FOR UPDATE
    `;
    if (!streak) {
      throw new Error(`Missing streak for user ${userId}`);
    }

    const curr = streak.last_deal_id === dealId - 1 ? streak.curr + 1 : 1;
    const max = Math.max(streak.max, curr);

    await upsertGame(
      { userId, dealId, elapsedTimeMs, moves, completed: true },
      tx,
    );
    await tx`
      UPDATE streaks
      SET curr = ${curr},
          max = ${max},
          last_deal_id = ${dealId}
      WHERE user_id = ${userId}
    `;
  });
}

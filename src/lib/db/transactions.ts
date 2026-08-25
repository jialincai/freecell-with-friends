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
  // Unconditional overwrite — caller is responsible for not clobbering an
  // already-completed game (check first, in the same transaction).
  await tx`
    INSERT INTO games (user_id, deal_id, elapsed_time_ms, moves, completed)
    VALUES (${userId}, ${dealId}, ${elapsedTimeMs}, ${moves}::jsonb, ${completed})
    ON CONFLICT (user_id, deal_id) DO UPDATE
    SET elapsed_time_ms = EXCLUDED.elapsed_time_ms,
        moves = EXCLUDED.moves,
        completed = EXCLUDED.completed
  `;
}

// Idempotent: reconciles `streaks` against the latest completed deal in
// `games` (the source of truth). Safe to call redundantly from anywhere
// (after a completion, from a stats fetch, ...) — a no-op if already healed.
export async function healStreak(userId: string) {
  await sql.begin(async (tx) => {
    const [streak] = await tx<Streak[]>`
      SELECT * FROM streaks
      WHERE user_id = ${userId}
      FOR UPDATE
    `;

    const [latest] = await tx`
      SELECT deal_id FROM games
      WHERE user_id = ${userId} AND completed = true
      ORDER BY deal_id DESC
      LIMIT 1
    `;
    if (!latest || latest.deal_id === streak.last_deal_id) {
      return;
    }

    const curr =
      streak.last_deal_id === latest.deal_id - 1 ? streak.curr + 1 : 1;
    const max = Math.max(streak.max, curr);

    await tx`
      UPDATE streaks
      SET curr = ${curr},
          max = ${max},
          last_deal_id = ${latest.deal_id}
      WHERE user_id = ${userId}
    `;
  });
}

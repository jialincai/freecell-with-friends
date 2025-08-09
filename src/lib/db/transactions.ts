import sql from "@/lib/db";
import { Streak } from "./streaks";

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

export async function updateStreakOnCompletion({
  userId,
  dealId,
  completionTimeMs,
  moves,
}: {
  userId: string;
  dealId: number;
  completionTimeMs: number;
  moves: string;
}) {
  const [streak] = await sql<Streak[]>`
    SELECT * FROM streaks
    WHERE user_id = ${userId}
  `;
  if (!streak) {
    throw new Error(`Missing streak for user ${userId}`);
  }

  const curr = streak.last_deal_id === dealId - 1 ? streak.curr + 1 : 1;
  const max = Math.max(streak.max, curr);
  const lastDealId = dealId;

  await sql.begin(async (sql) => {
    await sql`
      INSERT INTO completions (user_id, deal_id, completion_time_ms, moves)
      VALUES (${userId}, ${dealId}, ${completionTimeMs}, ${moves}::jsonb)
      ON CONFLICT (user_id, deal_id) DO NOTHING
    `;
    await sql`
      UPDATE streaks
      SET curr = ${curr},
          max = ${max},
          last_deal_id = ${lastDealId}
      WHERE user_id = ${userId}
    `;
  });
}

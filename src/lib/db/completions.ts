import sql from "@lib/db";

export async function upsertCompletion({
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
  await sql`
    INSERT INTO completions (user_id, deal_id, completion_time_ms, moves)
    VALUES (${userId}, ${dealId}, ${completionTimeMs}, ${moves}::jsonb)
    ON CONFLICT (user_id, deal_id) DO NOTHING
  `;
}

import sql from "@lib/db";

export type Completion = {
  user_id: string;
  deal_id: number;
  completion_time_ms: number;
  moves: unknown;
};

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

export async function getCompletion({
  userId,
  dealId,
}: {
  userId: string;
  dealId: number;
}) {
  const result = await sql`
    SELECT * FROM completions
    WHERE user_id = ${userId} AND deal_id = ${dealId}
  `;
  return result[0] ?? null;
}

export async function filterCompletionsByDeal(dealId: number) {
  return await sql`
    SELECT * FROM completions
    WHERE deal_id = ${dealId}
  `;
}

export async function filterCompletionsByTime(
  minTimeMs: number,
  maxTimeMs: number,
) {
  return await sql`
    SELECT * FROM completions
    WHERE completion_time_ms BETWEEN ${minTimeMs} AND ${maxTimeMs}
  `;
}

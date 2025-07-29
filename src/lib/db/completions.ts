import sql from "@lib/db";

export type Completion = {
  user_id: string;
  deal_id: number;
  completion_time_ms: number;
  moves: unknown;
};

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

export async function countDealCompletionsByFloor({
  dealId,
  floorMs,
}: {
  dealId: number;
  floorMs: number;
}) {
  const [row] = await sql`
    SELECT COUNT(*)::int AS count
    FROM completions
    WHERE deal_id = ${dealId}
      AND completion_time_ms >= ${floorMs}
  `;
  return row.count;
}

export async function getUserCompletionStats(userId: string) {
  const [row] = await sql`
    SELECT
      COUNT(*)::int AS count,
      AVG(completion_time_ms)::int as average
    FROM completions
    WHERE user_id = ${userId}
  `;
  return { count: row.count, average: row.average };
}

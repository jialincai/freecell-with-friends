import sql from "@/lib/db";

export type Game = {
  user_id: string;
  deal_id: number;
  elapsed_time_ms: number;
  moves: unknown;
  completed: boolean;
};

export async function getGame({
  userId,
  dealId,
}: {
  userId: string;
  dealId: number;
}) {
  const result = await sql`
    SELECT * FROM games
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
    FROM games
    WHERE deal_id = ${dealId}
      AND completed = true
      AND elapsed_time_ms >= ${floorMs}
  `;
  return row.count;
}

export async function getUserCompletionStats(userId: string) {
  const [row] = await sql`
    SELECT
      COUNT(*)::int AS count,
      AVG(elapsed_time_ms)::int as average
    FROM games
    WHERE user_id = ${userId}
      AND completed = true
  `;
  return { count: row.count, average: row.average };
}

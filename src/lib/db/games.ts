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

export async function countDealCompletions({
  dealId,
  lowerBoundMs = 0,
}: {
  dealId: number;
  lowerBoundMs?: number;
}) {
  const [row] = await sql`
    SELECT COUNT(*)::int AS count
    FROM games
    WHERE deal_id = ${dealId}
      AND completed = true
      AND elapsed_time_ms >= ${lowerBoundMs}
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

/**
 * One completed game.
 * - date: string, the deal's date as YYYY-MM-DD (UTC).
 * - elapsed_time_ms: number, the completion time in milliseconds.
 */
export type UserCompletionTime = {
  date: string;
  elapsed_time_ms: number;
};

/**
 * A player's completed games, oldest first. In-progress games are excluded.
 *
 * @param userId - string: the player's UUID (session.user.id).
 * @param startDate - string, optional: YYYY-MM-DD; only deals on or after it.
 * @param endDate - string, optional: YYYY-MM-DD; only deals on or before it.
 * @returns Promise<UserCompletionTime[]>: one row per completed deal, sorted
 *   by date ascending.
 */
export async function getUserCompletionTimes({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate?: string;
  endDate?: string;
}) {
  return sql<UserCompletionTime[]>`
    SELECT
      to_char(deals.date, 'YYYY-MM-DD') AS date,
      games.elapsed_time_ms
    FROM games
    JOIN deals ON deals.id = games.deal_id
    WHERE games.user_id = ${userId}
      AND games.completed = true
      ${startDate ? sql`AND deals.date >= ${startDate}` : sql``}
      ${endDate ? sql`AND deals.date <= ${endDate}` : sql``}
    ORDER BY deals.date ASC
  `;
}

/**
 * One day of the global median line.
 * - date: string, the deal's date as YYYY-MM-DD (UTC).
 * - median_ms: number, the median completion time across all players who
 *   completed that day's deal, in milliseconds.
 */
export type GlobalDailyMedian = {
  date: string;
  median_ms: number;
};

/**
 * The median completion time across all players, for every day that has at
 * least one completed game, oldest first. One row per day, so it's fetched
 * once and binned on the client for any timeframe.
 *
 * @returns Promise<GlobalDailyMedian[]>: one row per date with completions,
 *   sorted by date ascending.
 */
export async function getGlobalDailyMedians() {
  return sql<GlobalDailyMedian[]>`
    SELECT
      to_char(deals.date, 'YYYY-MM-DD') AS date,
      percentile_cont(0.5) WITHIN GROUP (
        ORDER BY games.elapsed_time_ms
      )::float8 AS median_ms
    FROM games
    JOIN deals ON deals.id = games.deal_id
    WHERE games.completed = true
    GROUP BY deals.date
    ORDER BY deals.date ASC
  `;
}

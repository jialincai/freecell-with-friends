import { getGlobalDailyMedians } from "@/lib/db/games";

/**
 * GET /api/game/medians: the median completion time across all players, per
 * day, for the trend chart's global median line. No login required; it only
 * returns aggregates.
 *
 * Responses:
 *   200 - GlobalDailyMedian[]: { date, median_ms } for every day with
 *     completed games, oldest first.
 */
export async function GET() {
  const medians = await getGlobalDailyMedians();
  return Response.json(medians);
}

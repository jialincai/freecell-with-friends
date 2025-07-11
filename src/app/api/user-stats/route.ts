import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@auth/config";
import sql from "@lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = fetchUserStats(session.user.id);
  return NextResponse.json(stats);
}

function fetchUserStats(playerId: string) {
  return { time: 1000 };
}

// async function fetchUserStats(playerId: string, seedDate: string) {
//   const result = await sql`
//     SELECT percentile
//     FROM (
//       SELECT
//         player_id,
//         seed_date,
//         completion_time_ms,
//         PERCENT_RANK() OVER (PARTITION BY seed_date ORDER BY completion_time_ms ASC) AS percentile
//       FROM completions
//     ) ranked
//     WHERE player_id = ${playerId} AND seed_date = ${seedDate};
//   `;

//   return {
//     percentile: result[0]?.percentile ?? null,
//   };
// }
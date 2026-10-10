import { getServerSession } from "next-auth";
import authOptions from "@/auth/config";
import { getUserCompletionTimes } from "@/lib/db/games";

/**
 * GET /api/user/completions: the logged-in player's completed games, for
 * the stats trend chart.
 *
 * Query params (optional): start, end - string, YYYY-MM-DD deal dates
 *   (inclusive) to limit the range. Omit both for the full history.
 * Responses:
 *   200 - UserCompletionTime[]: { date, elapsed_time_ms }, oldest first.
 *   401 - { error }: not logged in.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const completions = await getUserCompletionTimes({
    userId: session.user.id,
    startDate: searchParams.get("start") ?? undefined,
    endDate: searchParams.get("end") ?? undefined,
  });

  return Response.json(completions);
}

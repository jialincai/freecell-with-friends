import { getServerSession } from "next-auth";
import authOptions from "@auth/config";
import { getUserCompletionStats } from "@lib/db/completions";
import { getStreak, resetStreak } from "@lib/db/streaks";
import { getDeal } from "@lib/db/deals";
import { getCurrentUTCDateString } from "@utils/Function";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count, average } = await getUserCompletionStats(session.user.id);
  const streak = await getStreak(session.user.id);
  const deal = await getDeal(getCurrentUTCDateString());

  const isStaleStreak = streak.last_deal_id < deal.id - 1 && streak.curr;
  if (isStaleStreak) {
    await resetStreak(session.user.id);
    streak.curr = 0;
  }

  return Response.json({
    played: count,
    averageMs: average,
    currentStreak: streak.curr,
    maxStreak: streak.max,
  });
}

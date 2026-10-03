import { getServerSession } from "next-auth";
import authOptions from "@/auth/config";
import { countDealCompletions, getGame } from "@/lib/db/games";
import { getDeal } from "@/lib/db/deals";
import { getCurrentUTCDateString } from "@/utils/Function";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the stored completion time rather than a client-supplied one, so the
  // percentile can't be requested for an arbitrary time.
  const deal = await getDeal(getCurrentUTCDateString());
  const game = await getGame({ userId: session.user.id, dealId: deal.id });
  if (!game?.completed) {
    return Response.json({ error: "No completion recorded" }, { status: 404 });
  }

  const [totalCompletions, playersBeatenOrTied] = await Promise.all([
    countDealCompletions({ dealId: deal.id }),
    countDealCompletions({
      dealId: deal.id,
      lowerBoundMs: game.elapsed_time_ms,
    }),
  ]);

  // Always >= 1 since the requester's own completion is counted.
  const percentile = (playersBeatenOrTied / totalCompletions) * 100;
  return Response.json(Math.round(percentile));
}

import { countDealCompletions } from "@/lib/db/games";
import { getDeal } from "@/lib/db/deals";
import { getCurrentUTCDateString } from "@/utils/Function";

export async function POST(req: Request) {
  const completionTime = await req.json();

  const deal = await getDeal(getCurrentUTCDateString());
  const [totalCompletions, playersBeatenOrTied] = await Promise.all([
    countDealCompletions({ dealId: deal.id }),
    countDealCompletions({ dealId: deal.id, lowerBoundMs: completionTime }),
  ]);

  // No recorded completions (anonymous player, or this player's completion
  // hasn't synced yet) means the requester is the first to finish.
  if (totalCompletions === 0) {
    return Response.json(100);
  }

  const percentile = (playersBeatenOrTied / totalCompletions) * 100;
  return Response.json(Math.round(percentile));
}

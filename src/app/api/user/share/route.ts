import { countDealCompletionsByFloor } from "@/lib/db/completions";
import { getDeal } from "@/lib/db/deals";
import { getCurrentUTCDateString } from "@/utils/Function";

export async function POST(req: Request) {
  const completionTime = await req.json();

  const deal = await getDeal(getCurrentUTCDateString());
  const [total, slowerOrEqual] = await Promise.all([
    countDealCompletionsByFloor({ dealId: deal.id, floorMs: 0 }),
    countDealCompletionsByFloor({ dealId: deal.id, floorMs: completionTime }),
  ]);

  if (total === 0) {
    return Response.json(null);
  }

  const percentile = (slowerOrEqual / total) * 100;
  return Response.json(Math.round(percentile));
}

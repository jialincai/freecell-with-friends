import {
  countCompletionsByDeal,
  countCompletionsByTime,
} from "@lib/db/completions";
import { getDeal } from "@lib/db/deals";
import { getCurrentUTCDateString } from "@utils/Function";

export async function POST(req: Request) {
  const completionTime = await req.json();

  const deal = await getDeal(getCurrentUTCDateString());
  const [total, slowerOrEqual] = await Promise.all([
    countCompletionsByDeal(deal.id),
    countCompletionsByTime({
      dealId: deal.id,
      minTimeMs: 0,
      maxTimeMs: completionTime,
    }),
  ]);

  if (total === 0) {
    return Response.json(null);
  }

  const percentile = ((total - slowerOrEqual) / total) * 100;
  return Response.json(Math.round(percentile));
}

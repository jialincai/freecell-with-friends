import authOptions from "@auth/config";
import {
  filterCompletionsByDeal,
  filterCompletionsByTime,
  getCompletion,
} from "@lib/db/completions";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ completionTimeMs: null, percentile: null });
  }

  const { deal } = await req.json();
  if (!deal.id || !deal.seed || !deal.date) {
    return Response.json({ error: "Invalid deal input" }, { status: 400 });
  }

  const completion = await getCompletion({
    userId: session.user.id,
    dealId: deal.id,
  });

  if (!completion) {
    return Response.json({ completionTimeMs: null, percentile: null });
  }

  const [allCompletions, slowerOrEqualCompletions] = await Promise.all([
    filterCompletionsByDeal(deal.id),
    filterCompletionsByTime(0, completion.completion_time_ms),
  ]);

  const total = allCompletions.length;
  const slowerOrEqual = slowerOrEqualCompletions.length;

  if (total === 0) {
    return Response.json({
      completionTimeMs: completion.completion_time_ms,
      percentile: null,
    });
  }

  const percentile = ((total - slowerOrEqual) / total) * 100;

  return Response.json({
    completionTimeMs: completion.completion_time_ms,
    percentile: Math.round(percentile),
  });
}

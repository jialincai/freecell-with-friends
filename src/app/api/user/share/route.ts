import {
  filterCompletionsByDeal,
  filterCompletionsByTime,
} from "@lib/db/completions";

export async function POST(req: Request) {
  const { deal, completionTime } = await req.json();

  const [allCompletions, slowerOrEqualCompletions] = await Promise.all([
    filterCompletionsByDeal(deal.id),
    filterCompletionsByTime(0, completionTime),
  ]);

  const total = allCompletions.length;
  const slowerOrEqual = slowerOrEqualCompletions.length;

  if (total === 0) {
    return Response.json(null);
  }

  const percentile = ((total - slowerOrEqual) / total) * 100;
  return Response.json(Math.round(percentile));
}

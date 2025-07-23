import { getDeal } from "@lib/db/deals";
import { getCurrentUTCDateString } from "@utils/Function";

export async function GET() {
  const deal = await getDeal(getCurrentUTCDateString());
  return Response.json(deal);
}

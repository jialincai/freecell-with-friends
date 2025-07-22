import { getDeal } from "@lib/db/deals";

export async function GET() {
  try {
    const currentUTC = new Date().toISOString().slice(0, 10);
    const deal = await getDeal(currentUTC);

    if (!deal) {
      throw new Error(`No daily deal found for ${currentUTC}`);
    }

    return Response.json(deal);
  } catch (err) {
    return Response.json(
      { error: `Internal server error: ${String(err)}` },
      { status: 500 },
    );
  }
}

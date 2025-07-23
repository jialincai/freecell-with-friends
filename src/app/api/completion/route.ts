import { getServerSession } from "next-auth";
import authOptions from "@auth/config";
import { updateStreakOnCompletion } from "@lib/db/transactions";
import { getCurrentUTCDateString } from "@utils/Function";
import { getDeal } from "@lib/db/deals";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deal = await getDeal(getCurrentUTCDateString());
  const { completionTimeMs, moveArray } = await req.json();

  await updateStreakOnCompletion({
    userId: session.user.id,
    dealId: deal.id,
    completionTimeMs,
    moves: JSON.stringify(moveArray),
  });

  return new Response(null, { status: 204 });
}

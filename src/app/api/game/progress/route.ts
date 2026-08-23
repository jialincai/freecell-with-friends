import { getServerSession } from "next-auth";
import authOptions from "@/auth/config";
import { upsertGame } from "@/lib/db/transactions";
import { getCurrentUTCDateString } from "@/utils/Function";
import { getDeal } from "@/lib/db/deals";
import { getGame } from "@/lib/db/games";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deal = await getDeal(getCurrentUTCDateString());
  const game = await getGame({ userId: session.user.id, dealId: deal.id });

  return Response.json({
    started: game !== null,
    elapsedTimeMs: game?.elapsed_time_ms ?? 0,
    moveArray: game?.moves ?? [],
    completed: game?.completed ?? false,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deal = await getDeal(getCurrentUTCDateString());
  const { elapsedTimeMs, moveArray } = await req.json();

  // upsertGame's `WHERE games.completed = false` guard ensures a periodic
  // in-progress sync can never overwrite an already-completed game.
  await upsertGame({
    userId: session.user.id,
    dealId: deal.id,
    elapsedTimeMs,
    moves: JSON.stringify(moveArray),
    completed: false,
  });

  return new Response(null, { status: 204 });
}

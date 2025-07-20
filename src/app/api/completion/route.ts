import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@auth/config";
import { upsertCompletion } from "@lib/db/completions";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dealId, completionTimeMs, moveArray } = await req.json();

  await upsertCompletion({
    userId: session.user.id,
    dealId,
    completionTimeMs,
    moves: JSON.stringify(moveArray),
  });

  return NextResponse.json({ success: true });
}

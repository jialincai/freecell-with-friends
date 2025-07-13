import { getServerSession } from "next-auth";
import authOptions from "@auth/config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401});


}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const stats = fetchUserStats(session.user.id);
  return Response.json(stats);
}

function fetchUserStats(playerId: string) {
  return { time: 1000 };
}

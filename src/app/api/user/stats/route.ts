import { getServerSession } from "next-auth";
import authOptions from "@auth/config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ time: 1000 });
}

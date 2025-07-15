import { getServerSession } from "next-auth";
import authOptions from "@auth/config";
import { findUserById, insertUser } from "@lib/db/users";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!session.user || !session.user.id || !session.user.email) {
    return new Response("Invalid session", { status: 400 });
  }

  const existingUser = await findUserById(session.user.id);

  if (!existingUser) {
    await insertUser({ id: session.user.id, email: session.user.email });
  }

  return new Response("OK");
}

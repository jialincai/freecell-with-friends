import sql from "@/lib/db";

export type User = {
  id: string;
  email: string;
};

export async function getUser(id: string) {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  `;
  return result[0] ?? null;
}

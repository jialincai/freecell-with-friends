import sql from "@lib/db";

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

export async function upsertUser({ id, email }: { id: string; email: string }) {
  await sql`
    INSERT INTO users (id, email)
    VALUES (${id}, ${email})
    ON CONFLICT (id) DO NOTHING
  `;
}

import sql from "@lib/db";

export async function findUserById(id: string) {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;
  return result[0] ?? null;
}

export async function insertUser({ id, email }: { id: string; email: string }) {
  await sql`
    INSERT INTO users (id, email)
    VALUES (${id}, ${email})
    ON CONFLICT (id) DO NOTHING
  `;
}

import sql from "@lib/db";

export type Deal = {
  id: number;
  seed: number;
  date: string;
};

export async function getDealFromDate(date: string): Promise<Deal | null> {
  const result = await sql<Deal[]>`
    SELECT id, seed, date FROM deals WHERE date = ${date}
  `;

  return result[0] ?? null;
}

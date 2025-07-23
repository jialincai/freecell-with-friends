import sql from "@lib/db";

export type Streak = {
  user_id: string;
  curr: number;
  max: number;
  last_deal_id: number;
};

export async function getStreak(userId: string) {
  const result = await sql`
        SELECT * FROM streaks
        WHERE user_id = ${userId}
    `;
  return result[0] ?? null;
}

export async function resetStreak(userId: string) {
  await sql`
    UPDATE streaks
    SET curr = 0
    WHERE user_id = ${userId}   
  `;
}

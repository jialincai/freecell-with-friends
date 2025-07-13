import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
  /** Options */
});

export default sql;

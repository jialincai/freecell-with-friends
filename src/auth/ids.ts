import { v5 as uuidv5 } from "uuid";

// ─────────────────────────────────────────────────────────────────────────────
// **WARNING — DO NOT CHANGE THIS VALUE!**
//
// This namespace UUID is part of the deterministic UUID generation for users.
// If you change this string or the UUID version, **ALL USER UUIDs WILL CHANGE**.
// That will break existing save data, stats, and any persistent references.
//
// If you think you need to change this, stop and talk to the lead dev first.
// ─────────────────────────────────────────────────────────────────────────────
const NAMESPACE = uuidv5("https://freecellwithfriends.com", uuidv5.URL);

export function computeUserId(
  provider: string,
  providerAccountId: string,
): string {
  return uuidv5(`${provider}:${providerAccountId}`, NAMESPACE);
}

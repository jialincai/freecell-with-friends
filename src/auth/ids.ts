import { v5 as uuidv5 } from "uuid";

const NAMESPACE = uuidv5("https://freecellwithfriends.com", uuidv5.URL);

export function computeUserId(
  provider: string,
  providerAccountId: string,
): string {
  return uuidv5(`${provider}:${providerAccountId}`, NAMESPACE);
}

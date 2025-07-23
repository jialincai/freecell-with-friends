export async function fetcher(
  url: string,
  options?: {
    silentCodes?: number[];
    init?: RequestInit;
  },
) {
  const res = await fetch(url, options?.init);

  if (options?.silentCodes?.includes(res.status)) {
    return null;
  }

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Fetch failed: ${res.status} ${message}`);
  }

  return res.json();
}

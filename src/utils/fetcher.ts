export async function fetcher(
  url: string,
  options?: {
    silentCodes?: number[];
    init?: RequestInit;
  },
) {
  console.log("fetcher: requesting", url);

  let res: Response;
  try {
    res = await fetch(url, options?.init);
  } catch (err) {
    console.error("fetcher: network error for", url, err);
    throw err;
  }

  console.log("fetcher: response", url, res.status);

  if (options?.silentCodes?.includes(res.status)) {
    return null;
  }

  if (!res.ok) {
    const message = await res.text();
    console.error("fetcher: non-ok response", url, res.status, message);
    throw new Error(`Fetch failed: ${res.status} ${message}`);
  }

  return res.json();
}

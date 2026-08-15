import { dlog, derror } from "@/utils/debugLog";

export async function fetcher(
  url: string,
  options?: {
    silentCodes?: number[];
    init?: RequestInit;
  },
) {
  dlog("fetcher: requesting", url);

  let res: Response;
  try {
    res = await fetch(url, options?.init);
  } catch (err) {
    derror("fetcher: network error", { url, err });
    throw err;
  }

  dlog("fetcher: response", { url, status: res.status });

  if (options?.silentCodes?.includes(res.status)) {
    return null;
  }

  if (!res.ok) {
    const message = await res.text();
    derror("fetcher: non-ok response", { url, status: res.status, message });
    throw new Error(`Fetch failed: ${res.status} ${message}`);
  }

  return res.json();
}

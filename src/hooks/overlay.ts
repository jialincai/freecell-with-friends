"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type OverlayState = "stats" | "login" | "help" | null;

export const useOverlayQuery = (): [OverlayState, boolean] => {
  const searchParams = useSearchParams();
  const overlay = searchParams.get("overlay") as OverlayState;
  const loginError = searchParams.get("error") === "Callback";

  return [overlay, loginError];
};

export const useOverlayRouter = () => {
  const router = useRouter();

  const set = (overlay: OverlayState) => {
    const url = new URL(window.location.href);
    if (overlay) {
      url.searchParams.set("overlay", overlay);
    } else {
      url.searchParams.delete("overlay");
    }
    router.replace(url.toString(), { scroll: false });
  };

  return {
    open: set,
    close: () => set(null),
  };
};

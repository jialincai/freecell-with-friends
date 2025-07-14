"use client";

import { useRouter } from "next/navigation";

export type OverlayState = "stats" | "login" | "help" | null;

export const useOverlayNavigation = () => {
  const router = useRouter();

  const openOverlay = (overlay: OverlayState) => {
    const url = new URL(window.location.href);
    if (overlay) {
      url.searchParams.set("overlay", overlay);
    } else {
      url.searchParams.delete("overlay");
    }
    router.replace(url.toString());
  };
  return { openOverlay };
};

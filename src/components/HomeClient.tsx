"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import useSWR from "swr";
import { Toaster } from "sonner";
import Overlay from "@/components/ui/Overlay";
import MenuBar from "@/components/ui/MenuBar";
import FreecellGame from "@/components/game/FreecellGame";
import ErrorPage from "@/components/ui/ErrorPage";
import { DealProvider } from "@/components/context/DealContext";
import { fetcher } from "@/utils/fetcher";
import { dlog, derror } from "@/utils/debugLog";

export default function HomeClient() {
  const {
    data: deal,
    error,
    isLoading,
  } = useSWR("/api/deal/current", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  dlog("HomeClient: render", {
    hasDeal: deal !== undefined,
    error: error ? String(error) : null,
    isLoading,
  });

  if (error) {
    derror("HomeClient: /api/deal/current failed", error);
    return <ErrorPage />;
  }
  if (isLoading) return <div aria-busy="true" aria-live="polite" />;

  return (
    <SessionProvider>
      <DealProvider deal={deal}>
        <Toaster />
        <Suspense fallback={null}>
          <Overlay />
        </Suspense>
        <MenuBar />
        <FreecellGame />
      </DealProvider>
    </SessionProvider>
  );
}

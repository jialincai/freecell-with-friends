"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import useSWR from "swr";
import { Toaster } from "sonner";
import { fetcher } from "@/utils/fetcher";
import FreecellGame from "@/components/game/FreecellGame";
import Overlay from "@/components/ui/Overlay";
import MenuBar from "@/components/ui/MenuBar";
import { DealProvider } from "@/components/context/DealContext";
import ErrorPage from "@/components/ui/ErrorPage";

const HomePage = () => {
  const { data: deal, error, isLoading } = useSWR("/api/deal/current", fetcher);

  if (isLoading) return null;

  if (error) {
    return <ErrorPage />;
  }

  // TODO: Upon intial page load we should sync up local to remote save data.
  // For example, if the database know of completion but local browser doesn't -- hydrate local save.
  // Alternatively, if user is authenticated and local completion is not in database -- POST it.
  return (
    <SessionProvider>
      <DealProvider deal={deal}>
        <div>
          {/* TODO: Figure out why position="bottom-center" is not centered */}
          <Toaster />
          <Suspense fallback={null}>
            <Overlay />
          </Suspense>
          <MenuBar />
          <FreecellGame />
        </div>
      </DealProvider>
    </SessionProvider>
  );
};

export default HomePage;

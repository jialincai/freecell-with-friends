"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { DealProvider } from "@components/context/DealContext";
import FreecellGame from "@components/game/FreecellGame";
import Overlay from "@components/ui/Overlay";
import MenuBar from "@components/ui/MenuBar";
import { Suspense } from "react";
import { Deal } from "@lib/db/deals";

const HomePage = () => {
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    const loadDeal = async () => {
      const res = await fetch("/api/deal/current");
      const data = await res.json();
      setDeal(data);
    };
    loadDeal();
  }, []);

  if (!deal) return null; // TODO: Handle database error with error page

  return (
    <SessionProvider>
      <DealProvider deal={deal}>
        <div>
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

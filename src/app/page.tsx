"use client";

import { SessionProvider } from "next-auth/react";
import FreecellGame from "@components/game/FreecellGame";
import Overlay from "@components/ui/Overlay";
import MenuBar from "@components/ui/MenuBar";
import { Suspense } from "react";

const HomePage = () => {
  // TODO: Fetch daily deal here

  return (
    <SessionProvider>
      <div>
        <Suspense fallback={null}>
          <Overlay />
        </Suspense>
        <MenuBar />
        <FreecellGame />
      </div>
    </SessionProvider>
  );
};

export default HomePage;

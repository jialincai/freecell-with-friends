"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FreecellGame from "@components/game/FreecellGame";
import Overlay from "@components/ui/Overlay";
import StatsPage from "@components/ui/StatsPage";
import LoginPage from "@components/ui/LoginPage";
import HelpPage from "@components/ui/HelpPage";
import MenuBar from "@components/ui/MenuBar";
import { useOverlayNavigation } from "@lib/hooks/useOverlayNavigation";

const HomePage = () => {
  const { openOverlay } = useOverlayNavigation();

  const searchParams = useSearchParams();
  const overlay = searchParams.get("overlay");
  const error = searchParams.get("error");

  const [loginFailed, setLoginFailed] = useState(false);

  useEffect(() => {
    setLoginFailed(error === "Callback");

    if (error) {
      const url = new URL(window.location.href);
      url.searchParams.delete("callbackUrl");
      url.searchParams.delete("error");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [overlay, error]);

  const renderOverlayContent = () => {
    switch (overlay) {
      case "stats":
        return <StatsPage />;
      case "login":
        return <LoginPage loginFailed={loginFailed} />;
      case "help":
        return <HelpPage />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Overlay
        hidden={!overlay}
        onClose={() =>
          overlay === "login" ? openOverlay("stats") : openOverlay(null)
        }
      >
        {renderOverlayContent()}
      </Overlay>
      <MenuBar />
      <FreecellGame />
    </div>
  );
};

export default HomePage;

"use client";

import { useState } from "react";
import { HelpCircle, Settings, Trophy } from "lucide-react";

import Overlay from "@components/ui/Overlay";
import HelpPage from "@components/ui/HelpPage";
import LoginPage from "@components/ui/LoginPage";
import StatsPage from "@components/ui/StatsPage";

import styles from "@styles/ui/MenuBar.module.css";

export type OverlayMode = "stats" | "login" | "help" | null;

const overlayComponents: Record<
  Exclude<OverlayMode, null>,
  React.FC<{ setMode: (mode: OverlayMode) => void }>
> = {
  stats: ({ setMode }) => <StatsPage setMode={setMode} />,
  login: () => <LoginPage />,
  help: () => <HelpPage />,
};

const overlayCloseMap: Record<Exclude<OverlayMode, null>, OverlayMode> = {
  stats: null,
  login: "stats",
  help: null,
};

const MenuBar = () => {
  const [activePanel, setActivePanel] = useState<OverlayMode>(null);

  const ActiveContent = activePanel ? overlayComponents[activePanel] : null;

  return (
    <>
      <Overlay
        hidden={!activePanel}
        onClose={() =>
          activePanel && setActivePanel(overlayCloseMap[activePanel])
        }
      >
        {ActiveContent && <ActiveContent setMode={setActivePanel} />}
      </Overlay>

      <div className={styles.menuBar}>
        <button
          className={styles.menuButton}
          onClick={() => setActivePanel("stats")}
        >
          <Trophy className={styles.menuIcon} />
        </button>

        <button
          className={styles.menuButton}
          onClick={() => setActivePanel("help")}
        >
          <HelpCircle className={styles.menuIcon} />
        </button>

        {/* <button
          className={styles.menuButton}
          onClick={() => setActivePanel("settings")}
        >
          <Settings className={styles.menuIcon} />
        </button> */}
      </div>
    </>
  );
};

export default MenuBar;

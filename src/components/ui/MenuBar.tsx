"use client";

import { useState } from "react";
import { HelpCircle, Settings, Trophy } from "lucide-react";
import Overlay from "@components/ui/Overlay";
import HelpContent from "@components/ui/HelpContent";
import LoginContent from "@components/ui/LoginContent";
import StatsContent from "@components/ui/StatsContent";
import styles from "@styles/ui/MenuBar.module.css";

export type OverlayPanel = "stats" | "login" | "help" | null;

const overlayComponents: Record<
  Exclude<OverlayPanel, null>,
  React.FC<{ setMode: (mode: OverlayPanel) => void }>
> = {
  stats: ({ setMode }) => <StatsContent setMode={setMode} />,
  login: ({ setMode }) => <LoginContent setMode={setMode} />,
  help: () => <HelpContent />,
};

const overlayCloseMap: Record<Exclude<OverlayPanel, null>, OverlayPanel> = {
  stats: null,
  login: "stats",
  help: null,
};

const MenuBar = () => {
  const [activePanel, setActivePanel] = useState<OverlayPanel>(null);

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

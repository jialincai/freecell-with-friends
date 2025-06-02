"use client";

import { useState } from "react";
import { HelpCircle, Settings, Trophy } from "lucide-react";
import Overlay from "@components/ui/Overlay";
import HelpContent from "@components/ui/HelpContent";
import StatsContent from "@components/ui/StatsContent";
import styles from "@styles/MenuBar.module.css";

type ActiveOverlay = "help" | "stats" | "settings" | null;
type StatsMode = "login" | "default";

const MenuBar = () => {
  const [active, setActive] = useState<ActiveOverlay>(null);
  const [statsMode, setStatsMode] = useState<StatsMode>('default');
  
  const closeOverlay = () => {
    if (active === "stats" && statsMode === "login") setStatsMode("default");
    else setActive(null);
  };

  return (
    <>
      <Overlay hidden={!active} onClose={closeOverlay}>
        {active === "stats" && <StatsContent />}
        {active === "help" && <HelpContent />}
        {/* {active === "settings" && <HelpContent />} */}
      </Overlay>

      <div className={styles.menuBar}>
        <button
          className={styles.menuButton}
          onClick={() => setActive("stats")}
        >
          <Trophy className={styles.menuIcon} />
        </button>
        <button className={styles.menuButton} onClick={() => setActive("help")}>
          <HelpCircle className={styles.menuIcon} />
        </button>
        {/* <button
          className={styles.menuButton}
          onClick={() => setActive("settings")}
        >
          <Settings className={styles.menuIcon} />
        </button> */}
      </div>
    </>
  );
};

export default MenuBar;

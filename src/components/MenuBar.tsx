"use client";

import { useState } from "react";
import { HelpCircle, Settings, Trophy } from "lucide-react";
import Overlay from "@components/Overlay";
import HelpContent from "@components/HelpContent";
import styles from "@styles/MenuBar.module.css";

type ActiveOverlay = "help" | "stats" | `settings` | null;

const MenuBar = () => {
  const [active, setActive] = useState<ActiveOverlay>(null);
  const closeOverlay = () => setActive(null);

  return (
    <>
      <Overlay hidden={!active} onClose={closeOverlay}>
        {/* {active === "stats" && <HelpContent />} */}
        {active === "help" && <HelpContent />}
        {/* {active === "settings" && <HelpContent />} */}
      </Overlay>

      <div className={styles.menuBar}>
        {/* <button
          className={styles.menuButton}
          onClick={() => setActive("stats")}
        >
          <Trophy className={styles.menuIcon} />
        </button> */}
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

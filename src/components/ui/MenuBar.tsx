"use client";

import { HelpCircle, Trophy } from "lucide-react";
import { useOverlayNavigation } from "@lib/hooks/useOverlayNavigation";
import styles from "@styles/ui/MenuBar.module.css";

const MenuBar = () => {
  const { openOverlay } = useOverlayNavigation();

  return (
    <div className={styles.menuBar}>
      <button
        className={styles.menuButton}
        onClick={() => openOverlay("stats")}
      >
        <Trophy className={styles.menuIcon} />
      </button>

      <button className={styles.menuButton} onClick={() => openOverlay("help")}>
        <HelpCircle className={styles.menuIcon} />
      </button>
    </div>
  );
};

export default MenuBar;

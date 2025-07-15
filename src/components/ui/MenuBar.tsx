"use client";

import { HelpCircle, Trophy } from "lucide-react";
import { useOverlayRouter } from "@lib/hooks/overlay";
import styles from "@styles/ui/MenuBar.module.css";

const MenuBar = () => {
  const overlayRouter = useOverlayRouter();

  return (
    <div className={styles.menuBar}>
      <button
        className={styles.menuButton}
        onClick={() => overlayRouter.open("stats")}
      >
        <Trophy className={styles.menuIcon} />
      </button>

      <button
        className={styles.menuButton}
        onClick={() => overlayRouter.open("help")}
      >
        <HelpCircle className={styles.menuIcon} />
      </button>
    </div>
  );
};

export default MenuBar;

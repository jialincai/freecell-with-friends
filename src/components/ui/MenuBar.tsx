"use client";

import { HelpCircle, Trophy } from "lucide-react";
import { useOverlayRouter } from "@hooks/overlay";
import styles from "@styles/ui/MenuBar.module.css";
import DealCountdown from "@components/ui/Countdown";

const MenuBar = () => {
  const overlayRouter = useOverlayRouter();

  return (
    <div className={styles.menuBar}>
      <DealCountdown />

      <div className={styles.buttonContainer}>
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
    </div>
  );
};

export default MenuBar;

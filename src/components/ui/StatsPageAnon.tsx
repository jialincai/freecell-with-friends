"use client";

import { useOverlayNavigation } from "@lib/hooks/useOverlayNavigation";
import ShareButton from "@components/ui/ShareButton";
import styles from "@styles/ui/StatsPage.module.css";

const AnonStatsPage = () => {
  const { openOverlay } = useOverlayNavigation();

  return (
    <div className={styles.container}>
      <p className={styles.heading}>
        Want to start tracking your stats and streaks?
      </p>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.ovalButton} bg-white text-black`}
          onClick={() => openOverlay("login")}
        >
          Create a free account
        </button>

        <button className="underline" onClick={() => openOverlay("login")}>
          Already registered? Log in
        </button>
      </div>

      <ShareButton />
    </div>
  );
};

export default AnonStatsPage;

"use client";

import { useOverlayRouter } from "@lib/hooks/overlay";
import ShareButton from "@components/ui/ShareButton";
import styles from "@styles/ui/StatsPage.module.css";

const AnonStatsPage = () => {
  const overlayRouter = useOverlayRouter();

  return (
    <div className={styles.container}>
      <p className={styles.heading}>
        Want to start tracking your stats and streaks?
      </p>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.ovalButton} bg-white text-black`}
          onClick={() => overlayRouter.open("login")}
        >
          Create a free account
        </button>

        <button
          className="underline"
          onClick={() => overlayRouter.open("login")}
        >
          Already registered? Log in
        </button>
      </div>

      <ShareButton />
    </div>
  );
};

export default AnonStatsPage;

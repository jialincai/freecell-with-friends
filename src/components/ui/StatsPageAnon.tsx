import { OverlayMode } from "@components/ui/MenuBar";
import ShareButton from "@components/ui/ShareButton";

import styles from "@styles/ui/StatsPage.module.css";

type AnonStatsPageProps = {
  setMode: (mode: OverlayMode) => void;
};

const AnonStatsPage = ({ setMode }: AnonStatsPageProps) => {
  return (
    <div className={styles.container}>
      <p className={styles.heading}>
        Want to start tracking your stats and streaks?
      </p>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.ovalButton} bg-white text-black`}
          onClick={() => setMode("login")}
        >
          Create a free account
        </button>

        <button className="underline" onClick={() => setMode("login")}>
          Already registered? Log in
        </button>
      </div>

      <ShareButton />
    </div>
  );
};

export default AnonStatsPage;

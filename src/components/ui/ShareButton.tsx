import { Share2 } from "lucide-react";
import styles from "@styles/ui/StatsPage.module.css";

const ShareButton = () => {
  return (
    <button
      className={`${styles.ovalButton} bg-blue`}
      onClick={() => alert("TODO: implement share")}
    >
      Share
      <Share2 className={styles.shareIcon} />
    </button>
  );
};

export default ShareButton;

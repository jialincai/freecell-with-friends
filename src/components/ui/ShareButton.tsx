import { Share2 } from "lucide-react";
import styles from "@styles/ui/StatsPage.module.css";
import { useDailyDeal } from "@components/context/DealContext";

const formatTime = (ms: number | null): string => {
  if (ms == null) return "XX:XX";
  const min = Math.floor(ms / 60000)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
};

const emojiForPercentile = (p: number | null): string => {
  if (p == null) return "🔮"; // unknown
  if (p < 5) return "🪦";
  if (p < 15) return "🐌";
  if (p < 30) return "🦥";
  if (p < 45) return "🐢";
  if (p < 60) return "👍";
  if (p < 75) return "🐇";
  if (p < 85) return "🐎";
  if (p < 95) return "🏎️";
  if (p < 99) return "🚀";
  return "🦄";
};

const ShareButton = () => {
  const deal = useDailyDeal();

  const handleShare = async () => {
    try {
      const res = await fetch("/api/user/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error("Database error");
      }

      const time = formatTime(data.completionTimeMs);
      const emoji = emojiForPercentile(data.percentile);
      const message = `Freecell ${deal.id}\n${time} = ${emoji}`;

      await navigator.clipboard.writeText(message);
      alert("Copied results to clipboard!");
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <button className={`${styles.ovalButton} bg-blue`} onClick={handleShare}>
      Share
      <Share2 className={styles.shareIcon} />
    </button>
  );
};

export default ShareButton;

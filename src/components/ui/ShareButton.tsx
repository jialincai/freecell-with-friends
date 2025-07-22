import { Share2 } from "lucide-react";
import { useDailyDeal } from "@components/context/DealContext";
import { toast } from "sonner";
import styles from "@styles/ui/StatsPage.module.css";

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
  if (p < 20) return "🐌";
  if (p < 30) return "🦥";
  if (p < 40) return "🐢";
  if (p < 50) return "👍";
  if (p < 60) return "🐇";
  if (p < 70) return "🐎";
  if (p < 80) return "🏎️";
  if (p < 95) return "🚀";
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
      // const message = `Freecell ${deal.id}\n${streak}🔥💀\n${time} = ${emoji}`;

      await navigator.clipboard.writeText(message);
      toast.dismiss();
      toast.custom(() => <p className={styles.toast}>Copied to clipboard</p>);
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

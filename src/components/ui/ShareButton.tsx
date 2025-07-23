import { Share2 } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@utils/fetcher";
import { formatTime } from "@utils/Function";
import SaveController from "@utils/save/SaveController";
import { Meta } from "@phaser/meta/Meta";
import { Session } from "@phaser/session/Session";
import { useDailyDeal } from "@components/context/DealContext";
import styles from "@styles/ui/StatsPage.module.css";
import { statSync } from "fs";

const emojiForPercentile = (p: number): string => {
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
  const { data: stats } = useSWR("/api/user/stats", fetcher);

  const handleShare = async () => {
    const localSave = SaveController.getSave();
    const localMeta = (localSave?.state.chunks.meta as Meta) ?? null;
    const localSession = (localSave?.state.chunks.session as Session) ?? null;

    let time = "XX:XX";
    let timeEmoji = "🔮";

    if (
      localMeta &&
      localMeta.state.complete &&
      localSession &&
      localSession.state.timeElapsedMs
    ) {
      try {
        const completionTime = localSession.state.timeElapsedMs;
        const res = await fetch("/api/user/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(completionTime),
        });

        const percentile = await res.json();
        if (!res.ok) {
          throw new Error("Database error");
        }

        time = formatTime(completionTime);
        timeEmoji = emojiForPercentile(percentile);
      } catch (err) {
        console.error("Share failed", err);
      }
    }

    let message = `Freecell ${deal.id}\n${time} = ${timeEmoji}`;
    if (stats) {
      message += `\n${stats.currentStreak}🔥`;
    }
    await navigator.clipboard.writeText(message);
    toast.dismiss();
    toast.custom(() => <p className={styles.toast}>Copied to clipboard</p>);
  };

  return (
    <button className={`${styles.ovalButton} bg-blue`} onClick={handleShare}>
      Share
      <Share2 className={styles.shareIcon} />
    </button>
  );
};

export default ShareButton;

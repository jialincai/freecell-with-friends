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
import { useEffect, useState } from "react";

const emojiForPercentile = (p: number): string => {
  if (p < 0.5) return "🪦"; // 0–0.5
  if (p < 2.5) return "👨‍🦯"; // 0.5–2.5
  if (p < 10) return "👨‍🦽"; // 2.5–10
  if (p < 30) return "🚶‍♂️"; // 10–30
  if (p < 50) return "🏃"; // 30–50
  if (p < 70) return "🚴"; // 50–70
  if (p < 90) return "🚐"; // 70–90
  if (p < 97.5) return "🏎️"; // 90–97.5
  if (p < 99.5) return "🚀"; // 97.5–99.5
  return "🥇"; // 99.5–100
};

const ShareButton = () => {
  const deal = useDailyDeal();
  const { data: stats } = useSWR("/api/user/stats", fetcher);

  const [text, setText] = useState<string>(`Freecell #${deal.id}\nXX:XX = 🔮`);

  useEffect(() => {
    const fetchUserPercentile = async () => {
      const localSave = SaveController.getSave();
      const localMeta = (localSave?.state.chunks.meta as Meta) ?? null;
      const localSession = (localSave?.state.chunks.session as Session) ?? null;

      let time = "XX:XX";
      let timeEmoji = "🔮";
      if (localMeta?.state.complete && localSession?.state.timeElapsedMs) {
        try {
          const completionTime = localSession.state.timeElapsedMs;
          const res = await fetch("/api/user/share", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(completionTime),
          });

          if (!res.ok) {
            throw new Error("Database error");
          }

          const percentile = await res.json();
          time = formatTime(completionTime);
          timeEmoji = emojiForPercentile(percentile);
        } catch (err) {
          console.error("Share failed", err);
        }
      }

      let message = `Freecell #${deal.id}\n${time} = ${timeEmoji}`;
      if (stats) {
        message += `\n${stats.currentStreak}🔥`;
      }

      setText(message);
    };

    fetchUserPercentile();
  }, [deal.id, stats]);

  const handleShare = async () => {
    navigator.clipboard.writeText(text).then(() => {
      toast.dismiss();
      toast.custom(() => <p className={styles.toast}>Copied to clipboard</p>);
    });
  };

  return (
    <button className={`${styles.ovalButton} bg-blue`} onClick={handleShare}>
      Share
      <Share2 className={styles.shareIcon} />
    </button>
  );
};

export default ShareButton;

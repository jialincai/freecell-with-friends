"use client";

import useSWR from "swr";
import { signOut } from "next-auth/react";
import ShareButton from "@components/ui/ShareButton";
import styles from "@styles/ui/StatsPage.module.css";
import { formatTime } from "@utils/Function";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch user stats");
    return res.json();
  });

const StatBlock = ({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) => (
  <div className={styles.block}>
    <div className={styles.blockValue}>{value}</div>
    <div className={styles.blockLabel}>{label}</div>
  </div>
);

const UserStatsPage = () => {
  const { data: stats } = useSWR("/api/user/stats", fetcher);

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Statistics</p>

      {stats ? (
        <div className={styles.blockContainer}>
          <StatBlock value={stats.played} label="Played" />
          <StatBlock
            value={stats.averageMs ? formatTime(stats.averageMs) : "N/A"}
            label="Average Time"
          />
          <StatBlock value={stats.currentStreak} label="Current Streak" />
          <StatBlock value={stats.maxStreak} label="Max Streak" />
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <p className={styles.description}>🚧 under construction 🚧</p>

      <ShareButton />
      <button className="underline mt-4" onClick={() => signOut()}>
        Log out
      </button>
    </div>
  );
};

export default UserStatsPage;

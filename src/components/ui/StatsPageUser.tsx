"use client";

import useSWR from "swr";
import { signOut } from "next-auth/react";
import ShareButton from "@/components/ui/ShareButton";
import TrendChart from "@/components/ui/trend/TrendChart";
import statsStyles from "@/styles/ui/Stats.module.css";
import styles from "@/styles/ui/StatsPageUser.module.css";
import { formatTime } from "@/utils/Function";
import { fetcher } from "@/utils/fetcher";

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div className={styles.stat}>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

const UserStatsPage = () => {
  const { data: stats } = useSWR("/api/user/stats", (url) =>
    fetcher(url, { silentCodes: [401] }),
  );

  return (
    <div className={statsStyles.container}>
      <p className={statsStyles.heading}>Statistics</p>

      <div className={styles.statsGrid}>
        <div className={styles.statsGridCenter}>
          {stats ? (
            <div className="flex">
              <Stat value={stats.played} label="Played" />
              <Stat
                value={stats.averageMs ? formatTime(stats.averageMs) : "N/A"}
                label="Average Time"
              />
              <Stat value={stats.currentStreak} label="Current Streak" />
              <Stat value={stats.maxStreak} label="Max Streak" />
            </div>
          ) : (
            <p className={styles.message}>Loading...</p>
          )}
        </div>

        <TrendChart />
      </div>

      <ShareButton />
      <button className="underline mt-4" onClick={() => signOut()}>
        Log out
      </button>
    </div>
  );
};

export default UserStatsPage;

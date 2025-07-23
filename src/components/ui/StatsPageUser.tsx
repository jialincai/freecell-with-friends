"use client";

import useSWR from "swr";
import { signOut } from "next-auth/react";
import ShareButton from "@components/ui/ShareButton";
import statStyles from "@styles/ui/StatsPage.module.css";
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
  <div className="flex flex-col items-center mx-4">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs uppercase tracking-widest">{label}</div>
  </div>
);

const UserStatsPage = () => {
  const { data: stats } = useSWR("/api/user/stats", fetcher);

  return (
    <div className={statStyles.container}>
      <p className={statStyles.heading}>Statistics</p>

      {stats ? (
        <div className="flex justify-center my-4">
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

      <ShareButton />
      <button className="underline mt-4" onClick={() => signOut()}>
        Log out
      </button>
    </div>
  );
};

export default UserStatsPage;

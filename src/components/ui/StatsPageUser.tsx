"use client";

import useSWR from "swr";
import { signOut } from "next-auth/react";
import ShareButton from "@components/ui/ShareButton";
import statStyles from "@styles/ui/StatsPage.module.css";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch user stats");
    return res.json();
  });

const UserStatsPage = () => {
  const { data: stats } = useSWR("/api/user/add", fetcher);

  return (
    <div className={statStyles.container}>
      <p className={statStyles.heading}>Statistics</p>
      <p>{stats ? `Time: ${stats.time} ms` : `Loading...`}</p>

      <ShareButton />
      <button className="underline" onClick={() => signOut()}>
        Log out
      </button>
    </div>
  );
};

export default UserStatsPage;

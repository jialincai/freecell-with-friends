"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import ShareButton from "@components/ui/ShareButton";
import statStyles from "@styles/ui/StatsPage.module.css";

const UserStatsPage = () => {
  const [stats, setStats] = useState<{ time: number } | null>(null);

  useEffect(() => {
    fetch("/api/user-stats")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((stats) => setStats(stats))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className={statStyles.container}>
      <p className={statStyles.heading}>Statistics</p>
      <p>
        { stats ? `Time: ${stats.time} ms` : `Loading...` }
      </p>

      <ShareButton />
      <button className="underline" onClick={() => signOut()}>
        Log out
      </button>
    </div>
  );
};

export default UserStatsPage;
"use client";

import { useSession, signOut } from "next-auth/react";
import ShareButton from "@components/ui/ShareButton";

import statStyles from "@styles/ui/StatsPage.module.css";

const UserStatsPage = () => {
  const { data: session } = useSession();

  return (
    <div className={statStyles.container}>
      <p className={statStyles.heading}>Statistics</p>
      <p>The stats of user {session?.user?.name} will go here.</p>
      <ShareButton />
      <button className="underline" onClick={() => signOut()}>
        Log out
      </button>
    </div>
  );
};

export default UserStatsPage;

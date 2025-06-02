"use client";

import { Share2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { OverlayMode } from "@components/ui/MenuBar";

import styles from "@styles/ui/StatsContent.module.css";

type StatsContentProps = {
  setMode: (mode: OverlayMode) => void;
};

const StatsContent = ({ setMode }: StatsContentProps) => {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <p>Welcome {session.user?.name}</p>
        <p>Your stats will go here.</p>
        <button onClick={() => alert("TODO: implement share")}>Share</button>
        <button onClick={() => signOut()}>Log out</button>
      </>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <p className={styles.heading}>
          Want to start tracking your stats and streaks?
        </p>
        <div className={styles.buttonGroup}>
          <button
            className={styles.registerButton}
            onClick={() => setMode("login")}
          >
            Create a free account
          </button>
          <button
            className={styles.loginButton}
            onClick={() => setMode("login")}
          >
            Already registered? Log in
          </button>
        </div>

        <button
          className={styles.shareButton}
          onClick={() => alert("TODO: implement share")}
        >
          Share
          <Share2 className={styles.shareIcon} />
        </button>
      </div>
    </>
  );
};

export default StatsContent;

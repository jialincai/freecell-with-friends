"use client";

import { OverlayMode } from "@components/ui/MenuBar";
import { signIn } from "next-auth/react";
import statStyles from "@styles/ui/StatsPage.module.css";
import styles from "@styles/ui/LoginPage.module.css";

const LoginPage = () => {
  return (
    <div className={statStyles.container}>
      <p className={statStyles.heading}>Log in or create an account</p>

      <div className={styles.buttonGroup}>
        <button className={styles.authButton} onClick={() => signIn("google")}>
          <img
            src="img/social/google.png"
            alt="Google icon"
            className={styles.authImage}
          />
          Continue with Google
        </button>

        <button className={styles.authButton} onClick={() => signIn("discord")}>
          <img
            src="img/social/discord.png"
            alt="Discord icon"
            className={styles.authImage}
          />
          Continue with Discord
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

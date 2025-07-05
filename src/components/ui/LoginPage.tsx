"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import statStyles from "@styles/ui/StatsPage.module.css";
import styles from "@styles/ui/LoginPage.module.css";

const LoginPage = () => {
  return (
    <div className={statStyles.container}>
      <p className={statStyles.heading}>Log in or create an account</p>

      <div className={styles.buttonGroup}>
        <button className={styles.authButton} onClick={() => signIn("google")}>
          <Image
            src="/img/social/google.png"
            alt="Google icon"
            width={256}
            height={256}
            className={styles.authImage}
          />
          Continue with Google
        </button>

        <button className={styles.authButton} onClick={() => signIn("discord")}>
          <Image
            src="/img/social/discord.png"
            alt="Discord icon"
            width={256}
            height={256}
            className={styles.authImage}
          />
          Continue with Discord
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

"use client";

import { signIn } from "next-auth/react";
import styles from "@styles/ui/LoginContent.module.css";

const LoginContent = () => {
  return (
    <div className={styles.container}>
      <p className={styles.heading}>Log in or create an account</p>

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

export default LoginContent;

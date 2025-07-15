"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "@styles/ui/Overlay.module.css";
import StatsPage from "./StatsPage";
import LoginPage from "./LoginPage";
import HelpPage from "./HelpPage";
import { useOverlayQuery, useOverlayRouter } from "@hooks/overlay";

const Overlay = () => {
  const [overlay, loginError] = useOverlayQuery();
  const overlayRouter = useOverlayRouter();

  useEffect(() => {
    if (loginError) {
      const url = new URL(window.location.href);
      url.searchParams.delete("callbackUrl");
      url.searchParams.delete("error");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [loginError]);

  if (!overlay) return null;

  const content = {
    stats: <StatsPage />,
    login: <LoginPage loginFailed={loginError} />,
    help: <HelpPage />,
  }[overlay];

  const handleClose = () => {
    if (overlay === "login") {
      overlayRouter.open("stats");
    } else {
      overlayRouter.close();
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button onClick={handleClose} className={styles.closeButton}>
          <X className={styles.closeIcon} />
        </button>
        <div className={styles.content}>{content ?? null}</div>
      </div>
    </div>
  );
};

export default Overlay;

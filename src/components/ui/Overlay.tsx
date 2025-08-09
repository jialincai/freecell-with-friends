"use client";

import { X } from "lucide-react";
import { useOverlayQuery, useOverlayRouter } from "@/hooks/overlay";
import StatsPage from "@/components/ui/StatsPage";
import LoginPage from "@/components/ui/LoginPage";
import HelpPage from "@/components/ui/HelpPage";
import styles from "@/styles/ui/Overlay.module.css";

const Overlay = () => {
  const [overlay, loginError] = useOverlayQuery();
  const overlayRouter = useOverlayRouter();

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

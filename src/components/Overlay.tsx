"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "@styles/Overlay.module.css";

type OverlayProps = {
  hidden: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Overlay = ({ hidden, onClose, children }: OverlayProps) => {
  useEffect(() => {
    document.body.classList.toggle("scroll-lock", !hidden);
    return () => document.body.classList.remove("scroll-lock");
  }, [hidden]);

  if (hidden) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          <X className={styles.closeIcon} />
        </button>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Overlay;

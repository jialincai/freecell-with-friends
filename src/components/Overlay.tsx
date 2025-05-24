"use client";

import styles from "@styles/Overlay.module.css";

type OverlayProps = {
  hidden: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Overlay = ({ hidden, onClose, children }: OverlayProps) => {
  if (hidden) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
        <div className={styles.children}>{children}</div>
      </div>
    </div>
  );
};

export default Overlay;

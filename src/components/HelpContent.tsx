import styles from "@styles/HelpContent.module.css";

const HelpContent = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>How To Play</h2>

      <div className={styles.sectionColumn}>
        <p>
          Move all cards to the foundation piles by suit, in ascending order.
          Tap a card to send it to a foundation when possible.
        </p>
        <img src="img/help/foundation.png" className={styles.image} />
      </div>

      <div className={styles.sectionColumn}>
        <p>Use the four free cells to hold single cards temporarily.</p>
        <img src="img/help/free.png" className={styles.image} />
      </div>

      <div className={styles.sectionRow}>
        <img src="img/help/tableau.png" className={styles.image} />
        <p>
          Tableau columns are randomly populated at game start. Stack cards in
          descending order, alternating colors.
        </p>
      </div>

      <div className={styles.sectionRow}>
        <p>
          Move cards between columns to organize your tableau. You can move a
          sequence of cards if you have enough free cells and empty columns.
          Valid moves will highlight the drop area in blue.
        </p>
        <img src="img/help/move.png" className={styles.image} />
      </div>

      <div className={styles.sectionColumn}>
        <p>
          Use Undo to go back, Redeal to start a new game, and Nudge to suggest
          a move. If Nudge turns red, there are no moves left.
        </p>
        <img src="img/help/button.png" className={styles.image} />
      </div>

      <p className={styles.footer}>
        Created by{" "}
        <a href="https://jialincai.com" className={styles.link}>
          Jialin
        </a>
      </p>
    </div>
  );
};

export default HelpContent;

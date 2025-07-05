import Image from "next/image";
import styles from "@styles/ui/HelpPage.module.css";

const HelpPage = () => {
  return (
    <div className={styles.container}>
      <p className={styles.heading}>How To Play</p>

      <div className={styles.sectionColumn}>
        <p>
          Move all cards to the foundation piles by suit, in ascending order.
          Tap a card to send it to a foundation when possible.
        </p>
        <Image
          src="/img/help/foundation.png"
          className={styles.image}
          alt="Foundation piles stacked by suit from Ace to King"
          width={450}
          height={250}
        />
      </div>

      <div className={styles.sectionColumn}>
        <p>Use the four free cells to hold single cards temporarily.</p>
        <Image
          src="/img/help/free.png"
          className={styles.image}
          alt="Cards placed in one of the four free cells"
          width={450}
          height={175}
        />
      </div>

      <div className={styles.sectionRow}>
        <Image
          src="/img/help/tableau.png"
          className={styles.image}
          alt="Tableau showing cards stacked in descending order with alternating colors"
          width={170}
          height={290}
        />
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
        <Image
          src="/img/help/move.png"
          className={styles.image}
          alt="Moving a stack of cards between columns with valid drop area highlighted"
          width={170}
          height={290}
        />
      </div>

      <div className={styles.sectionColumn}>
        <p>
          Use Undo to go back, Redeal to start a new game, and Nudge to suggest
          a move. If Nudge turns red, there are no moves left.
        </p>
        <Image
          src="/img/help/button.png"
          className={styles.image}
          alt="UI buttons for Undo, Redeal, and Nudge"
          width={320}
          height={40}
        />
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

export default HelpPage;

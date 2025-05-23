import { HelpCircle, Trophy} from "lucide-react";
import styles from "@styles/MenuBar.module.css";

const MenuBar: React.FC = () => (
    <div className={styles.menuBar}>
      <button className={styles.menuButton}>
        <Trophy className={styles.menuIcon} />
      </button>
      <button className={styles.menuButton}>
        <HelpCircle className={styles.menuIcon} />
      </button>
    </div>
  );
  
  export default MenuBar;
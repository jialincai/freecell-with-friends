import { HelpCircle } from "lucide-react";
import styles from "@styles/MenuBar.module.css";

const MenuBar: React.FC = () => (
    <div className={styles.menuBar}>
      <button className={styles.helpButton} title="How to play">
        <HelpCircle className={styles.helpIcon} />
      </button>
    </div>
  );
  
  export default MenuBar;
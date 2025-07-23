import styles from "@styles/ui/ErrorPage.module.css";

const ErrorPage = () => {
  return (
    <div className={styles.container}>
      <p className={styles.heading}>Oops! Something went wrong.</p>
      <p className={styles.message}>
        We're having trouble connecting to the server.
      </p>
      <p className={styles.message}>
        Please contact us at{" "}
        <a href="support@freecellwithfriends.com" className={styles.link}>
          support@freecellwithfriends.com
        </a>
        .
      </p>
    </div>
  );
};

export default ErrorPage;

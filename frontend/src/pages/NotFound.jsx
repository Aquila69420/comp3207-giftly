import React from 'react';
import styles from '../styles/notFound.module.css';
import logo from "../image/giftly_logo_trans.png";
function NotFound() {

  const handleGoHome = () => {
    window.history.back();
  };

  return (
    <div className={styles.container}>
        <img src={logo} alt="logo" width={200} />
        <h1 className={styles.title}>404 - Page Not Found</h1>
        <p className={styles.message}>Sorry, the page you are looking for does not exist.</p>
        <button onClick={handleGoHome} className={styles.button}>Go Back</button>
    </div>
  );
}

export default NotFound;
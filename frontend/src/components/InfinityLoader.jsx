import React from "react";
import canvaLogo from '../image/canva_logo.png';
import styles from "../styles/infinityLoader.module.css";

const InfinityLoader = () => {
  return (
    <div className={styles.loaderContainer}>
        <svg
        className={styles.infinitySvg}
        viewBox="0 0 200 100"
        xmlns="http://www.w3.org/2000/svg"
        >
            <path
            className={styles.infinityPath}
            d="M100,50 
            C60,10 10,10 10,50 
            S60,90 100,50 
            C140,10 190,10 190,50 
            S140,90 100,50 Z"
            />
        </svg>
        <img src={canvaLogo} alt="Gift box without bow" className={styles.canvaLogo} />
    </div>
  );
};

export default InfinityLoader;

import React from "react";
import styles from "../styles/parameters.module.css";

const Parameters = () => {
  return (
    <div className={styles.parameters}>
      <input type="text" placeholder="Occasion" />
      <input type="text" placeholder="Interests" />
      <input type="text" placeholder="Budget" />
      <button>Find Gifts</button>
    </div>
  );
};

export default Parameters;

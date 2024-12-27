import React from "react";
import styles from "../styles/searchBar.module.css";

const SearchBar = () => {
  return (
    <div className={styles.searchBar}>
      <input type="text" placeholder="I'm looking for..." />
      <button>Search</button>
    </div>
  );
};

export default SearchBar;

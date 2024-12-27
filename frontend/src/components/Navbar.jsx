import React from "react";
import styles from "../styles/navbar.module.css";

const Navbar = ({ username, setUsername }) => {
  const handleLogout = () => {
    setUsername("");
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>Giftly</div>
      <div className={styles.account}>
        {username ? (
          <>
            <span>{username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button>Login</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;

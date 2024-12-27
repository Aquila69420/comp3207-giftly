import React, { useState } from "react";
import styles from "../styles/sidebar.module.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <button onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? ">" : "<"}
      </button>
      {!isCollapsed && (
        <div>
          <h3>Past Wishlists</h3>
          <ul>
            <li>Wishlist 1</li>
            <li>Wishlist 2</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

import React, { useState } from "react";
import styles from "../styles/sidebar.module.css";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";


// bug the toggle button does not show when overflow is present
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const wishlists = Array.from({ length: 3 }, (_, i) => `Wishlist ${i + 1}`); // Create an array with 100 wishlists

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={styles.toggleButton}
      >
        {isCollapsed ? (
          <GoSidebarCollapse size={30} />
        ) : (
          <GoSidebarExpand size={30} />
        )}
      </button>
      {!isCollapsed && (
        <div>
          <h3>Past Wishlists</h3>
          <ul>
            {wishlists.map((wishlist, index) => (
              <li key={index}>{wishlist}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

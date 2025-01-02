import React, { useState, useEffect } from "react";
import config from "../config";
import styles from "../styles/sidebar.module.css";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import logo from "../image/giftly_logo_trans.png";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWishlists = async () => {
      setLoading(true);
      try {
        const username = localStorage.getItem("username");
        const response = await fetch(`${config.backendURL}/wishlist_get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();

        const productDetailsPromises = data.response.map(async (productId) => {
          try {
            const productResponse = await fetch(
              `${config.backendURL}/get_product_by_id?id=${productId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            const productInfo = await productResponse.json();
            if (productInfo.response !== "Product not found") {
              return { id: productId, title: productInfo.response.title };
            } else {
              return null;
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return null;
          }
        });

        const productDetails = (
          await Promise.all(productDetailsPromises)
        ).filter((detail) => detail !== null);

        setWishlists(productDetails);
      } catch (error) {
        console.error("Error fetching wishlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlists();
  }, []);

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
          <img src={logo} width={100} alt="Giftly Logo" />
          <h3>Your Wishlist</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
              <ul className={styles.wishlistList}>
                {wishlists.length > 0 ? (
                  wishlists.map((wishlist, index) => (
                    <li key={index} className={styles.wishlistItem}>
                      <a href={`/product?id=${wishlist.id}`}>
                        {wishlist.title.charAt(0).toUpperCase() +
                          wishlist.title.slice(1)}
                      </a>
                    </li>
                  ))
                ) : (
                  <p className={styles.noWishlists}>No wishlists found.</p>
                )}
              </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

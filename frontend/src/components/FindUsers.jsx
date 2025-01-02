import React, { useState } from "react";
import config from "../config";
import styles from "../styles/findUsers.module.css";

function FindUsers() {
  const [usernameToFind, setUsernameToFind] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlist, setWishlist] = useState(null);

  const fetchWishlist = async (username) => {
    try {
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
            const word = productInfo.response.title;
            const capitalizedTitle =
              word.charAt(0).toUpperCase() + word.slice(1);
            return { id: productId, title: capitalizedTitle };
          } else {
            return null;
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return null;
        }
      });

      const productDetails = (await Promise.all(productDetailsPromises)).filter(
        (detail) => detail !== null
      );

      setWishlist({ username, items: productDetails });
    } catch (error) {
      console.error("Error fetching Wishlist:", error);
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${config.backendURL}/find_user_autocomplete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );
      const result = await response.json();
      setSuggestions(result.usernames || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUsernameToFind(value);
    debouncedFetchSuggestions(value);
  };

  const handleSuggestionClick = (username) => {
    setUsernameToFind(username);
    setSuggestions([]);
    fetchWishlist(username);
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Search for a username..."
          value={usernameToFind}
          onChange={handleInputChange}
          className={styles.inputField}
        />
      </div>
      {isLoading && <p className={styles.loadingText}>Loading...</p>}
      {suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((username, index) => (
            <li
              key={index}
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(username)}
            >
              {username}
            </li>
          ))}
        </ul>
      )}

      {wishlist && (
        <div className={styles.wishlistContainer}>
          <h2 className={styles.wishlistHeader}>
            Wishlist for {wishlist.username}
          </h2>
          {wishlist.items.length > 0 ? (
            <ul className={styles.wishlistItems}>
              {wishlist.items.map((item, index) => (
                <li key={index} className={styles.wishlistItem}>
                  <a href={`/product?id=${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noWishlistText}>No items in the wishlist.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default FindUsers;

import React, { useState } from "react";
import logo from "../image/giftly_logo_trans.png";
import styles from "../styles/SearchResults.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import config from "../config";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = location.state;
  const username = location.state.username;
  const initialSearchQuery = data.query;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const [productsInfo, setProductsInfo] = useState(data.response);
  const [sortOrder, setSortOrder] = useState("asc");

  const parsePrice = (price) => {
    if (typeof price === "string") {
      const numericPrice = price.replace(/[^0-9.]/g, ""); // Remove non-numeric characters
      return parseFloat(numericPrice) || 0; // Convert to float or return 0 if invalid
    }
    return 0;
  };

  const onSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const onBack = () => {
    navigate("/home");
  };

  const sendQuery = async () => {
    try {
      console.log("Sending query to backend: ", searchQuery);
      const prompt = searchQuery;
      const response = await fetch(`${config.backendURL}/product_text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, prompt }),
      });
      const result = await response.json();
      console.log(result);
      // Update state instead of navigating
      setProductsInfo(result.response);
      setSearchQuery(result.query);
    } catch (error) {
      console.error("Error sending query to backend: ", error);
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      sendQuery();
    }
  };

  const handleSortChange = (event) => {
    const order = event.target.value;
    setSortOrder(order);
    const sortedProducts = {};
    Object.keys(productsInfo).forEach((source) => {
      sortedProducts[source] = productsInfo[source].sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);
        return order === "asc" ? priceA - priceB : priceB - priceA;
      });
    });

    setProductsInfo(sortedProducts);
  };

  return (
    <div className={styles.container}>
      <div className={styles.featureBanner}>
        <span className={styles.featureText}>
          Introducing AI Intelligent Search: Improved Search Results with
          Context Augmentation
        </span>
      </div>
      {/* Top bar */}
      <div className={styles.topBar}>
        <IoMdArrowRoundBack
          size={25}
          onClick={onBack}
          className={styles.backButton}
        />
        <img src={logo} alt="logo" width={90} />
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            onKeyDown={handleKeyDown}
            className={styles.searchText}
            placeholder="Search..."
          />
          <div className={styles.searchButton} onClick={sendQuery}>
            <FaSearch />
          </div>
        </div>
      </div>

      {/* Sorting */}
      <div className={styles.sortBar}>
        <label htmlFor="sort">Sort by Price:</label>
        <select
          id="sort"
          value={sortOrder}
          onChange={handleSortChange}
          className={styles.sortSelect}
        >
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>

      {/* Product grid */}
      <div className={styles.titleValue}>Gift Products</div>
      <div className={styles.productGrid}>
        {Object.keys(productsInfo).map((source) =>
          productsInfo[source].map((product) => (
            <ProductCard
              key={product.product_url}
              image={product.image_url}
              title={product.name}
              price={`${product.currency} ${product.price}`}
              url={product.product_url}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default SearchResults;

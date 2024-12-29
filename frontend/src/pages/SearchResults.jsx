import React, { useState } from "react";
import logo from "../image/giftly_logo_trans.png";
import styles from "../styles/searchResults.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import config from "../config";
import { FaSearch } from "react-icons/fa";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = location.state;
  const username = location.state.username;
  const initialSearchQuery = data.query;
  let productsInfo = data.response;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");

  const onSearchChange = (event) => {
    setSearchQuery(event);
  };
  
  const onBack = () => {
    navigate("/")
  };

  const sendQuery = async () => {
    try{
      // Send updated query to backend
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
      setSearchQuery(searchQuery);
      productsInfo = result.response;
    }
    catch (error){
      console.error("Error sending query to backend: ", error); 
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      sendQuery();
    }
  };

  return (
    <div className={styles.container}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button onClick={onBack} className={styles.backButton}>
          &#8592; Back
        </button>
        <img src={logo} alt="logo" width={50} />
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)} // Display the search in real time as the user changes the value
            onKeyDown={handleKeyDown} // On enter key pressed, send the new value to the backend
            className={styles.searchText}
            placeholder="Search..."
          />
          <div className={styles.searchButton} onClick={sendQuery}>
            <FaSearch />
          </div>
        </div>
      </div>

      {/* Product grid */}
      {/* TODO: Add target back in */}
      <div className={styles.productGrid}>
        {Object.keys(productsInfo).map(
          (source) =>
            source !== "target" &&
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

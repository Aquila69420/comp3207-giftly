import React, { useState } from "react";
import logo from "../image/giftly_logo_trans.png";
import styles from "../styles/searchResults.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function SearchResults({ onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state;
  const username = location.state.username;
  const initialSearchQuery = data.query;
  let productsInfo = data.response;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');

  const onSearchChange = (event) => {
    setSearchQuery(event);
  };

  const handleKeyDown = async (event) => {
    // TODO: Could consider UI search icon click event as well
    if (event.key === "Enter") {
      // Send updated query to backend
      const prompt = searchQuery;
      try {
        const response = await fetch('http://localhost:5000/product_text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({username, prompt}),
        });
        const result = await response.json();
        setSearchQuery(searchQuery);
        productsInfo = result.response;
      }
      catch (error) {
        console.error('Error sending input data:', error);
      }
    }
  }

  const handleCardClick = (productURL) => {
    // TODO: Fix bug that doesn't register card click at the moment
    // navigate(`/product/${encodeURIComponent(productURL)}`, { state: { productURL } });
    console.log('Card clicked');
    // console.log('Product URL:', productURL);
  }
  
  return (
    <div className={styles.container}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button onClick={onBack} className={styles.backButton}>&#8592; Back</button>
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
        </div>
      </div>
      
      {/* Product grid */}
      {/* TODO: Fix bug that doesn't register card styling/CSS at the moment */}
      {/* TODO: Add target back in */}
      <div className={styles.productGrid}>
        {Object.keys(productsInfo).map((source) =>
          source !== 'target' && productsInfo[source].map((product) => (
            <ProductCard
              key={product.product_url}
              image={product.image_url}
              title={product.name}
              price={`${product.currency} ${product.price}`}
              onClick={(event) => {
                event.stopPropagation(); // Stop event bubbling
                handleCardClick(product.product_url);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
  

export default SearchResults;
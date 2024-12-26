import React, { useState } from "react";
import logo from "../image/giftly_logo_trans.png";
import styles from "../styles/SearchResults.module.css";

function SearchResults({ products, currentSearch, onSearchChange, onBack }) {
    const [filters, setFilters] = useState({});
  
    // Handle filter changes (extendable logic for multiple filters)
    const handleFilterChange = (event) => {
      const { name, value } = event.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
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
              value={currentSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchText}
              placeholder="Search..."
            />
          </div>
        </div>
  
        
        {/* Main content */}
        {/* <div className={styles.mainContent}> */}
          {/* Product grid */}
          {/* <div className={styles.productGrid}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.productImage}
                />
                <div className={styles.productName}>{product.name}</div>
              </div>
            ))}
          </div> */}
        {/* </div> */}
      </div>
    );
  }
  

export default SearchResults;
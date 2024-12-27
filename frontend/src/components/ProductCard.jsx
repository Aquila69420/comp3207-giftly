import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "../styles/productCard.module.css";
import { Link } from "react-router-dom";

function ProductCard({ image, title, price, url }) {
  /* Define the onclick here, which creates and retrevies cosmos db uuid for that product and then
  navigates to it when click on*/

  return (
    <div onClick={() => console.log("suck toes")}>
      <div className={styles.card}>
        <img src={image} alt={title} className={styles.image} />
        <div className={styles.title}>{title}</div>
        <div className={styles.price}>{price}</div>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ProductCard;

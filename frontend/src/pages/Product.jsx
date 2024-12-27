import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/product.module.css";
import {FaHeart, FaRegHeart } from "react-icons/fa";
import { IoCartOutline, IoCart } from "react-icons/io5";

// TODO: Add loading animation with infinity loop over gift
// Icons available at https://react-icons.github.io/react-icons/
// Infinity loop: https://codepen.io/suez/pen/myvgdg
// Gift is from logo but cropped
// http://localhost:3000/product?id=b7a68cb3-5d2b-41b0-8497-ae7d5efd0adb
export default function Product() {
  const location = useLocation();
  const data = location.state;
  const url = data.url;
  const title = data.title;
  const image = data.image;
  const price = data.price;

  const [favorite, setFavorite] = useState(false);
  const [cart, setCart] = useState(false);

  return (
    <div className={styles.product}>
      <div className={styles.image}>
        <img src={image} alt={title}/>
      </div>
      <div className={styles.productInfo}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.price}>${price}</p>
        <div className={styles.productActions}>
          <button className={styles.favoriteButton} onClick={() => setFavorite(!favorite)}>
            {favorite ? <FaHeart /> : <FaRegHeart />}
          </button>
          <a href={url} className={styles.link} target="_blank" rel="noopener noreferrer">
            View Product
          </a>
          <button className={styles.cartButton} onClick={() => setCart(!cart)}>
            {cart ? <IoCart /> : <IoCartOutline />}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import styles from "../styles/product.module.css";
import {FaHeart, FaRegHeart } from "react-icons/fa";
import { IoCartOutline, IoCart } from "react-icons/io5";
import config from "../config";

// TODO: Implement add to cart and wishlist functionality
// TODO: Add loading animation with infinity loop over gift
// Icons available at https://react-icons.github.io/react-icons/
// Infinity loop: https://codepen.io/suez/pen/myvgdg
// Gift is from logo but cropped
export default function Product() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const data = location.state || {};
  const [id, setId] = useState(data.id || searchParams.get("id"));
  const [url, setUrl] = useState(data.url || "");
  const [title, setTitle] = useState(data.title || "");
  const [image, setImage] = useState(data.image || "");
  const [price, setPrice] = useState(data.price || "");
  const getProductInfoById = async () => {
    // Fetch product info by id
    const productId = searchParams.get("id");
    setId(productId);
    const response = await fetch(`${config.backendURL}/get_product_by_id?id=${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const productInfo = await response.json();
    if (productInfo.response !== 'Product not found') {
      // Set product info
      const productDetails = productInfo.response;
      setUrl(productDetails.url);
      setTitle(productDetails.title);
      setImage(productDetails.image);
      setPrice(productDetails.price);
      console.log('Product Info:', productDetails);
      console.log('ID is', id);
      console.log('URL is', productDetails.url);
      console.log('Title is', productDetails.title);
      console.log('Image is', productDetails.image);
      console.log('Price is', productDetails.price);
    }
    else {
      // Redirect to 404 page
      navigate("/404");
    }
  };
  useEffect(() => {
    if (!data.id) {
      // Get product info by id from backend
      getProductInfoById();
    }
  }, [data.id, getProductInfoById]);

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

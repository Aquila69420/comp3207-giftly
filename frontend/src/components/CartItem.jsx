import {React, useState} from "react";
import styles from "../styles/cartItem.module.css";
import { IoCartOutline, IoCart } from "react-icons/io5";
import {FaHeart, FaRegHeart } from "react-icons/fa";
import config from "../config";

const CartItem = ({ item, index }) => {
    const [cart, setCart] = useState(true);
    const { id, url, title, price, image } = item;
    const [favorite, setFavorite] = useState(false);
    const username = localStorage.getItem("username") || "";

    // Function to handle updating the wishlist
  const updateWishlistStatus = async () => {
    setFavorite(!favorite);
    const addToWishlist = async () => {
      const response = await fetch(`${config.backendURL}/wishlist_update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"username": username, "gift": id}),
      });
      const data = await response.json();
      console.log(`Gift added to wishlist: ${JSON.stringify(data)}`);
    };
  
    const removeFromWishlist = async () => {
      const response = await fetch(`${config.backendURL}/wishlist_remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"username": username, "gift": id}),
      });
  
      const data = await response.json();
      console.log(`Gift removed from wishlist: ${JSON.stringify(data)}`);
    };

    favorite ? await removeFromWishlist() : await addToWishlist();
  }

    const updateCartStatus = async () => {
        setCart(!cart);
        const addToCart = async () => {
            // Add to session storage cart
            console.log('Adding to cart:', id);
            const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
            cart.push({id, url, title, price, image});
            sessionStorage.setItem("cart", JSON.stringify(cart));
        };
        
        const removeFromCart = async () => {
            // Remove from session storage cart
            console.log('Removing from cart:', id);
            const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
            const updatedCart = cart.filter((item) => item.id !== id);
            sessionStorage.setItem("cart", JSON.stringify(updatedCart));
        };
      
        cart ? await removeFromCart() : await addToCart();
    };

    
    return (
        <li key={index} className={styles.cartItem}>
        <img src={image} alt={title} className={styles.itemImage} />
        <div className={styles.itemDetails}>
            <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.itemTitle}
            >
            {title}
            </a>
            <p className={styles.itemPrice}>Price: {price}</p>
        </div>
        <button className={styles.favoriteButton} onClick={updateWishlistStatus}>{favorite ? <FaHeart /> : <FaRegHeart />}</button>
        <button className={styles.cartButton} onClick={updateCartStatus}>{cart ? <IoCart /> : <IoCartOutline />}</button>
        </li>
    );
};

export default CartItem;

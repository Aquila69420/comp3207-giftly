import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import styles from "../styles/product.module.css";
import {FaHeart, FaRegHeart } from "react-icons/fa";
import { IoCartOutline, IoCart } from "react-icons/io5";
import config from "../config";
import InfinityLoader from "../components/InfinityLoader";

// Icons available at https://react-icons.github.io/react-icons/
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
  const [favorite, setFavorite] = useState(false);
  const [cart, setCart] = useState(false);
  const username = localStorage.getItem("username");
  const [loading, setLoading] = useState(false);
  
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

  const saveCart = async () => {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Please add items to your cart first.");
      return;
    }
    // Get session id
    const sessionId = localStorage.getItem("sessionId");
    // First see if cart is already stored
    setLoading(true);
    const response = await fetch(`${config.backendURL}/load_cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, session_id: sessionId }),
    });
    const result = await response.json();
    if (result.response !== "failed") {
      // If cart is already existing, create a new cart
      const response = await fetch(`${config.backendURL}/save_cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          cart_content: cart,
          session_id: sessionId+1,
        }),
      });
      const result = await response.json();
      console.log("Response from backend:", result);
    }
    else {
      const response = await fetch(`${config.backendURL}/save_cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          cart_content: cart,
          session_id: sessionId,
        }),
      });
      const result = await response.json();
      console.log("Response from backend:", result);
    }
    setLoading(false);
    navigate("/cart")
  };

  return (
    <div>
    {loading ? (
      <div className="overlay">
        <InfinityLoader loading={loading} />
      </div>
    ) : (
      <div className={styles.product}>
      <div className={styles.image}>
        <img src={image} alt={title}/>
      </div>
      <div className={styles.productInfo}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.price}>${price}</p>
        <div className={styles.productActions}>
          <button className={styles.favoriteButton} onClick={updateWishlistStatus}>
            {favorite ? <FaHeart /> : <FaRegHeart />}
          </button>
          <a href={url} className={styles.link} target="_blank" rel="noopener noreferrer">
            View Product
          </a>
          <button className={styles.cartButton} onClick={updateCartStatus}>
            {cart ? <IoCart /> : <IoCartOutline />}
          </button>
        </div>
        <div className={styles.nav}>
        <button className={styles.navButton} onClick={() => window.history.back}>Continue Shopping</button>
        <button className={styles.navButton} onClick={saveCart}>Proceed to Cart</button>
        </div>
      </div>
    </div>
    )}
    </div>
  );
}

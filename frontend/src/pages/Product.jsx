import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import styles from "../styles/product.module.css";
import { FaHeart, FaRegHeart} from "react-icons/fa";
import { IoCartOutline, IoCart } from "react-icons/io5";
import config from "../config";
import { CiShop } from "react-icons/ci";
import InfinityLoader from "../components/InfinityLoader";
import { FaShare } from "react-icons/fa";
import SharedCartMenu from "../components/SharedCartMenu";

export default function Product({ previousState }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const data = location.state || {};
  const [id, setId] = useState(data.id || searchParams.get("id"));
  const [url, setUrl] = useState(data.url || "");
  const [title, setTitle] = useState(data.title || "");
  const [image, setImage] = useState(data.image || "");
  const [price, setPrice] = useState(data.price || "");
  const [favorite, setFavorite] = useState(false); // Check if product is already in wishlist first to set this value
  const [cart, setCart] = useState(false); // Check if product is already in cart first to set this value
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userID");
  const [loading, setLoading] = useState(false);

  const checkProductInWishlist = async () => {
    const response = await fetch(`${config.backendURL}/wishlist_get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });
    const data = await response.json();
    const gifts = data.response;
    gifts.forEach((gift) => {
      if (gift === id) {
        setFavorite(true);
        return;
      }
    });
  };

  const checkProductInCart = async () => {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    if (cart.length > 0) {
      for (const item of cart) {
        if (item.id === id) {
          setCart(true);
          return;
        }
      }
    }
  };

  const getProductInfoById = async () => {
    const productId = searchParams.get("id");
    setId(productId);
    const response = await fetch(
      `${config.backendURL}/get_product_by_id?id=${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const productInfo = await response.json();
    if (productInfo.response !== "Product not found") {
      const productDetails = productInfo.response;
      setUrl(productDetails.url);
      setTitle(productDetails.title);
      setImage(productDetails.image);
      setPrice(productDetails.price);
    } else {
      navigate("/404");
    }
  };

  
  const handleSharedCartDivisionSelect = async (divisionId, groupId) => {

    // Get session id
    const sessionId = divisionId;

    const item = { id, url, title, price, image };

    // First see if cart is already stored
    const response = await fetch(`${config.backendURL}/load_cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: groupId, session_id: sessionId }),
    });
    const result = await response.json();
    const cart = result.response;
    if (result.response !== "failed") {

      let cartContent = cart[divisionId];

      let action = "add";

      if (cartContent) {
        let itemExists = false;
        cartContent.forEach((cartItem) => {
          if (cartItem.id === item.id) {
            itemExists = true;
          }
        });
        if (itemExists) {
          // Item already exists in cart alert "Do you want to remove it?"
          const confirmRemove = window.confirm(
            "Item already exists in shared cart. Do you want to remove it?"
          );
          if (confirmRemove) {
            action = "remove";
          } else {
            return;
          }
        }
        cartContent.push(item);
      }

      const response = await fetch(`${config.backendURL}/update_cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: divisionId,
          username: groupId,
          item,
          action,
        }),
      });
      const result = await response.json();
      if (result.response === "Cart updated") {
        alert("Shared cart updated!");
      } else {
        alert("Failed to update shared cart.");
      }
    }
    else {
      const response = await fetch(`${config.backendURL}/save_cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: groupId,
          cart_content: [item],
          session_id: sessionId,
        }),
      });
      const result = await response.json();
    }
  }
    


  useEffect(() => {
    if (!sessionStorage.getItem("sessionId")) {
      sessionStorage.setItem("sessionID", JSON.stringify(Math.random().toString(36).substring(2)));
    }
    if (!data.id) {
      getProductInfoById();
    }
  }, [data.id]);

  useEffect(() => {
    checkProductInCart();
    checkProductInWishlist();
    console.log("Wishlist status: ", favorite);
  }, [favorite, cart, data.id]);

  const updateWishlistStatus = async () => {
    setFavorite(!favorite);
    const updateWishlist = favorite
      ? `${config.backendURL}/wishlist_remove`
      : `${config.backendURL}/wishlist_update`;
    const response = await fetch(updateWishlist, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, gift: id }),
    });
    const result = await response.json();
    if (updateWishlist.endsWith("/wishlist_update") && result.response === "Gift already in wishlist") {
      alert("Gift already in wishlist");
      setFavorite(true);
    }
  };

  const updateCartStatus = async () => {
    setCart(!cart);

    const addToCart = async () => {
      // Add to session storage cart
      const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
      // only push if item is not already in cart
      if (cart.length > 0) {
        for (const item of cart) {
          if (item.id === id) {
            alert("Item already in cart");
            return;
          }
        }
      }
      cart.push({ id, url, title, price, image });
      let cartWithKey = "cart" + sessionStorage.getItem("sessionId");
      sessionStorage.setItem("cart", JSON.stringify(cart));
      
    };

    const removeFromCart = async () => {
      // Remove from session storage cart
      const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
      const updatedCart = cart.filter((item) => item.id !== id);
      let cartWithKey = "cart" + sessionStorage.getItem("sessionId");
      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    cart ? await removeFromCart() : await addToCart();
  };

  const saveCart = async () => {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    console.log("Cart items before:", cart);
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
      // If cart is already existing, delete and then create a new cart
      const deleteResponse = await fetch(`${config.backendURL}/delete_cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          username: username
        }),
      });
      const deleteResult = await deleteResponse.json();
      if (deleteResult.response === "Cart deleted") {
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
      }
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
            <img src={image} alt={title} />
          </div>
          <div className={styles.productInfo}>
            <h1 className={styles.title}>{title ? title.charAt(0).toUpperCase() + title.slice(1) : ""}</h1>
            <p className={styles.price}>{price}</p>
            <div className={styles.productActions}>
              <button
                className={styles.favoriteButton}
                onClick={updateWishlistStatus}
              >
                {favorite ? <FaHeart /> : <FaRegHeart />}
              </button>
              <a
                href={url}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Product
              </a>
              <button className={styles.cartButton} onClick={updateCartStatus}>
                {cart ? (
                  <IoCart color="black" />
                ) : (
                  <IoCartOutline color="black" />
                )}
              </button>

              


            </div>
            <div className={styles.nav}>
              <button
                className={styles.navButton1}
                onClick={() => navigate(-1)}
              >
                <div>Go Back </div>
                <CiShop size={30} />
              </button>
              <button className={styles.navButton1} onClick={saveCart}>
                <div>Proceed to Cart</div> <IoCartOutline size={30} />
              </button>

              <SharedCartMenu
                userId={userId}
                onDivisionSelect={handleSharedCartDivisionSelect}
              />
              {/* <button className={styles.navButton1}>
                <div>Share With Group</div> <FaShare size={30} />
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

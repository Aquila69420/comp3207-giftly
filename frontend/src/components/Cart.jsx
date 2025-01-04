import React, { useState, useEffect } from "react";
import styles from "../styles/cart.module.css";
import CartItem from "./CartItem"; 
import config from "../config";
import Freecurrencyapi from '@everapi/freecurrencyapi-js';

function Cart({ sessionId, context }) {
  const [cartItems, setCartItems] = useState(JSON.parse(sessionStorage.getItem("cart")) || []);
  const [totalCost, setTotalCost] = useState(0);
  const freecurrencyapi = new Freecurrencyapi(config.currencyConversionAPIKey);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const calculateTotalCost = async () => {
      if (cartItems.length === 0) {
        setTotalCost(0);
        return;
      }
      const newTotalCost = await cartItems.reduce(async (accPromise, item) => {
        const acc = await accPromise;
        let [currency, price] = item.price.split(" "); // Split the price string by space
        let latestConversionData = await freecurrencyapi.latest({base_currency: 'GBP', currencies: currency}); // Gets the rate from GBP to other currency so need to convert from other currency to GBP
        let latestConversionRate = latestConversionData.data[currency];
        price = parseFloat(price)/latestConversionRate; // Convert the price to GBP
        return acc + price; // Add the numeric value to the total
      }, Promise.resolve(0));
      setTotalCost(newTotalCost);
      console.log('Total cost:', totalCost)
      console.log('Cart items:', cartItems)
    };

    calculateTotalCost();
  }, [cartItems]);

  useEffect(() => {
    const loadCart = async () => {
      if (context !== "shared-cart") {
        return;
      }
      try {
        const response = await fetch(`${config.backendURL}/load_cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: username, session_id: sessionId }),
        });
        const result = await response.json();
        if (response.ok && result.response !== "failed") {
          console.log('Response from backend:', result);
          setCartItems(result.response[sessionId]);
        } else {
          setCartItems([]);
          setTotalCost(0);
          console.error('Failed to load cart:', result.message);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    };

    loadCart();
  }, [username, sessionId]);



  const handleSaveCart = async () => {
    setCartItems(JSON.parse(sessionStorage.getItem("cart")))
    // Get session id
    const sessionId = localStorage.getItem("sessionId");
    // First see if cart is already stored
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
          cart_content: cartItems,
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
          cart_content: cartItems,
          session_id: sessionId,
        }),
      });
      const result = await response.json();
      console.log("Response from backend:", result);
    }
  };

  const handleClear = () => {
    setCartItems([]);
    sessionStorage.setItem("cart", JSON.stringify([]))
  };

  useEffect(() => {
    // Save cart when user navigates away from the current page
    const handleBeforeUnload = (event) => {
      handleSaveCart();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cartItems]);

  return (
      <div className={styles.cartContent}>
        <p className={styles.cartTitle}>Gift Shopping Cart</p>
        <ul className={styles.cartList}>
          <ul className={styles.cartList}>
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
              <CartItem
              key={index}
              item={item}
              index={index}
              />
              ))
            ) : (
              <li>Your cart is empty</li>
            )}
          </ul>
        </ul>
        <div className={styles.totalCost}>Total: £{totalCost.toFixed(2)}</div>
        <button onClick={handleClear} className={styles.button}>Clear</button>
      </div>
  );
}

export default Cart;

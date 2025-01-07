import React, { useState, useEffect, use } from "react";
import styles from "../styles/cart.module.css";
import CartItem from "./CartItem"; 
import config from "../config";
import Freecurrencyapi from '@everapi/freecurrencyapi-js';

function Cart({ sessionId, context, groupID }) {

  const storedCart = sessionStorage.getItem("cart")
  ? JSON.parse(sessionStorage.getItem("cart"))
  : [];
  const [cartItems, setCartItems] = useState(storedCart);
  const [totalCost, setTotalCost] = useState(0);
  const freecurrencyapi = new Freecurrencyapi(config.currencyConversionAPIKey);

  const username = (context === "shared-cart") ? groupID : localStorage.getItem("username");

  useEffect(() => {
    if (!sessionStorage.getItem("sessionId")) {
      (context === "shared-cart") ? sessionStorage.setItem("sessionId", JSON.stringify(groupID)) : sessionStorage.setItem("sessionID", JSON.stringify(Math.random().toString(36).substring(2)));
    }
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
          body: JSON.stringify({ username: groupID, session_id: sessionId }),
        });
        const result = await response.json();
        if (response.ok && result.response !== "failed") {
          // console.log('Response from backend:', result);
          setCartItems(result.response[sessionId]);
          sessionStorage.setItem("cart", JSON.stringify(result.response[sessionId]));
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
    // Get global cart items
    // console.log("Cart items before:", cartItems);
    let cartItems = JSON.parse(sessionStorage.getItem("cart"));
    // Get session id
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
        console.log("Cart deleted successfully");
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
    setTotalCost(0);
    sessionStorage.setItem("cart", JSON.stringify([]));
    if (context === "shared-cart") {
      handleSaveCart();
    }     
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
              context={context}
              onUpdate={handleSaveCart}
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

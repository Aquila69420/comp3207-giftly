import React, { useState, useEffect } from "react";
import styles from "../styles/cart.module.css";
import config from "../config";

// TODO: build cart page functionality - save from session storage, delete cart, delete items from current cart, load and view other carts for user
function Cart({ username }) {
  const [cartItems, setCartItems] = useState([]); // Cart content stored here
  const [cartName, setCartName] = useState("");
  const [loadCartName, setLoadCartName] = useState("");
  const [deleteCartName, setDeleteCartName] = useState("");
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const newTotalCost = cartItems.reduce(
      (acc, item) => acc + item.quantity * item.pricePerUnit,
      0
    );
    setTotalCost(newTotalCost);
  }, [cartItems]);

  // IMPROVEMENT: aggregate the items by vendor and take to actual cart. After buying item the boxes should tick by themselves. If item checkbox crossed then do not add the item as it was already purchased. Buy button deactivated if cart empty.
  const handleBuy = () => {
    console.log("Buying items", cartItems);

    cartItems.forEach((item) => {
      if (!item.checked && item.supplier) {
        window.open(item.supplier, "_blank");
      }
    });
  };

  // IMPROVEMENT: don't allow for save or load cart button before there is text. Dont allow to save cart if cart is empty. Include if gift alreayd bought (select box)
  const handleSaveCart = async (cartName) => {
    console.log("Saving cart", cartName);
    try {
      const response = await fetch(`${config.backendURL}/save_cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          cart_content: cartItems,
          cart_name: cartName,
        }),
      });

      const result = await response.json();
      console.log("Response from backend:", result);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleLoadCart = async (loadCartName) => {
    console.log("Loading cart", loadCartName);
    try {
      const response = await fetch(`${config.backendURL}/load_cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, cart_name: loadCartName }),
      });

      const result = await response.json();
      console.log(result);
      if (result["response"] !== "failed") {
        const cartKey = Object.keys(result["response"])[0];
        const cartContents = result["response"][cartKey];
        console.log("cartContents: ", cartContents);
        handleClear();
        cartContents.forEach((item) => {
          setCartItems((prevItems) => [...prevItems, item]);
        });
        // IMPROVEMENT: change cart title to the cart name
      } else {
        console.log("Response from backend:", result);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleDeleteCart = async (DeleteCartName) => {
    console.log("Deleting cart", DeleteCartName);
    try {
      const response = await fetch(`${config.backendURL}/delete_cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, cart_name: DeleteCartName }),
      });

      const result = await response.json();
      console.log("Response from backend:", result);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleAddToCart = () => {
    // change this to the item you actually clicked on the add
    const newItem = {
      name: `Basketball`,
      quantity: 1,
      pricePerUnit: 10,
      supplier:
        "https://www.amazon.co.uk/AmazonBasics-PU-Composite-Basketball-Official/dp/B07VL3NHMY/ref=sr_1_1_ffob_sspa?crid=2J2L2AEEMRLQO&dib=eyJ2IjoiMSJ9.vWaA-4h7T7hycBHPmi8jOGp1hDHrXzgk8RCVnbvdRE2WfU6nse6T_ID9LS1gdKzQiQY6kRA2b_uLfEIqgZzJCPoEXgkpgF7R6oifnYh-ikVSszo58ouszZFWPFlOYKFfFdcI0cEKzPZAvJv5tf-APHV0bGRr6SPQh4xSWXtfuOAYpiI-qEr-Han-xYf09TBpJOWhgdFbpued4G7SSICg-i3-KzsCI5DFL0uzE-OXakC36YuylIN69QZApCqBAoZZvwvP_Dp6OA9rJOAF7MX68cjDURFmq1LqI6H4yISlMKs.hAHbug7idRMmzWeJ7HKa8jMm1NEDaUr-P2cpSA_M-Ug&dib_tag=se&keywords=basketball&qid=1734735620&sprefix=basketball%2Caps%2C233&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1",
    };
    setCartItems([...cartItems, newItem]);
  };

  const handleClear = () => {
    setCartItems([]);
  };

  const handleRemoveItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedCart = cartItems.map((item, i) =>
      i === index ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
  };
  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartContent}>
        <p className={styles.cartTitle}>Cart</p>
        <ul className={styles.cartList}>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <li className={styles.cartItem} key={index}>
                <input type="checkbox" />
                <a
                  href={item.supplier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cartLink}
                >
                  {item.name}
                </a>
                <select
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(index, parseInt(e.target.value, 10))
                  }
                  className={styles.cartSelect}
                >
                  {[1, 2, 3, 4, 5].map((qty) => (
                    <option key={qty} value={qty}>
                      {qty}
                    </option>
                  ))}
                </select>
                <p className={styles.cartPrice}>
                  £{(item.quantity * item.pricePerUnit).toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className={styles.cartButton}
                >
                  X
                </button>
              </li>
            ))
          ) : (
            <li>Your cart is empty</li>
          )}
        </ul>
        <div className={styles.totalCost}>Total: £{totalCost.toFixed(2)}</div>
      </div>

      <div className={styles.buttonsContainer}>
        <button
          onClick={handleAddToCart}
          className={`${styles.button} ${styles.addButton}`}
        >
          Add to Cart
        </button>
        <button
          onClick={() => handleBuy()}
          className={`${styles.button} ${styles.buyButton}`}
        >
          Buy
        </button>
        <button
          onClick={handleClear}
          className={`${styles.button} ${styles.clearButton}`}
        >
          Clear
        </button>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Cart Name"
            value={cartName}
            onChange={(e) => setCartName(e.target.value)}
            className={styles.input}
          />
          <button
            onClick={() => handleSaveCart(cartName)}
            className={styles.saveButton}
          >
            Save
          </button>
        </div>
        {/* Other input and buttons for Load and Delete */}
      </div>
    </div>
  );
}

export default Cart;

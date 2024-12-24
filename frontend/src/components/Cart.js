import React, { useState, useEffect } from 'react';

function Cart({username}) {
    const [cartItems, setCartItems] = useState([]); // Cart content stored here
    const [cartName, setCartName] = useState('');
    const [loadCartName, setLoadCartName] = useState('');
    const [deleteCartName, setDeleteCartName] = useState('');
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
        console.log("Saving cart", cartName)
        try {
            const response = await fetch('http://localhost:5000/save_cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({"username": username, "cart_content": cartItems, "cart_name": cartName}),
            });
      
            const result = await response.json();
            console.log('Response from backend:', result);
          } catch (error) {
            console.error('Error sending data:', error);
          }
    }

    const handleLoadCart = async (loadCartName) => {
        console.log("Loading cart", loadCartName)
        try {
            const response = await fetch('http://localhost:5000/load_cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({"username": username, "cart_name": loadCartName}),
            });
      
            const result = await response.json();
            console.log(result)
            if (result['response'] !== "failed") {
                const cartKey = Object.keys(result['response'])[0];
                const cartContents = result['response'][cartKey];
                console.log("cartContents: ", cartContents)
                handleClear();
                cartContents.forEach((item) => {
                    setCartItems((prevItems) => [...prevItems, item]);
                });
                // IMPROVEMENT: change cart title to the cart name
            } else {
                console.log('Response from backend:', result);
            }
          } catch (error) {
            console.error('Error sending data:', error);
          }
    }

    const handleDeleteCart = async (DeleteCartName) => {
        console.log("Deleting cart", DeleteCartName)
        try {
            const response = await fetch('http://localhost:5000/delete_cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({"username": username, "cart_name": DeleteCartName}),
            });
      
            const result = await response.json();
            console.log('Response from backend:', result);
          } catch (error) {
            console.error('Error sending data:', error);
          }
    }
  
    const handleAddToCart = () => {
        // change this to the item you actually clicked on the add
        const newItem = {
            name: `Basketball`,
            quantity: 1,
            pricePerUnit: 10,
            supplier: "https://www.amazon.co.uk/AmazonBasics-PU-Composite-Basketball-Official/dp/B07VL3NHMY/ref=sr_1_1_ffob_sspa?crid=2J2L2AEEMRLQO&dib=eyJ2IjoiMSJ9.vWaA-4h7T7hycBHPmi8jOGp1hDHrXzgk8RCVnbvdRE2WfU6nse6T_ID9LS1gdKzQiQY6kRA2b_uLfEIqgZzJCPoEXgkpgF7R6oifnYh-ikVSszo58ouszZFWPFlOYKFfFdcI0cEKzPZAvJv5tf-APHV0bGRr6SPQh4xSWXtfuOAYpiI-qEr-Han-xYf09TBpJOWhgdFbpued4G7SSICg-i3-KzsCI5DFL0uzE-OXakC36YuylIN69QZApCqBAoZZvwvP_Dp6OA9rJOAF7MX68cjDURFmq1LqI6H4yISlMKs.hAHbug7idRMmzWeJ7HKa8jMm1NEDaUr-P2cpSA_M-Ug&dib_tag=se&keywords=basketball&qid=1734735620&sprefix=basketball%2Caps%2C233&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
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
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          width: '550px',
          height: '300px',
          display: 'flex',
          flexDirection: 'row', // Align cart and buttons side by side
        }}
      >
        {/* Cart Content */}
        <div
          style={{
            width: '60%',
            marginRight: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            color: 'black',
          }}
        >
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>Cart</p>
          <ul
            style={{
                listStyleType: 'none',
                padding: 0,
                margin: 0,
                maxHeight: '200px',
                overflowY: 'auto',
            }}
            >
            {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                <li
                    key={index}
                    style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    fontSize: '14px',
                    borderBottom: index !== cartItems.length - 1 ? '1px solid #eee' : 'none',
                    }}
                >
                    <input
                    type="checkbox"
                    style={{ marginRight: '10px' }}
                    />
                    {/* Clickable name that opens the supplier link */}
                    <a
                    href={item.supplier}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        textDecoration: 'none',
                        color: '#007BFF', // Blue text for link
                        cursor: 'pointer',
                    }}
                    >
                    {item.name}
                    </a>
                    <select
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                    style={{
                        marginLeft: '10px',
                        marginRight: '10px',
                        borderRadius: '5px',
                        padding: '5px',
                    }}
                    >
                    {[1, 2, 3, 4, 5].map((qty) => (
                        <option key={qty} value={qty}>
                        {qty}
                        </option>
                    ))}
                    </select>
                    <p
                    style={{
                        marginLeft: '10px',
                        marginRight: '10px',
                        fontSize: '14px',
                        color: '#333',
                    }}
                    >
                    £{(item.quantity * item.pricePerUnit).toFixed(2)}
                        </p>
                    <button
                    onClick={() => handleRemoveItem(index)}
                    style={{
                        padding: '5px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                    }}
                    >
                    X
                    </button>
                </li>
                ))
            ) : (
                <li style={{ fontSize: '14px', color: '#666' }}>Your cart is empty</li>
            )}
            </ul>
            {/* Total Cart Cost */}
            <div
            style={{
                textAlign: 'right',
                marginTop: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
            }}
            >
            Total: £{totalCost.toFixed(2)}
            </div>
        </div>
  
        {/* Buttons and Inputs */}
        <div style={{ width: '40%' }}>
          <button
            onClick={handleAddToCart}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '5px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              marginBottom: '10px',
              width: '100%',
            }}
          >
            Add to Cart
          </button>
          <button
            onClick={() => handleBuy()}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '5px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              marginBottom: '10px',
              width: '100%',
            }}
          >
            Buy
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '5px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              marginBottom: '10px',
              width: '100%',
            }}
          >
            Clear
          </button>
  
          {/* Save Cart Input */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <input
              type="text"
              placeholder="Cart Name"
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
              style={{
                padding: '8px',
                fontSize: '14px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                flex: 1,
                marginRight: '10px',
                width: '50%',
              }}
            />
            <button
              onClick={() => handleSaveCart(cartName)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
              }}
            >
              Save
            </button>
          </div>
  
          {/* Load Cart Input */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Load Cart"
              value={loadCartName}
              onChange={(e) => setLoadCartName(e.target.value)}
              style={{
                padding: '8px',
                fontSize: '14px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                flex: 1,
                marginRight: '10px',
                width: '50%',
              }}
            />
            <button
              onClick={() => handleLoadCart(loadCartName)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
              }}
            >
              Load
            </button>
          </div>
          {/* Delete Cart Input */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '11px'
            }}
          >
            <input
              type="text"
              placeholder="Delete Cart"
              value={deleteCartName}
              onChange={(e) => setDeleteCartName(e.target.value)}
              style={{
                padding: '8px',
                fontSize: '14px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                flex: 1,
                marginRight: '10px',
                width: '50%',
              }}
            />
            <button
              onClick={() => handleDeleteCart(deleteCartName)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                width: "55px"
              }}
            >
              Del
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default Cart;
  
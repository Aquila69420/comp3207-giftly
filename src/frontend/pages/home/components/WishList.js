import React, { useState } from 'react';

function WishList({ username }) {
  const [responseMessage, setResponseMessage] = useState('');

  // Function to handle fetching the wishlist
  const fetchWishlist = async () => {
    try {
      const response = await fetch('http://localhost:5000/wishlist_get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      console.log(`Wishlist fetched: ${JSON.stringify(data)}`);
      setResponseMessage(`Wishlist fetched: ${JSON.stringify(data)}`);
    } catch (error) {
      console.log(`Error fetching Wishlist`);
      setResponseMessage(`Error fetching wishlist: ${error.message}`);
    }
  };

  // Function to handle updating the wishlist
  const updateWishlist = async () => {
    // NOTE: this is where the selected gift will. It will require the following information in identical structure
    const gift = {
        'name':"Basketball",
        'data': {
            "supplier": "link2",
            "cost": 30,
            "added_on": "21-12-2024"
            }
    }
    try {
      const response = await fetch('http://localhost:5000/wishlist_update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"username": username, "gift": gift}),
      });

      const data = await response.json();
      console.log(`Gift added to wishlist: ${JSON.stringify(data)}`);
      setResponseMessage(`Wishlist updated: ${JSON.stringify(data)}`);
    } catch (error) {
      console.log(`Error adding gift to Wishlist`);
      setResponseMessage(`Error adding gift to wishlist: ${error.message}`);
    }
  };

  const removeWishList = async () => {
    // NOTE: this is where the selected gift will. It will require the following information in identical structure
    const gift = {
        'name':"Basketball",
        'data': {
            "supplier": "link2",
            "cost": 30,
        }
    }
    try {
        const response = await fetch('http://localhost:5000/wishlist_remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"username": username, "gift": gift}),
        });
  
        const data = await response.json();
        console.log(`Gift removed from wishlist: ${JSON.stringify(data)}`);
        setResponseMessage(`Wishlist updated: ${JSON.stringify(data)}`);
      } catch (error) {
        console.log(`Error removing gift from Wishlist`);
        setResponseMessage(`Error removing gift from wishlist: ${error.message}`);
      }
  };

  return (
    <div
        style={{
            position: 'absolute',
            bottom: '10px', // Position at the bottom-left corner
            left: '10px',
            padding: '15px',
            backgroundColor: '#f9f9f9', // Light background for contrast
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            width: '150px', // Limit the width
        }}
    >
        <button
            onClick={fetchWishlist}
            style={{
                padding: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                marginBottom: '10px',
                width: '100%', // Full width for a uniform look
            }}
        >
            Fetch Wishlist
        </button>
        <button
            onClick={updateWishlist}
            style={{
                padding: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                marginBottom: '10px',
                width: '100%',
            }}
        >
            Add Gift
        </button>
        <button
            onClick={removeWishList}
            style={{
                padding: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
                backgroundColor: '#F44336',
                color: 'white',
                border: 'none',
                width: '100%',
            }}
        >
            Remove Gift
        </button>
        {responseMessage && (
            <p
                style={{
                    marginTop: '10px',
                    fontSize: '12px',
                    color: '#333', // Dark color for visibility
                    wordWrap: 'break-word',
                }}
            >
                {responseMessage}
            </p>
        )}
    </div>
);


}

export default WishList;
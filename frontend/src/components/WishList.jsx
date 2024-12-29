import React, { useState } from 'react';
import config from '../config';

function WishList({ username }) {
  const [responseMessage, setResponseMessage] = useState('');

  // Function to handle fetching the wishlist
  const fetchWishlist = async () => {
    try {
      const response = await fetch(`${config.backendURL}/wishlist_get`, {
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
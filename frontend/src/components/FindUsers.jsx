import React, { useState } from 'react';
import config from '../config';

function FindUsers() {
  const [usernameToFind, setUsernameToFind] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalSuggestion, setFinalSuggestions] = useState([]);
  let isMatch = finalSuggestion.includes(usernameToFind);

  const getWishList = async (username) => {
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
    } catch (error) {
      console.log(`Error fetching Wishlist`);
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]); // Clear suggestions if input is empty
      setFinalSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${config.backendURL}/find_user_autocomplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      setSuggestions(result.usernames || []); // Assume API returns { usernames: [] }
      setFinalSuggestions(result.usernames || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUsernameToFind(value);
    debouncedFetchSuggestions(value);
  };

  const handleSuggestionClick = (username) => {
    setUsernameToFind(username);
    setSuggestions([]); // Clear suggestions on selection
  };  

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        width: '250px',
      }}
    >
      <input
        type="text"
        placeholder="Type username"
        value={usernameToFind}
        onChange={handleInputChange}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '93%',
        }}
      />
      {isLoading && <p style={{ fontSize: '14px', color: '#666' }}>Loading...</p>}
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyleType: 'none',
            padding: 0,
            margin: 0,
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#fff',
            maxHeight: '150px',
            overflowY: 'auto',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {suggestions.map((username, index) => (
            <li
              key={index}
              style={{
                padding: '8px',
                cursor: 'pointer',
                color: '#333',
                fontSize: '14px',
                borderBottom: index !== suggestions.length - 1 ? '1px solid #eee' : 'none',
                backgroundColor: '#fff',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
              onClick={() => {
                handleSuggestionClick(username);
              }}
            >
              {username}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => getWishList(usernameToFind)}
        disabled={!isMatch} // Disable if there is no exact match
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: isMatch ? 'pointer' : 'not-allowed', // Show "not-allowed" cursor if disabled
          borderRadius: '5px',
          backgroundColor: isMatch ? '#4CAF50' : '#ccc', // Gray out the button if disabled
          color: 'white',
          border: 'none',
          marginTop: '10px',
          width: '100%',
        }}
      >
        Find User
      </button>
    </div>
  );
}

export default FindUsers;

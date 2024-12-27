import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HashLoader from 'react-spinners/HashLoader';
import styles from '../styles/hashLoader.module.css';

function TextInput({username}) {
  const [prompt, setInputValue] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // TODO: Work from here for receiving the response from the backend about fetched products from vendors
    // Retrieve the input data from the backend, and redirect the user to the search results page
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/product_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username,prompt}),
      });

      const result = await response.json();
      console.log('Response from backend:', result);
      navigate('/search', {state: {data: result, username}});
      setLoading(false);
    } catch (error) {
      console.error('Error sending input data:', error);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
      <div className={styles.overlay}>
        <HashLoader color="#08caa5" loading={loading} size={150} />
      </div>
      ) : (
        <div
          style={{
            fontSize: '24px',
            color: '#4CAF50',
          }}
        >
          Searching products from vendors
        </div>
      )}
      <input
        type="text"
        placeholder="Enter something..."
        value={prompt}
        onChange={(e) => setInputValue(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '5px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
        }}
      >
        Submit
      </button>
    </div>
  );
}

export default TextInput;

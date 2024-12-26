import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TextInput({username}) {
  const [prompt, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // TODO: Work from here for receiving the response from the backend about fetched products from vendors
    // Retrieve the input data from the backend, and redirect the user to the search results page
    try {
      const response = await fetch('http://localhost:7071/product_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username,prompt}),
      });

      const result = await response.json();
      console.log('Response from backend:', result);
      navigate('/search');
    } catch (error) {
      console.error('Error sending input data:', error);
    }
  };

  return (
    <div>
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

import React, { useState } from 'react';

function TextInput() {
  const [prompt, setInputValue] = useState('');

  const handleSubmit = async () => {
    const username = localStorage.getItem("username")
    try {
      const response = await fetch('http://localhost:5000/product_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username,prompt}),
      });

      const result = await response.json();
      console.log('Response from backend:', result);
    } catch (error) {
      console.error('Error sending input data:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="I am looking for ..."
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

import './/styling/App.css';
import React, { useState } from 'react';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Function to send input data to the backend
  const sendInputData = async () => {
    console.log('Submitted value:', inputValue);

    try {
      const response = await fetch('http://localhost:5000/product_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputValue }),
      });

      const result = await response.json();
      console.log('Response from backend:', result);
    } catch (error) {
      console.error('Error sending input data:', error);
    }
  };

  // Function to upload an image file
  const uploadImage = async () => {
    if (!selectedFile) {
      alert('Please select an image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/product_img', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Response from backend:', result);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div>
      <header className="App-header">
        <p>Gifto</p>

        {/* Input Text Box */}
        <input
          type="text"
          placeholder="Enter something..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '16px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />

        {/* Submit Input Data Button */}
        <button
          onClick={sendInputData}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '5px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            marginBottom: '20px',
          }}
        >
          Submit
        </button>

        {/* File Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{ marginBottom: '10px' }}
        />

        {/* Upload Image Button */}
        <button
          onClick={uploadImage}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '5px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
          }}
        >
          Upload Image
        </button>
      </header>
    </div>
  );
}

export default App;

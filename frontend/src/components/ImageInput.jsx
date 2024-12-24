import React, { useState } from 'react';

function ImageInput({username}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image to upload.');
      return;
    }
  
    // File Type Validation
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp', 'image/ico', 'image/tiff'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('File type not allowed. Allowed types: PNG, JPG, JPEG, GIF, BMP, WEBP, ICO, TIFF.');
      return;
    }
  
    // File Size Validation (< 20MB)
    const maxSizeMB = 20;
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Maximum allowed size is ${maxSizeMB} MB.`);
      return;
    }
  
    // Image Dimensions Validation
    const img = new Image();
    img.src = URL.createObjectURL(selectedFile);
    img.onload = async () => {
      const { width, height } = img;
  
      if (width < 50 || height < 50 || width > 16000 || height > 16000) {
        alert('Image dimensions must be between 50x50 and 16000x16000 pixels.');
        return;
      }
  
      // File Passed Validation - Proceed with Upload
      const formData = new FormData();
      formData.append('image', selectedFile);
  
      try {
        const response = await fetch('http://localhost:5000/product_img', {
          method: 'POST',
          body: {
            "username": username,
            "img_data":formData
          }
        });
  
        const result = await response.json();
        console.log('Response from backend:', result);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };
  
    img.onerror = () => {
      alert('Invalid image file. Please upload a valid image.');
    };
  };
  

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        style={{ marginBottom: '10px' }}
      />
      <button
        onClick={handleUpload}
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
    </div>
  );
}

export default ImageInput;

import React, { useState, useRef } from "react";
import styles from "../styles/textInput.module.css"; // Import the CSS module
import { CgAttachment } from "react-icons/cg";
import { BsSoundwave } from "react-icons/bs";
import { FaArrowUp } from "react-icons/fa";

function TextInput() {
  const [prompt, setInputValue] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      alert("Please select an image to upload.");
      return;
    }

    // File Type Validation
    const allowedTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/ico",
      "image/tiff",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert(
        "File type not allowed. Allowed types: PNG, JPG, JPEG, GIF, BMP, WEBP, ICO, TIFF."
      );
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
        alert("Image dimensions must be between 50x50 and 16000x16000 pixels.");
        return;
      }

      // File Passed Validation - Proceed with Upload
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        const username = localStorage.getItem("username");
        const response = await fetch("http://localhost:5000/product_img", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Response from backend (image):", result);

        // Optionally, you can handle additional logic here, like updating the UI
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };

    img.onerror = () => {
      alert("Invalid image file. Please upload a valid image.");
    };
  };

  const handleSubmit = async () => {
    const username = localStorage.getItem("username");
    try {
      const response = await fetch("http://localhost:5000/product_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, prompt }),
      });

      const result = await response.json();
      console.log("Response from backend (text):", result);
    } catch (error) {
      console.error('Error sending input data:', error);
    }
  };

  return (
    <div className={styles.TextInputContainer}>
      <div className={styles.inputContainer}>
        <textarea
          placeholder="I am looking for ..."
          value={prompt}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleEnter}
          className={styles.inputField} // Apply styles
        />
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper} onClick={handleFileSelect}>
            <CgAttachment size={20} />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e)} // Trigger file upload on change
          />
          <div
            className={`${styles.iconWrapper} ${styles.iconRight}`}
            onClick={handleCombinedSubmit}
          >
            {prompt.trim() ? <FaArrowUp size={20} /> : <BsSoundwave size={25} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextInput;

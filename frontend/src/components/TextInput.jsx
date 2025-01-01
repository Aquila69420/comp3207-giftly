import React, { useState, useRef } from "react";
import styles from "../styles/textInput.module.css";
import { CgAttachment } from "react-icons/cg";
import { BsSoundwave } from "react-icons/bs";
import { FaArrowUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import InfinityLoader from "./InfinityLoader";
import config from "../config";
import VoiceRecorder from "./VoiceRecorder";

function TextInput() {
  const [prompt, setInputValue] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Ref for the file input element

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input's click event
    }
  };

  const [loading, setLoading] = useState(false);
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

      const username = localStorage.getItem("username");
      formData.append("username", username);

      try {
        const response = await fetch(`${config.backendURL}/product_img`, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        console.log("Image upload result:", result);
        if (result.query === "rec:") {
          alert("Could not identify any objects in the image.");
          return;
        }

        navigate("/search", { state: { data: result, username } });
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
      setLoading(true);
      const response = await fetch(`${config.backendURL}/product_text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, prompt }),
      });

      const result = await response.json();
      navigate("/search", { state: { data: result, username } });
      setLoading(false);
    } catch (error) {
      console.error("Error sending input data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCombinedSubmit = () => {
    if (prompt.trim()) {
      handleSubmit();
    }
    if (fileInputRef.current?.files[0]) {
      const event = { target: { files: [fileInputRef.current.files[0]] } };
      handleFileChange(event);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && prompt) {
      handleCombinedSubmit();
      setInputValue("");
      e.preventDefault();
    }
  };

  // Callback function to update the search bar text
  const updatePromptFromVoice = (transcription) => {
    setInputValue(transcription);
  };

  return (
    <div className={styles.TextInputContainer}>
      {loading && (
        <div className="overlay">
          <InfinityLoader loading={loading} />
        </div>
      )}
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
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z"
                fill="currentColor"
              ></path>
            </svg>
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
            {prompt ? (
              <FaArrowUp size={20} />
            ) : (
              <VoiceRecorder updatePrompt={updatePromptFromVoice} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextInput;

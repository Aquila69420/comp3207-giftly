import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/forgotPassword.module.css";
import config from "../config";

function ForgotPassword() {
  const [forgotEmail, setForgotEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleForgot = async () => {
    try {
      const response = await fetch(`${config.backendURL}/fetch_user_details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        if (result.response.includes("does not")) {
          setMessage("");
          setError(result.response);
        } else {
          setMessage(result.response);
          setError("");
        }
      } else {
        setError(result.response || "An error occurred. Please try again.");
        setMessage("");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      setError(
        "Unable to process the request at the moment. Please try again later."
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1>Forgot Password</h1>
        <p>Enter your email address to reset your password:</p>
        <input
          type="email"
          placeholder="Enter your email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          className={styles.input}
        />
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        <button onClick={handleForgot} className={styles.button}>
          Submit
        </button>
        <button
          onClick={() => navigate("/")}
          className={styles.linkButton}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;

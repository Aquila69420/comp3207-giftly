import React, { useState } from "react";
import styles from "../styles/register.module.css";

function Register() {
  const [usernameRegister, setUsernameRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch("http://localhost:5000/email_verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameRegister,
          code: emailVerificationCode,
        }),
      });
      const result = await response.json();
      console.log("Verification Response:", result);
    } catch (error) {
      console.error("Error during email verification:", error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameRegister,
          password: passwordRegister,
          email: email,
          phone: phone,
          notifications: notifications,
        }),
      });
      const result = await response.json();
      console.log("Register Response:", result);

    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <input
        type="text"
        placeholder="Username"
        value={usernameRegister}
        onChange={(e) => setUsernameRegister(e.target.value)}
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={passwordRegister}
        onChange={(e) => setPasswordRegister(e.target.value)}
        className={styles.input}
      />
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      <input
        type="text"
        placeholder="Phone number (ie: +44 7765xxxxxx)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={styles.input}
      />
      <select
        value={notifications}
        onChange={(e) => setNotifications(e.target.value === "true")}
        className={styles.select}
      >
        <option value="" disabled>
          -- Opt for Notifications --
        </option>
        <option value="false">No</option>
        <option value="true">Yes</option>
      </select>
      <div className={styles.actionContainer}>
        <button
          onClick={() =>
            handleRegister({
              usernameRegister,
              passwordRegister,
              email,
              phone,
              notifications,
            })
          }
          className={styles.buttonPrimary}
        >
          Register
        </button>
        <div className={styles.verificationContainer}>
          <input
            type="text"
            placeholder="Email Verification Code"
            value={emailVerificationCode}
            onChange={(e) => setEmailVerificationCode(e.target.value)}
            className={styles.input}
          />
          <button
            onClick={() =>
              handleVerifyEmail({ usernameRegister, emailVerificationCode })
            }
            className={styles.buttonSecondary}
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;

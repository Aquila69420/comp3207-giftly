import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "../styles/register.module.css";
import logo from "../image/giftly_logo_trans.png";
import { useNavigate } from "react-router-dom";
import config from "../config";

function Register() {
  const [registered, setRegistered] = useState(false);

  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false); // State to track registration completion

  useEffect(() => {
    if (localStorage.getItem("username")) {
      navigate("/home");
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      email: "",
      phone: "",
      notifications: "",
      emailVerificationCode: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .required("Username is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phone: Yup.string()
        .matches(
          /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/,
          "Phone number must be in the format 07765xxxxxx"
        )
        .required("Phone number is required"),
      notifications: Yup.string()
        .oneOf(["true", "false"], "Please select a notification preference")
        .required("Notification preference is required"),
      emailVerificationCode: Yup.string().optional(),
    }),
    onSubmit: async (values) => {
      try {
        setRegistered(true);
        const response = await fetch(`${config.backendURL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: values.username,
            password: values.password,
            email: values.email,
            phone: values.phone,
            notifications: values.notifications === "true",
          }),
        });
        const result = await response.json();
        console.log("Register Response:", result);
        if (result.success) {
          setIsRegistered(true); // Indicate registration is complete
        }
      } catch (error) {
        console.error("Error during registration:", error);
      }
    },
  });

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`${config.backendURL}/email_verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formik.values.username,
          code: formik.values.emailVerificationCode,
        }),
      });
      const result = await response.json();
      console.log("Verification Response:", result);
      if (result.response === "Verification successful.") {
        navigate("/");
      } else {
        console.log("Verification failed");
      }
    } catch (error) {
      console.error("Error during email verification:", error);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <img src={logo} alt="logo" width={200} className={styles.logo} />
      {registered ? (
        <div className={styles.box}>
          <div className={styles.iconContainer}>Email Confirmation</div>
          <div>We have sent you an email! with a code<br></br> <br></br>Please type the code in here:</div>
          <div className={styles.actionContainer}>
            <div className={styles.verificationContainer}>
              <input
                type="text"
                name="emailVerificationCode"
                placeholder="Email Verification Code"
                value={formik.values.emailVerificationCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={styles.input}
              />
              <button
                type="button"
                onClick={handleVerifyEmail}
                className={styles.button}
              >
                Verify
              </button>
              {formik.touched.emailVerificationCode &&
              formik.errors.emailVerificationCode ? (
                <div className={styles.error}>
                  {formik.errors.emailVerificationCode}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit} className={styles.box}>
          <div className={styles.iconContainer}>Register</div>
          <div className={styles.inputLabel}>Username</div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={styles.input}
          />
          {formik.touched.username && formik.errors.username ? (
            <div className={styles.error}>{formik.errors.username}</div>
          ) : null}
          <div className={styles.username}>Password</div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={styles.input}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className={styles.error}>{formik.errors.password}</div>
          ) : null}
          <div className={styles.username}>Email</div>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={styles.input}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className={styles.error}>{formik.errors.email}</div>
          ) : null}
          <div className={styles.username}>Phone Number</div>
          <input
            type="text"
            name="phone"
            placeholder="Phone number (ie: +44 7765xxxxxx)"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={styles.input}
          />
          {formik.touched.phone && formik.errors.phone ? (
            <div className={styles.error}>{formik.errors.phone}</div>
          ) : null}
          <select
            name="notifications"
            value={formik.values.notifications}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={styles.select}
          >
            <option value="" disabled>
              -- Opt for Notifications --
            </option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
          {formik.touched.notifications && formik.errors.notifications ? (
            <div className={styles.error}>{formik.errors.notifications}</div>
          ) : null}
          <button type="submit" className={styles.buttonPrimary}>
            Register
          </button>
        </form>
      )}
    </div>
  );
}

export default Register;

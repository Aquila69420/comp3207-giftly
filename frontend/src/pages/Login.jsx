import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import styles from "../styles/login.module.css";
import { useNavigate } from "react-router-dom";
import Features from "../components/Features";
import config from "../config";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function Login() {
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("username")) {
      navigate("/home");
    }
  }, []);

  const handleLogin = async (values) => {
    console.log("Logging in with:", values);
    try {
      const response = await fetch(`${config.backendURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (result.response === "User successfully logged in.") {
        const response = await fetch(`${config.backendURL}/get_user_id`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: values.username }),
        });
        const data = await response.json();
        if (!data.result) {
          setLoginError(data.msg);
          return;
        }
        localStorage.setItem("username", values.username);
        localStorage.setItem("userID", data.userID);
        if (!sessionStorage.getItem("cart")) {
          sessionStorage.setItem("cart", JSON.stringify([]));
        }
        if (!sessionStorage.getItem("sessionId")) {
          const sessionId = Math.random().toString(36).substring(2);
          sessionStorage.setItem("sessionId", JSON.stringify(sessionId));
        }
        setLoginError("");
        console.log("Login successful!");
        navigate("/home");
      } else {
        setLoginError(result.response);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("An error occurred. Please try again.");
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    console.log("Google login response:", response);
    try {
      const res = await fetch("http://localhost:5000/google/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      
      console.log("Response from backend:", res);
      const data = await res.json();
      
      if (data.user) {
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("userID", data.user.id);
        window.location.href = "/home";
      } else {
        console.error("Error from backend:", data.error);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };
  

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  return (
    <GoogleOAuthProvider clientId="743246536728-cs1j2jj5lq69gba5ah4o9hs8pgusll2p.apps.googleusercontent.com">
      <div className={styles.container}>
        <div className={styles.maxWidth}>
          <div>
            <Features />
          </div>
          <div className={styles.box}>
            <div className={styles.signIn}>Sign In</div>
            <Formik
              initialValues={{ username: "", password: "" }}
              onSubmit={handleLogin}
              validationSchema={validationSchema}
            >
              <Form className={styles.form}>
                <div className={styles.username}>Username</div>
                <Field
                  name="username"
                  placeholder="Username"
                  className={styles.input}
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className={styles.error}
                />
                <div className={styles.passwordBox}>
                  <div>Password</div>
                  <Link to={"/forgot-password"}>
                    <div className={styles.forgotPassword}>Forgot Password?</div>
                  </Link>
                </div>
                <Field
                  name="password"
                  type="password"
                  placeholder="Password"
                  className={styles.input}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className={styles.error}
                />
                {loginError && <div className={styles.error}>{loginError}</div>}
                <button type="submit" className={styles.button}>
                  Login
                </button>
                <div className={styles.center}>
                  <div>Don't have an account?</div>{" "}
                  <div className={styles.registerText}>
                    <Link to={"/register"}>Register</Link>
                  </div>
                </div>
              </Form>
            </Formik>
            <div className={styles.googleSignIn}>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => setLoginError("Google login failed. Please try again.")}
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;

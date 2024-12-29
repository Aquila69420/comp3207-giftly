import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import styles from "../styles/login.module.css";
import { useNavigate } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";
import Features from "../components/Features";
import config from "../config";

function Login() {
  const [loginError, setLoginError] = useState("");
  const nagivate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("username")) {
      nagivate("/");
    }
  }, []);

  const handleLogin = async (values) => {
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
        localStorage.setItem("username", values.username);
        if (!sessionStorage.getItem("cart")) {
          sessionStorage.setItem("cart", JSON.stringify([]));
        }
        if (!sessionStorage.getItem("sessionId")) {
          const sessionId = Math.random().toString(36).substring(2);
          sessionStorage.setItem("sessionId", JSON.stringify(sessionId));
        }
        setLoginError("");
        console.log("Login successful!");
        nagivate("/");
      } else {
        setLoginError(result.response);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("An error occurred. Please try again.");
    }
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  return (
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
                <Link to="Forgot-Password">
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
              <div className={styles.center}><div>Don't have an account?</div> <div><Link to={"/register"}>Register</Link></div></div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default Login;

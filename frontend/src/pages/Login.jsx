import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import styles from "../styles/login.module.css";
import logo from "../image/giftly_logo_trans.png";
import { MdAccountCircle } from "react-icons/md";

function Login() {
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (values) => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (result.response === "User successfully logged in.") {
        localStorage.setItem("username", values.username);
        const response = await fetch("http://localhost:5000/get_user_id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: values.username }),
        });
        const data = await response.json();
        console.log(data);
        if (data.result) {
          localStorage.setItem("userID", data.userID);
          setLoginError("");
          console.log("Login successful!");
        } else {
          setLoginError(result.msg);
        }
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
      <img src={logo} alt="logo" width={300} />
      <div className={styles.box}>
      <MdAccountCircle size={60}/>
        <Formik
          initialValues={{ username: "", password: "" }}
          onSubmit={handleLogin}
          validationSchema={validationSchema}
        >
          <Form className={styles.form}>
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
          </Form>
        </Formik>
      </div>

      <div className={styles.links}>
        <Link to="/register">Register</Link> |{" "}
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  );
}

export default Login;

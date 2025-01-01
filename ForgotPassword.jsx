import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "../styles/login.module.css";
import { useNavigate } from 'react-router-dom';
import config from "../config";

function ForgotPassword() {
    const navigate = useNavigate();
    const [submitEmailError, setSubmitEmailError] = useState('');
    const [submitOTPError, setSubmitOTPError] = useState('');
    const [changePasswordError, setChangePasswordError] = useState('');
    const [emailConfirmed, setEmailConfirmed] = useState(false);
    const [OTPConfirmed, setOTPConfirmed] = useState(false);
    const [username, setUsername] = useState('');
    const [token, setToken] = useState(0);

    const emailValidationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Email is required"),
    });
    
    const OTPvalidationSchema = Yup.object({
        OTP: Yup.string().required("OTP is required"),
    });

    const passwordValidationSchema = Yup.object({
        password: Yup.string().required("New password is required"),
        confirmPassword: Yup.string().required("Passwords must match").oneOf([Yup.ref("password"), null], "Passwords must match"),
    });

    const handleSubmitEmail = async (values) => {
        const response = await fetch(`${config.backendURL}/fetch_user_details`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: values.email }),
        });
        const result = await response.json();
        setToken(result.token);
        setUsername(result.username);
        if (token !== 0 && username !== "Not found") {
            setEmailConfirmed(true);
        }
        else {
            setSubmitEmailError("Email not found");
            setEmailConfirmed(false);
        }
    };

    const handleSubmitOTP = async (values) => {
        if (values.OTP !== token) {
            setSubmitOTPError("Invalid OTP");
            setOTPConfirmed(false);
            return;
        }
        setOTPConfirmed(true);
    }

    const handleSubmitNewPassword = async (values) => {
        if (values.password === '' || values.confirmPassword === '') {
            setChangePasswordError("Password cannot be empty");
            return;
        }
        else if (values.password !== values.confirmPassword) {
            setChangePasswordError("Passwords do not match");
            return;
        }
        const response = await fetch(`${config.backendURL}/update_user_details`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "username": username, "field": "password", password: values.password }),
        });
        const result = response.json();
        console.log("Password update result:", result);
        navigate("/login");
        
    }

    return (
    <div className={styles.box}>
        {!emailConfirmed ? (
            <Formik
            initialValues={{ email: "" }}
            onSubmit={handleSubmitEmail}
            validationSchema={emailValidationSchema}
            >
                <Form className={styles.form}>
                    <Field
                    name="email"
                    placeholder="Email"
                    className={styles.input}
                    />
                    <ErrorMessage
                    name="email"
                    component="div"
                    className={styles.error}
                    />
                    {submitEmailError && <div className={styles.error}>{submitEmailError}</div>}
                    <button type="submit" className={styles.button}>Send OTP</button>
                </Form>
            </Formik>
        ) : 
            !OTPConfirmed ? (
                <Formik
                initialValues={{ OTP: "" }}
                onSubmit={handleSubmitOTP}
                validationSchema={OTPvalidationSchema}
                >
                    <Form className={styles.form}>
                        <Field
                        name="OTP"
                        placeholder="OTP"
                        className={styles.input}
                        />
                        <ErrorMessage
                        name="OTP"
                        component="div"
                        className={styles.error}
                        />
                        {submitOTPError && <div className={styles.error}>{submitOTPError}</div>}
                        <button type="submit" className={styles.button}>Confirm OTP</button>
                    </Form>
                </Formik>
            ) : (
                <Formik
                initialValues={{ password: "", confirmPassword: "" }}
                onSubmit={handleSubmitNewPassword}
                validationSchema={passwordValidationSchema}
                >
                <Form className={styles.form}>
                    <div className={styles.username}>Enter new password</div>
                    <Field
                    name="password"
                    placeholder="Password"
                    className={styles.input}
                    />
                    <ErrorMessage
                    name="password"
                    component="div"
                    className={styles.error}
                    />
                    <div className={styles.passwordBox}>
                        <div>Confirm new password</div>
                    </div>
                    <Field
                    name="confirmPassword"
                    type="confirmPassword"
                    placeholder="Password"
                    className={styles.input}
                    />
                    <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className={styles.error}
                    />
                    {changePasswordError && <div className={styles.error}>{changePasswordError}</div>}
                    <button type="submit" className={styles.button}>Confirm</button>
                </Form>
            </Formik>
            )}
    </div>
  )
}

export default ForgotPassword;
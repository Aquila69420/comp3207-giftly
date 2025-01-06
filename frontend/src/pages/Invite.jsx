// invite route lands here
// Extract the token from the search params
// use session storage to store the token
// Navigate to register/login page with useNavigate
// Extract the token from the local or session storage at whatever page you are
// After logging in or redirected, if the token is present, navigate to the groups page
import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from '../styles/notFound.module.css';
import logo from "../image/giftly_logo_trans.png";
import config from '../config';

export default function Invite() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [valid, setValid] = useState(true);
    const token = searchParams.get("token") || "";

    const checkTokenValidity = async (token) => {
        const response = await fetch(`${config.backendURL}/groups/invite/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token }),
        });
        const data = await response.json();
        console.log("Group invite token validity:", data.result);
        return data.result;
    };
    
    useEffect(() => {
        const validateToken = async () => {
            if (token) {
                const isValid = await checkTokenValidity(token);
                if (isValid) {
                    setValid(true);
                    sessionStorage.setItem("groupInviteToken", JSON.stringify(token));
                    navigate("/");
                } else {
                    setValid(false);
                }
            }
        };
        validateToken();
    }, [token, navigate]);

    return (
    <div className={styles.container}>
    <img src={logo} alt="logo" width={200} />
        {valid ? (
            <div>
                <h1 className={styles.title}>Invite</h1>
                <p className={styles.message}>You have been invited to join a group. Please login or register to continue</p>
            </div>
        ) : (
            <div>
                <h1 className={styles.title}>Invalid Token</h1>
                <p className={styles.message}>Sorry, the invite token is invalid. Please request the admin of the group you are trying to join to send you another one</p>
            </div>
        )}
    </div>
    )
}

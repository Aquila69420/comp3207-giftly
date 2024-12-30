import React from "react";
import { Navigate } from "react-router-dom";

export default function Protected({ children }) {
  function isAuthenticated() {
    return !!localStorage.getItem("username");
  }
  return (
    <div>{isAuthenticated() ? children : <Navigate to={"/"} />} </div>
  );
}

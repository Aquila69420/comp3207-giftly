import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/App.css";
import OldHome from "./pages/OldHome";
import SearchResults from "./pages/SearchResults";
import Product from "./pages/Product";
import NotFound from "./pages/NotFound";

// TODO: Implement load from back button for pages
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oldhome" element={<OldHome />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product" element={<Product />} />
        <Route path="*" element={<NotFound />} /> {/* 404 route */}
      </Routes>
    </Router>
  );
}

export default App;

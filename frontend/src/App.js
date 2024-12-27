import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/App.css";
import OldHome from "./pages/OldHome";
import SearchResults from "./pages/SearchResults";
import Product from "./pages/Product";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oldhome" element={<OldHome />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product" element={<Product />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

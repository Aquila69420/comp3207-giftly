import React from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchResults from "./pages/SearchResults";
import Product from "./pages/Product";

// add pages here

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/product" element={<Product />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

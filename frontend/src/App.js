import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/App.css";
import OldHome from "./pages/OldHome";
import SearchResults from "./pages/SearchResults";
import Product from "./pages/Product";
import Protected from "./components/Protected";
import NotFound from "./pages/NotFound";
import Cart from "./components/Cart";

// TODO: Implement load from back button for pages
function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/oldhome"
          element={
            <Protected>
              <OldHome />
            </Protected>
          }
        />
        <Route
          path="/search"
          element={
            <Protected>
              <SearchResults />
            </Protected>
          }
        />
        <Route
          path="/product"
          element={
            <Protected>
              <Product />
            </Protected>
          }
        />
        <Route path="*" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<NotFound />} /> {/* 404 route */}
      </Routes>
    </Router>
  );
}

export default App;

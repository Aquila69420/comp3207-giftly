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
import SearchResults from "./pages/SearchResults";
import Product from "./pages/Product";
import Protected from "./components/Protected";
import NotFound from "./pages/NotFound";
import Cart from "./components/Cart";
import AccountSettingPage from "./pages/AccountSettingPage";
import ForgotPassword from "./pages/ForgotPassword";
import Group from "./pages/Groups";
import GroupsSettings from "./pages/GroupsSettings";

// TODO: Implement load from back button for pages
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
        <Route
          path="account-settings"
          element={
            <Protected>
              <AccountSettingPage />
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
        <Route
          path="/cart"
          element={
            <Protected>
              <Cart />
            </Protected>
          }
        />
        <Route
          path="/groups"
          element={
            <Protected>
              <Group />
            </Protected>
          }
        />
        <Route
          path="/groups/settings"
          element={
            <Protected>
              <GroupsSettings />
            </Protected>
          }
        />
        <Route path="*" element={<NotFound />} /> {/* 404 route */}
      </Routes>
    </Router>
  );
}

export default App;

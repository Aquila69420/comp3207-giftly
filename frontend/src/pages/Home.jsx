import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import TextInput from "../components/TextInput";
import styles from "../styles/home.module.css";
import { MdAccountCircle } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import DropdownSelection from "../components/DropdownSelection";
import { FaShoppingBag } from "react-icons/fa";
import { FaGift } from "react-icons/fa6";
import { FaUserFriends } from "react-icons/fa";
import FindUsers from "../components/FindUsers";

function Home() {
  const [username, setUsername] = useState(localStorage.getItem("username")); // Default username
  const [showDropdown, setShowDropdown] = useState(false);
  const [model, setModel] = useState("Product Selection");
  const [showModel, setShowModel] = useState(false);

  const navigate = useNavigate();

  const dropdownContainerRef = useRef(null); // Reference for the dropdown container
  const modelDropdownRef = useRef(null); // Reference for the model dropdown

  const toggleDropdown = () => {
    setShowDropdown((prevState) => {
      if (!prevState) setShowModel(false); // Close model dropdown if opening account dropdown
      return !prevState;
    });
  };

  const showModelDropDown = () => {
    setShowModel((prevState) => {
      if (!prevState) setShowDropdown(false); // Close account dropdown if opening model dropdown
      return !prevState;
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleGroup = () => {
    navigate("/groups");
  };

  const handleSetting = () => {
    navigate("/account-settings");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target) &&
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setShowModel(false);
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Sidebar username={username} />
        <div className={styles.content}>
          <div
            className={styles.modelSelection}
            onClick={showModelDropDown}
            ref={modelDropdownRef} // Reference for model dropdown container
          >
            <div className={styles.modeltext}>{model}</div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.icon}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z"
                fill="currentColor"
              ></path>
            </svg>
            {showModel && (
              <div className={styles.dropdown1}>
                <div className={styles.buttonContainer}>
                  <div
                    className={styles.dropDownButton}
                    onClick={() => setModel("Product Selection")}
                  >
                    <FaShoppingBag size={30} />
                    <div>Product Selection</div>
                  </div>
                  <div
                    className={styles.dropDownButton}
                    onClick={() => setModel("Gift Finder")}
                  >
                    <FaGift size={30} />
                    <div>Gift Finder</div>
                  </div>
                  <div
                    className={styles.dropDownButton}
                    onClick={() => setModel("Friend Wishlist Finder")}
                  >
                    <FaUserFriends size={30} />
                    <div>Friend Wishlist Finder</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conditional Rendering */}
          {model === "Product Selection" ? (
            <>
              <h1 className={styles.header}>
                Giftly is your best shot—because Santa’s got nothing on you!
                🎁🎄
              </h1>
              <TextInput username={username} />
            </>
          ) : model === "Gift Finder" ? (
            <DropdownSelection />
          ) : (
            <div className={styles.content}><FindUsers /></div>
          )}
        </div>
      </div>
      {/* Single container for dropdown icon and menu */}
      <div className={styles.account} ref={dropdownContainerRef}>
        <MdAccountCircle
          size={60}
          onClick={toggleDropdown}
          style={{ cursor: "pointer" }}
        />
        {showDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem}>Username: {username}</div>
            <div className={styles.buttonContainer}>
              <div className={styles.dropDownButton} onClick={handleSetting}>
                <MdManageAccounts size={30} />
                <div>Account Settings</div>
              </div>
              <div className={styles.dropDownButton} onClick={handleGroup}>
                <MdGroups size={30} />
                <div>Groups</div>
              </div>
              <div className={styles.dropDownButton} onClick={handleLogout}>
                <FaSignOutAlt size={30} />
                <div>Sign Out</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

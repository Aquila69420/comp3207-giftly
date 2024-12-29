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
function Home() {
  const [username, setUsername] = useState(localStorage.getItem("username")); // Default username
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  const dropdownContainerRef = useRef(null); // Single reference for the dropdown container

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSetting = () => {
    navigate("/account-settings")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
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
          <h1 className={styles.header}>
            Giftly is your best shot—because Santa’s got nothing on you! 🎁🎄
          </h1>
          <TextInput username={username} />
        </div>
        <DropdownSelection username={username} />
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
              <div className={styles.dropDownButton}>
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

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import TextInput from "../components/TextInput";
import styles from "../styles/home.module.css";
import { MdAccountCircle } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaShoppingBag } from "react-icons/fa";
import { FaGift } from "react-icons/fa6";
import { FaUserFriends } from "react-icons/fa";
import FindUsers from "../components/FindUsers";
import styles1 from "../styles/dropdownselection.module.css";
import config from "../config";

function Home() {
  const location = useLocation();
  const [username, setUsername] = useState(localStorage.getItem("username")); // Default username
  const [showDropdown, setShowDropdown] = useState(false);
  const [model, setModel] = useState("Gift Finder");
  const [showModel, setShowModel] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [priceRange, setPriceRange] = useState(50);
  const [selectedThemes, setSelectedThemes] = useState([]);

  const occasionOptions = [
    "Birthday",
    "Anniversary",
    "Graduation",
    "Promotion",
    "Farewell",
    "Engagement",
    "Wedding",
    "Christmas",
    "Valentine's Day",
    "Housewarming",
    "Baby Shower",
    "Corporate Party",
    "Mother's Day",
    "Father's Day",
    "Spontaneous",
    "Apology",
  ];

  const recipientOptions = [
    "Friend",
    "Colleague",
    "Girlfriend",
    "Boyfriend",
    "Sister",
    "Brother",
    "Mother",
    "Father",
    "Grandmother",
    "Grandfather",
    "Cousin",
    "Aunt",
    "Uncle",
    "Wife",
    "Husband",
    "Son",
    "Daughter",
  ];

  const themeOptions = [
    "Romantic",
    "Funny",
    "Practical",
    "Luxury",
    "Memory",
    "Game",
    "Learning",
    "Fun",
    "Health",
    "Artistic",
    "Tech",
    "Outdoors",
    "Sports",
    "Clothes",
    "Toys",
    "Accessories",
    "Sustainable",
    "Decoration",
    "Body Products",
  ];

  const handleCheckboxChange = (setState, selectedValues, value) => {
    setState((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    const data = {
      Username: localStorage.getItem("username"),
      Occasions: selectedOccasions.join(", "),
      Recipient: selectedRecipient,
      Price: priceRange,
      Themes: selectedThemes.join(", "),
    };
    try {
      const response = await fetch(`${config.backendURL}/product_types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setModel("Gift Finder");
      setPrompt(result.response.slice(4));
      console.log("Response from backend:", result);
    } catch (error) {
      console.error("Error sending input data:", error);
    }
  };

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
                    onClick={() => setModel("Gift Finder")}
                  >
                    <FaShoppingBag size={30} />
                    <div>Gift Finder</div>
                  </div>
                  <div
                    className={styles.dropDownButton}
                    onClick={() => setModel("Gift Recommender ")}
                  >
                    <FaGift size={30} />
                    <div>Gift Recommender </div>
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
          {model === "Gift Finder" ? (
            <>
              <h1 className={styles.header}>
                Giftly is your best shot—because Santa’s got nothing on you!
                🎁🎄
              </h1>
              <TextInput
                username={username}
                prompt={prompt}
                setPrompt={setPrompt}
              />
            </>
          ) : model === "Gift Recommender " ? (
            <div className={styles1.container}>
              <h2 className={styles1.title}>Gift Recommender </h2>

              {/* Occasions Section */}
              <div className={styles1.section}>
                <label className={styles1.label}>Select Occasion(s):</label>
                <div className={styles1.checkboxContainer}>
                  {occasionOptions.map((occasion) => (
                    <label key={occasion} className={styles1.checkboxLabel}>
                      <input
                        type="checkbox"
                        value={occasion}
                        onChange={() =>
                          handleCheckboxChange(
                            setSelectedOccasions,
                            selectedOccasions,
                            occasion
                          )
                        }
                        checked={selectedOccasions.includes(occasion)}
                        className={styles1.checkboxInput}
                      />
                      {occasion}
                    </label>
                  ))}
                </div>
              </div>

              {/* Recipient Section */}
              <div className={styles1.section}>
                <label className={styles1.label}>Select Recipient:</label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className={styles1.selectInput}
                >
                  <option value="" disabled>
                    -- Select Recipient --
                  </option>
                  {recipientOptions.map((recipient) => (
                    <option key={recipient} value={recipient}>
                      {recipient}
                    </option>
                  ))}
                </select>
              </div>

              {/* Themes Section */}
              <div className={styles1.section}>
                <label className={styles1.label}>Select Theme(s):</label>
                <div className={styles1.checkboxContainer}>
                  {themeOptions.map((theme) => (
                    <label key={theme} className={styles1.checkboxLabel}>
                      <input
                        type="checkbox"
                        value={theme}
                        onChange={() =>
                          handleCheckboxChange(
                            setSelectedThemes,
                            selectedThemes,
                            theme
                          )
                        }
                        checked={selectedThemes.includes(theme)}
                        className={styles1.checkboxInput}
                      />
                      {theme}
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button onClick={handleSubmit} className={styles1.button}>
                Find
              </button>
            </div>
          ) : (
            <div className={styles.content}>
              <FindUsers />
            </div>
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

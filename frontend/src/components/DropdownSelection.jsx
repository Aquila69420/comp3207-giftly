import React, { useState } from "react";
import config from "../config";
import styles from "../styles/dropdownselection.module.css";

function DropdownSelection() {
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
      console.log("Response from backend:", result);
    } catch (error) {
      console.error("Error sending input data:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gift Finder</h2>

      {/* Occasions Section */}
      <div className={styles.section}>
        <label className={styles.label}>Select Occasion(s):</label>
        <div className={styles.checkboxContainer}>
          {occasionOptions.map((occasion) => (
            <label key={occasion} className={styles.checkboxLabel}>
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
                className={styles.checkboxInput}
              />
              {occasion}
            </label>
          ))}
        </div>
      </div>

      {/* Recipient Section */}
      <div className={styles.section}>
        <label className={styles.label}>Select Recipient:</label>
        <select
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          className={styles.selectInput}
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
      <div className={styles.section}>
        <label className={styles.label}>Select Theme(s):</label>
        <div className={styles.checkboxContainer}>
          {themeOptions.map((theme) => (
            <label key={theme} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                value={theme}
                onChange={() =>
                  handleCheckboxChange(setSelectedThemes, selectedThemes, theme)
                }
                checked={selectedThemes.includes(theme)}
                className={styles.checkboxInput}
              />
              {theme}
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit} className={styles.button}>
        Find
      </button>
    </div>
  );
}

export default DropdownSelection;

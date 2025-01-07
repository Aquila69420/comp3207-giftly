import React, { useState } from "react";
import Flag from "react-world-flags";

const LanguagePicker = ({ onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const languages = [
    { code: "nl", label: "Dutch", flag: "NL" },
    { code: "en", label: "English", flag: "GB" },
    { code: "fr", label: "French", flag: "FR" },
    { code: "hi", label: "Hindi", flag: "IN" },
    { code: "it", label: "Italian", flag: "IT" },
    { code: "ja", label: "Japanese", flag: "JP" },
    { code: "ko", label: "Korean", flag: "KR" },
    { code: "pt", label: "Portuguese", flag: "PT" },
    { code: "ru", label: "Russian", flag: "RU" },
    { code: "es", label: "Spanish", flag: "ES" },
    { code: "tr", label: "Turkish", flag: "TR" },
  ];

  const defaultLanguageCode = localStorage.getItem("language") || "en";

  const defaultLanguage = useState(
    languages.find((lang) => lang.code === defaultLanguageCode) || languages[0]
  )
  const [selectedLanguage, setSelectedLanguage] = useState({
    code: defaultLanguage[0].code,
    label: defaultLanguage[0].label,
    flag: defaultLanguage[0].flag,
  });

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    if (onLanguageChange) {
      localStorage.setItem("language", language.code);  
      onLanguageChange(language.code);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        textAlign: "left",
      }}
    >
      {/* Selected Language */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          padding: "0.3rem 0.5rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "white",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "auto", // Dynamic width based on content
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Flag
          code={selectedLanguage.flag}
          style={{
            width: "16px",
            height: "12px",
            marginRight: "0.5rem",
          }}
        />
        <span style={{ fontSize: "0.9rem" }}>{selectedLanguage.code.toUpperCase()}</span>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "white",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
            maxHeight: "300px",
            overflowY: "auto",
            width: "150px", // Fixed width for dropdown list
          }}
        >
          {languages.map((language) => (
            <div
              key={language.code}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.3rem",
                cursor: "pointer",
                backgroundColor:
                  selectedLanguage.code === language.code ? "#f0f0f0" : "white",
              }}
              onClick={() => handleLanguageChange(language)}
            >
              <Flag
                code={language.flag}
                style={{
                  width: "16px",
                  height: "12px",
                  marginRight: "0.5rem",
                }}
              />
              <span style={{ fontSize: "0.9rem" }}>{language.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguagePicker;

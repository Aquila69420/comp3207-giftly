import React, { useState } from "react";
import Flag from "react-world-flags";

const LanguagePicker = ({ onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({
    code: "en",
    label: "English",
    flag: "GB",
  });

  const languages = [
    { code: "af", label: "Afrikaans", flag: "ZA" },
    { code: "sq", label: "Albanian", flag: "AL" },
    { code: "am", label: "Amharic", flag: "ET" },
    { code: "ar", label: "Arabic", flag: "SA" },
    { code: "az", label: "Azerbaijani", flag: "AZ" },
    { code: "bn", label: "Bengali", flag: "BD" },
    { code: "bs", label: "Bosnian", flag: "BA" },
    { code: "bg", label: "Bulgarian", flag: "BG" },
    { code: "zh", label: "Chinese (Simplified)", flag: "CN" },
    { code: "zh-TW", label: "Chinese (Traditional)", flag: "TW" },
    { code: "hr", label: "Croatian", flag: "HR" },
    { code: "cs", label: "Czech", flag: "CZ" },
    { code: "da", label: "Danish", flag: "DK" },
    { code: "fa-AF", label: "Dari", flag: "AF" },
    { code: "nl", label: "Dutch", flag: "NL" },
    { code: "en", label: "English", flag: "GB" },
    { code: "et", label: "Estonian", flag: "EE" },
    { code: "fi", label: "Finnish", flag: "FI" },
    { code: "fr", label: "French", flag: "FR" },
    { code: "fr-CA", label: "French (Canada)", flag: "CA" },
    { code: "ka", label: "Georgian", flag: "GE" },
    { code: "de", label: "German", flag: "DE" },
    { code: "el", label: "Greek", flag: "GR" },
    { code: "ha", label: "Hausa", flag: "NG" },
    { code: "he", label: "Hebrew", flag: "IL" },
    { code: "hi", label: "Hindi", flag: "IN" },
    { code: "hu", label: "Hungarian", flag: "HU" },
    { code: "id", label: "Indonesian", flag: "ID" },
    { code: "it", label: "Italian", flag: "IT" },
    { code: "ja", label: "Japanese", flag: "JP" },
    { code: "ko", label: "Korean", flag: "KR" },
    { code: "lv", label: "Latvian", flag: "LV" },
    { code: "lt", label: "Lithuanian", flag: "LT" },
    { code: "ms", label: "Malay", flag: "MY" },
    { code: "no", label: "Norwegian", flag: "NO" },
    { code: "fa", label: "Persian", flag: "IR" },
    { code: "ps", label: "Pashto", flag: "AF" },
    { code: "pl", label: "Polish", flag: "PL" },
    { code: "pt", label: "Portuguese", flag: "PT" },
    { code: "ro", label: "Romanian", flag: "RO" },
    { code: "ru", label: "Russian", flag: "RU" },
    { code: "sr", label: "Serbian", flag: "RS" },
    { code: "sk", label: "Slovak", flag: "SK" },
    { code: "sl", label: "Slovenian", flag: "SI" },
    { code: "so", label: "Somali", flag: "SO" },
    { code: "es", label: "Spanish", flag: "ES" },
    { code: "es-MX", label: "Spanish (Mexico)", flag: "MX" },
    { code: "sw", label: "Swahili", flag: "KE" },
    { code: "sv", label: "Swedish", flag: "SE" },
    { code: "tl", label: "Tagalog", flag: "PH" },
    { code: "ta", label: "Tamil", flag: "LK" },
    { code: "th", label: "Thai", flag: "TH" },
    { code: "tr", label: "Turkish", flag: "TR" },
    { code: "uk", label: "Ukrainian", flag: "UA" },
    { code: "ur", label: "Urdu", flag: "PK" },
    { code: "vi", label: "Vietnamese", flag: "VN" },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    if (onLanguageChange) {
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

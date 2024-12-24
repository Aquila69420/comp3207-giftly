import React, { useState } from 'react';

function DropdownSelection({username}) {
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [priceRange, setPriceRange] = useState(50);
  const [selectedThemes, setSelectedThemes] = useState([]);

  const occasionOptions = [
    { value: 'birthday', label: 'Birthday' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'farewell', label: 'Farewell' },
    { value: "engagement", label: "engagement" },
    { value: 'wedding', label: 'wedding' },
    { value: 'christmas', label: 'christmas' },
    { value: 'valentines', label: 'valentines' },
    { value: 'housewarming', label: 'housewarming' },
    { value: 'baby shower', label: 'baby shower' },
    { value: 'corporate party', label: 'corporate party' },
    { value: "mother's day", label: "mother's day" },
    { value: "father's day", label: "father's day" },
    { value: 'spontaneous', label: 'spontaneous' },
    { value: 'apology', label: 'apology' },
  ];

  const recipientOptions = [
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'girlfriend', label: 'girlfriend' },
    { value: 'boyfriend', label: 'boyfriend' },
    { value: 'sister', label: 'sister' },
    { value: 'brother', label: 'brother' },
    { value: 'mother', label: 'mother' },
    { value: 'father', label: 'father' },
    { value: 'grandmother', label: 'grandmother' },
    { value: 'grandfather', label: 'grandfather' },
    { value: 'cousin', label: 'cousin' },
    { value: 'aunt', label: 'aunt' },
    { value: 'uncle', label: 'uncle' },
    { value: 'wife', label: 'wife' },
    { value: 'husband', label: 'husband' },
    { value: 'son', label: 'son' },
    { value: 'daughter', label: 'daughter' },
    { value: 'acquaintance', label: 'acquaintance' },
  ];

  const themeOptions = [
    { value: 'romantic', label: 'Romantic' },
    { value: 'funny', label: 'Funny' },
    { value: 'practical', label: 'Practical' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'memory', label: 'memory' },
    { value: 'game', label: 'game' },
    { value: 'learning', label: 'learning' },
    { value: 'fun', label: 'fun' },
    { value: 'health', label: 'health' },
    { value: 'artistic', label: 'artistic' },
    { value: 'tech', label: 'tech' },
    { value: 'outdoors', label: 'outdoors' },
    { value: 'sports', label: 'sports' },
    { value: 'clothes', label: 'clothes' },
    { value: 'toys', label: 'toys' },
    { value: 'accessories', label: 'accessories' },
    { value: 'sustainable', label: 'sustainable' },
    { value: 'decoration', label: 'decoration' },
    { value: 'body products', label: 'body products' },
  ];

  const handleOccasionChange = (event) => {
    const values = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedOccasions(values);
  };

  const handleThemeChange = (event) => {
    const values = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedThemes(values);
  };

  const handleSubmit = async () => {
    const data = {
      "Username": username,
      "Occasions": selectedOccasions.join(', '),
      "Recipient": selectedRecipient,
      "Price": priceRange,
      "Themes": selectedThemes.join(', ')
    }
    try {
      const response = await fetch('http://localhost:5000/product_types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Response from backend:', result);
    } catch (error) {
      console.error('Error sending input data:', error);
    }
  };


  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Occasion Dropdown */}
      <select
        multiple
        value={selectedOccasions}
        onChange={handleOccasionChange}
        style={{
          margin: '10px',
          padding: '8px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      >
        {occasionOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Recipient Dropdown */}
      <select
        value={selectedRecipient}
        onChange={(e) => setSelectedRecipient(e.target.value)}
        style={{
          margin: '10px',
          padding: '8px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      >
        <option value="" disabled>
          -- Select Recipient --
        </option>
        {recipientOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Price Range Slider */}
      <div style={{ margin: '10px' }}>
        <label>
          Price Range: €{priceRange.toLocaleString()}
          <input
            type="range"
            min="1"
            max="10000"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      {/* Theme Dropdown */}
      <select
        multiple
        value={selectedThemes}
        onChange={handleThemeChange}
        style={{
          margin: '10px',
          padding: '8px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '5px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
        }}
      >
        Submit
      </button>
    </div>
  );
}

export default DropdownSelection;

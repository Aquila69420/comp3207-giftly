import React, { useState } from 'react';
import styles from '../styles/groups.module.css';

const AddOccasionModal = ({ group, onClose, onAddOccasion }) => {
  const [occasionName, setOccasionName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMemberIDs, setSelectedMemberIDs] = useState([]);

  const handleMemberToggle = (userID) => {
    setSelectedMemberIDs((prevSelected) =>
      prevSelected.includes(userID)
        ? prevSelected.filter((id) => id !== userID)
        : [...prevSelected, userID]
    );
  };

  const handleSubmit = () => {
    if (occasionName && selectedDate && selectedMemberIDs.length > 0) {
      onAddOccasion(group, occasionName, selectedDate, selectedMemberIDs);
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h2>Add Occasion</h2>
        <input
          type="text"
          placeholder="Occasion Name"
          value={occasionName}
          onChange={(e) => setOccasionName(e.target.value)}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div className={styles.membersList}>
          <h3>Select Members</h3>
          <ul>
            {group.users.map((user) => (
              <li key={user.userID}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedMemberIDs.includes(user.userID)}
                    onChange={() => handleMemberToggle(user.userID)}
                  />
                  {user.username}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={handleSubmit}>Add Occasion</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AddOccasionModal;

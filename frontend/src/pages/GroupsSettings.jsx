import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '../styles/groups.module.css';

const GroupsSettings = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate(); // For navigating back to the groups page
  const location = useLocation();
  const { groupName } = location.state || { groupName: 'Unknown Group' };

  const handleInvite = () => {
    if (username.trim()) {
    //   onInvite(email);
      setUsername(''); // Clear the email field after inviting
    }
  };

  return (
    <div className={styles.groupsSettingsPage}>
      {/* Top Bar */}
      <div className={styles.groupsTopBar}>
        <button
          className={styles.groupsBackButton}
          onClick={() => navigate('/groups')}
          title="Go Back"
        >
          <FaArrowLeft />
        </button>
        <span className={styles.groupsTopBarTitle}>{groupName}</span>
      </div>

      {/* Main Content */}
      <div className={styles.groupsSettingsContent}>
        <h2 className={styles.groupsSettingsHeading}>Add a Member to the Group</h2>
        <div className={styles.groupsSettingsForm}>
          <input
            type="text"
            placeholder="Enter a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.groupsSettingsInput}
          />
          <button
            onClick={handleInvite}
            className={styles.groupsSettingsButton}
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupsSettings;

import React from 'react';
import { FaArrowLeft, FaCog } from 'react-icons/fa';
import styles from '../styles/groups.module.css';

const GroupsTopBar = ({ onBack, onSettings, occasion }) => {
  return (
    <div className={styles.groupsTopBar}>
      {/* Back Button */}
      <button className={styles.groupsBackButton} onClick={onBack} title="Go Back">
        <FaArrowLeft />
      </button>

      {/* Center Section */}
      <div className={styles.groupsCenterSection}>
        <span className={styles.groupsOccasionLabel}>
          Upcoming Occasion: {occasion}
        </span>
        <button className={styles.groupsSecretSantaButton} title="Secret Santa">
          Special: Secret Santa
        </button>
      </div>

      {/* Settings Button */}
      <button className={styles.groupsSettingsButton} onClick={onSettings} title="Settings">
        <FaCog />
      </button>
    </div>
  );
};

export default GroupsTopBar;

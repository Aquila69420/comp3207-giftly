import React from 'react';
import styles from '../styles/groups.module.css';

const GroupsChat = ({ group, subgroup }) => {
  return (
    <div className={styles.chat}>
      <h2 className={styles.chatHeader}>
        {subgroup
          ? `Chat for ${subgroup.name}`
          : group
          ? `Chat for ${group.name}`
          : "Select a group or subgroup"}
      </h2>
      <div className={styles.chatArea}>
        <p>Chat messages will appear here.</p>
      </div>
      <div className={styles.chatInput}>
        <input
          type="text"
          placeholder="Type a message..."
          className={styles.chatInputField}
        />
        <button className={styles.chatInputButton}>Send</button>
      </div>
    </div>
  );
};

export default GroupsChat;

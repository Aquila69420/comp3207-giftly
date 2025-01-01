import React from "react";
import styles from "../styles/groups.module.css";

const GroupsChat = ({ group, occasion }) => {
  if (!group) {
    return (
      <div className={styles.chatContainer}>
        <p>Select a group to chat</p>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <h3>Chat for: {group.groupname}</h3>
      {occasion && <h4>Occasion: {occasion.occasionname}</h4>}
      {/* ... your chat UI goes here ... */}
    </div>
  );
};

export default GroupsChat;

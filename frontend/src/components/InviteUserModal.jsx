// src/components/InviteUserModal.jsx
import React, { useState } from "react";
import styles from "../styles/groups.module.css";
import config from "../config";

const InviteUserModal = ({ group, onClose }) => {
  const currentUserID = localStorage.getItem("userID");
  const [usernameToInvite, setUsernameToInvite] = useState("");

  const handleInvite = async () => {
    if (!usernameToInvite.trim()) return;
    try {
      const response = await fetch(`${config.backendURL}/groups/add_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          user_to_add: usernameToInvite.trim(),
          groupID: group.id,
        }),
      });
      const data = await response.json();
      if (data.result) {
        alert("User invited successfully");
        // Possibly refresh the group or do something
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Invite User to {group.groupname}</h2>
        <input
          type="text"
          placeholder="username"
          value={usernameToInvite}
          onChange={(e) => setUsernameToInvite(e.target.value)}
          className={styles.modalInput}
        />
        <div className={styles.modalButtons}>
          <button onClick={handleInvite} className={styles.modalCreateButton}>
            Invite
          </button>
          <button onClick={onClose} className={styles.modalCancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;

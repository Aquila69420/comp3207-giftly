// src/components/RenameGroupModal.jsx
import React, { useState } from "react";
import styles from "../styles/groups.module.css";

const RenameGroupModal = ({ group, onClose }) => {
  const currentUserID = localStorage.getItem("userID");
  const [newName, setNewName] = useState(group.groupname || "");

  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      const response = await fetch("http://localhost:5000/groups/change_groupname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          groupID: group.id,
          groupname: newName.trim(),
        }),
      });
      const data = await response.json();
      if (data.result) {
        alert("Group renamed successfully");
        // Possibly refresh or update the group in parent
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
        <h2 className={styles.modalTitle}>Rename {group.groupname}</h2>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={styles.modalInput}
        />
        <div className={styles.modalButtons}>
          <button onClick={handleRename} className={styles.modalCreateButton}>
            Rename
          </button>
          <button onClick={onClose} className={styles.modalCancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameGroupModal;

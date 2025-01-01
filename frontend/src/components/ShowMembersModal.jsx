// src/components/ShowMembersModal.jsx
import React, { useState } from "react";
import styles from "../styles/groups.module.css";

const ShowMembersModal = ({ group, occasion, division, onClose }) => {
  const currentUserID = localStorage.getItem("userID");

  // We'll treat group as the primary. If you also want to handle occasion or division,
  // adjust accordingly:
  const isGroup = !!group;
  // If we have a group, we can see if the current user is admin:
  const isAdmin = group?.admin === currentUserID;

  // We'll gather the members from group.users, or from occasion/division if you like
  const members = group?.users || [];

  const handleKick = async (memberID) => {
    if (!window.confirm(`Kick user ${memberID} from group?`)) return;
    try {
      const response = await fetch("http://localhost:5000/groups/kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          groupID: group.id,
          user_to_remove: memberID,
        }),
      });
      const data = await response.json();
      if (data.result) {
        alert("User removed from group");
        // Refresh your group data in the parent if needed
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          {isGroup ? `Members of ${group.groupname}` : "Members"}
        </h2>
        <ul>
          {members.map((m) => (
            <li key={m.userID} style={{ marginBottom: "0.5rem" }}>
              {m.username} ({m.userID})
              {isAdmin && m.userID !== currentUserID && (
                <button
                  style={{
                    marginLeft: "1rem",
                    backgroundColor: "red",
                    color: "#fff",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleKick(m.userID)}
                >
                  X
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className={styles.modalButtons}>
          <button className={styles.modalCancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowMembersModal;

import React, { useState, useEffect } from "react";
import { IoPersonRemoveOutline, IoPersonRemove } from "react-icons/io5";
import styles from "../styles/groups.module.css";
import config from "../config";

const ShowMembersModal = ({ group, occasion, division, onClose }) => {
  const currentUserID = localStorage.getItem("userID");
  const [kicked, setKicked] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Initialize members list from props
    setMembers(group?.users || occasion?.users || division?.users || []);
  }, [group, occasion, division]);

  const isGroup = !!group;
  const isAdmin = group?.admin === currentUserID;

  const handleKick = async (memberID) => {
    if (!window.confirm(`Kick user ${memberID} from group?`)) return;
    try {
      setKicked(true);
      const response = await fetch(`${config.backendURL}/groups/kick`, {
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
        // Remove the kicked user from the members list
        setMembers((prevMembers) => prevMembers.filter((m) => m.userID !== memberID));
      } else {
        setKicked(false);
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
          {isGroup ? `Group Members` : "Members"}
        </h2>
        <ul>
          {members.map((m) => (
            <li key={m.userID} style={{ marginBottom: "0.5rem" }}>
              {m.username}
              {isAdmin && m.userID !== currentUserID && (
                <button
                  style={{
                    marginLeft: "1rem",
                    backgroundColor: "#085b5e",
                    borderRadius: "10px",
                    color: "#fff",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleKick(m.userID)}
                >
                  {!kicked ? <IoPersonRemoveOutline /> : <IoPersonRemove />}
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

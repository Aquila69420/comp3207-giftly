import React, { useState } from "react";
import styles from "../styles/groups.module.css";

/**
 * Props:
 *  occasion: { id, occasionname, ... }
 *  onClose: () => void
 */
const CreateDivisionModal = ({ occasion, onClose }) => {
  const [showRecipientSelection, setShowRecipientSelection] = useState(false);
  const [recipientIDs, setRecipientIDs] = useState([]);

  const handleSecretSanta = async () => {
    try {
      const res = await fetch("http://localhost:5000/groups/secret_santa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userID: localStorage.getItem("userID"), 
          occasionID: occasion.id 
        }),
      });
      const data = await res.json();
      if (data.result) {
        alert("Secret Santa divisions created!");
      } else {
        alert("Error: " + data.msg);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      onClose();
    }
  };

  const handleExclusionGifting = async () => {
    try {
      const res = await fetch("http://localhost:5000/groups/exclusion_gifting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: localStorage.getItem("userID"),
          occasionID: occasion.id,
        }),
      });
      const data = await res.json();
      if (data.result) {
        alert("Exclusion Gifting divisions created!");
      } else {
        alert("Error: " + data.msg);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      onClose();
    }
  };

  const handleGroupGifting = async () => {
    // The user might need to pick the recipients
    // For now, assume we have an array of recipientIDs
    try {
      const res = await fetch("http://localhost:5000/groups/group_gifting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: localStorage.getItem("userID"),
          occasionID: occasion.id,
          recipients: recipientIDs, // e.g. array of userIDs
        }),
      });
      const data = await res.json();
      if (data.result) {
        alert("Group Gifting divisions created!");
      } else {
        alert("Error: " + data.msg);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      onClose();
    }
  };

  const handleRecipientChange = (id) => {
    if (recipientIDs.includes(id)) {
      setRecipientIDs(recipientIDs.filter((r) => r !== id));
    } else {
      setRecipientIDs([...recipientIDs, id]);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Create Division</h3>
        <p>{occasion?.occasionname}</p>

        {/* Secret Santa */}
        <button onClick={handleSecretSanta} className={styles.modalCreateButton}>
          Secret Santa
        </button>

        {/* Group Gifting */}
        <button
          onClick={() => setShowRecipientSelection(!showRecipientSelection)}
          className={styles.modalCreateButton}
        >
          Group Gifting (select recipients)
        </button>

        {showRecipientSelection && (
          <div className={styles.checkboxList}>
            {/* In real code, you'd get the list of users from the occasion or group */}
            {(occasion?.users || []).map((userID) => (
              <label key={userID} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={recipientIDs.includes(userID)}
                  onChange={() => handleRecipientChange(userID)}
                />
                {userID}
              </label>
            ))}
            {/* Confirm recipients */}
            <button onClick={handleGroupGifting} className={styles.modalCreateButton}>
              Confirm Recipients
            </button>
          </div>
        )}

        {/* Exclusion Gifting */}
        <button onClick={handleExclusionGifting} className={styles.modalCreateButton}>
          Exclusion Gifting
        </button>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={onClose} className={styles.modalCancelButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDivisionModal;

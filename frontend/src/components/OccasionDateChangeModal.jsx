import React, { useState } from "react";
import styles from "../styles/groups.module.css";
import config from "../config";

/**
 * Props:
 *  occasion: { id, occasionname, occasiondate, ... }
 *  onClose: () => void
 */
const OccasionDateChangeModal = ({ occasion, onClose }) => {
  const [newDate, setNewDate] = useState(occasion?.occasiondate || "");

  const handleChangeDate = async () => {
    try {
      const res = await fetch(`${config.backendURL}/groups/occasions/datechange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasionID: occasion.id, occasiondate: newDate }),
      });
      const data = await res.json();
      if (data.result) {
        alert("Date changed to " + newDate);
      } else {
        alert("Error: " + data.msg);
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
        <h3 className={styles.modalTitle}>Change Occasion Date</h3>
        <p>{occasion?.occasionname}</p>
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className={styles.modalInput}
        />
        <div className={styles.modalButtons}>
          <button onClick={handleChangeDate} className={styles.modalCreateButton}>
            Save
          </button>
          <button onClick={onClose} className={styles.modalCancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OccasionDateChangeModal;

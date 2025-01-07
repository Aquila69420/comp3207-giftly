import React, { useState, useEffect } from "react";
import { FaUsers, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Modal } from "react-bootstrap";
import config from "../config";
import styles from "../styles/product.module.css";

export default function SharedCartMenu({onDivisionSelect }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ groups: [], occasions: [], divisions: [] });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userId = localStorage.getItem("userID");

  const fetchGroupsOccasionsDivisions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.backendURL}/groups/get_all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: userId }),
      });
      const result = await response.json();
      if (result.result) {
        console.log("Groups/Occasions/Divisions:", result);
        setData(result);
      } else {
        alert(result.msg);
      }
    } catch (error) {
      console.error("Error fetching groups/occasions/divisions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      fetchGroupsOccasionsDivisions();
    }
  }, [showModal]);

  const getDivisionLabel = (division) => {
    if (!division.recipients || division.recipients.length === 0) {
      return "Loading...";
    }
    console.log("Getting label for division:", division);

    return division.divisionname
  };

  const handleDivisionSelect = (divisionId, groupID) => {
    onDivisionSelect(divisionId, groupID);
    setShowModal(false);
  };

  return (
    <>
      <button className={styles.navButton1} onClick={() => setShowModal(true)}>
        Add to Shared Cart
        <FaUsers size={30} />
      </button>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName={styles.modal}
      >
        <Modal.Header closeButton dialogClassName={styles.modalHeader}>
          <Modal.Title>Select a Division</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {!selectedGroup && (
                <ul>
                  {data.groups.map((group) => (
                    <li key={group.id} className={styles.groupItem} onClick={() => setSelectedGroup(group)}>
                      {group.groupname} {selectedGroup === group ? <FaChevronDown className={styles.chevron}/> : <FaChevronRight className={styles.chevron}/>}
                    </li>
                  ))}
                </ul>
              )}
              {selectedGroup && !selectedOccasion && (
                <ul>
                  <button className={styles.backButton} onClick={() => setSelectedGroup(null)}>Back to choose group</button>
                  {data.occasions
                    .filter((oc) => oc.groupID === selectedGroup.id)
                    .map((occasion) => (
                      <li key={occasion.id} className={styles.occasionItem} onClick={() => setSelectedOccasion(occasion)}>
                        {occasion.occasionname} {selectedOccasion === occasion ? <FaChevronDown className={styles.chevron}/> : <FaChevronRight className={styles.chevron}/>}
                      </li>
                    ))}
                </ul>
              )}
              {selectedOccasion && (
                <ul>
                  <button className={styles.backButton} onClick={() => setSelectedOccasion(null)}>Back to choose occasion</button>
                  {data.divisions
                    .filter((div) => div.occasionID === selectedOccasion.id)
                    .map((division) => (
                      <li key={division.id} onClick={() => handleDivisionSelect(division.id, selectedGroup.id)}>
                        Division: {getDivisionLabel(division)}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

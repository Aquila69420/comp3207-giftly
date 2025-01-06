import React, { useState, useEffect } from "react";
import { FaUsers, FaChevronRight } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
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

  const handleDivisionSelect = (divisionId) => {
    onDivisionSelect(divisionId);
    setShowModal(false);
  };

  return (
    <>
      <Button className={styles.navButton1} onClick={() => setShowModal(true)}>
        Add to Shared Cart
        <FaUsers size={30} />
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
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
                    <li key={group.id} onClick={() => setSelectedGroup(group)}>
                      {group.groupname} <FaChevronRight />
                    </li>
                  ))}
                </ul>
              )}
              {selectedGroup && !selectedOccasion && (
                <ul>
                  <Button onClick={() => setSelectedGroup(null)}>Back</Button>
                  {data.occasions
                    .filter((oc) => oc.groupID === selectedGroup.id)
                    .map((occasion) => (
                      <li key={occasion.id} onClick={() => setSelectedOccasion(occasion)}>
                        {occasion.occasionname} <FaChevronRight />
                      </li>
                    ))}
                </ul>
              )}
              {selectedOccasion && (
                <ul>
                  <Button onClick={() => setSelectedOccasion(null)}>Back</Button>
                  {data.divisions
                    .filter((div) => div.occasionID === selectedOccasion.id)
                    .map((division) => (
                      <li key={division.id} onClick={() => handleDivisionSelect(division.id)}>
                        Division: {division.id}
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

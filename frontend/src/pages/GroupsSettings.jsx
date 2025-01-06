import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaPencilAlt, FaCheck } from "react-icons/fa";
import styles from "../styles/groups.module.css";
import config from "../config";

const GroupsSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupID, groupName: initialName, members: initialMembers, activeGroup } = location.state || {};
  const [groupName, setGroupName] = useState(initialName || "");
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupName);
  const [members, setMembers] = useState(initialMembers || []);
  const [error, setError] = useState(null);

  const currentUserID = localStorage.getItem("userID");
  const isAdmin = activeGroup?.admin === currentUserID;

  const handleSaveGroupName = async () => {
    if (newGroupName === groupName) {
      setIsEditingGroupName(false);
      return;
    }
    try {
      const response = await fetch(`${config.backendURL}/groups/change_groupname`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          groupID,
          groupname: newGroupName,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setGroupName(newGroupName);
        setIsEditingGroupName(false);
        setError(null);
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Error updating group name: " + err.message);
    }
  };

  const handleDeleteGroup = async () => {
    // ...
    navigate("/groups");
  };
  const handleLeaveGroup = async () => {
    // ...
    navigate("/groups");
  };

  const handleRemoveMember = async (userIDToRemove) => {
    // ...
    setMembers((prev) => prev.filter((m) => m.userID !== userIDToRemove));
  };

  return (
    <div className={styles.groupsSettingsPage}>
      {/* Top Bar */}
      <div className={styles.groupsTopBar}>
        <button
          className={styles.groupsBackButton}
          onClick={() => navigate("/groups")}
          title="Go Back"
        >
          <FaArrowLeft />
        </button>
        <div className={styles.groupsTopBarTitleContainer}>
          {isEditingGroupName ? (
            <div className={styles.editGroupName}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className={styles.editGroupNameInput}
              />
              <button onClick={handleSaveGroupName} className={styles.editGroupNameButton}>
                <FaCheck />
              </button>
            </div>
          ) : (
            <span className={styles.groupsTopBarTitle}>
              {groupName}
              <FaPencilAlt
                onClick={() => setIsEditingGroupName(true)}
                className={styles.editIcon}
              />
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.groupsSettingsContent}>
        {error && <p className={styles.error}>{error}</p>}
        <h2 className={styles.membersHeading}>Members</h2>
        <ul className={styles.membersList}>
          {members.map((m) => (
            <li key={m.userID}>
              {m.username}
              {/* If admin, show remove button */}
              {isAdmin && (
                <button onClick={() => handleRemoveMember(m.userID)}>Remove</button>
              )}
            </li>
          ))}
        </ul>

        {/* Group Action */}
        <div className={styles.groupActionSection}>
          {isAdmin ? (
            <button onClick={handleDeleteGroup} className={styles.deleteGroupButton}>
              Delete Group
            </button>
          ) : (
            <button onClick={handleLeaveGroup} className={styles.leaveGroupButton}>
              Leave Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsSettings;

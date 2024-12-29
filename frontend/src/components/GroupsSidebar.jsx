import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import styles from '../styles/groups.module.css';

const GroupsSidebar = ({ groups, onGroupClick, onSubgroupClick, activeGroup, onCreateGroup, onAddOccasion }) => {
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [newOccasionName, setNewOccasionName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const currentUserID = localStorage.getItem("userID"); // Assuming userID is stored in localStorage

  const openOccasionModal = () => {
    if (activeGroup?.users) {
      setSelectedMembers(
        activeGroup.users.map((user) => ({
          ...user,
          selected: true, // Select all members by default
        }))
      );
    }
    setShowOccasionModal(true);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName);
      setNewGroupName('');
      setShowModal(false);
    }
  };

  const handleAddOccasion = () => {
    if (newOccasionName.trim() && selectedDate.trim()) {
      const users = selectedMembers
        .filter((member) => member.selected)
        .map((member) => member.userID);

      onAddOccasion(activeGroup, newOccasionName, selectedDate, users);
      setNewOccasionName('');
      setSelectedDate('');
      setShowOccasionModal(false);
    }
  };

  const toggleMemberSelection = (userID) => {
    setSelectedMembers((prev) =>
      prev.map((member) =>
        member.userID === userID
          ? { ...member, selected: !member.selected }
          : member
      )
    );
  };

  return (
    <div className={styles.sidebar}>
      {/* Title and Plus Button */}
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Groups</h2>
        <button
          className={styles.addGroupButton}
          onClick={() => setShowModal(true)}
          title="Add a new group"
        >
          <FaPlus />
        </button>
      </div>

      {/* Group List */}
      <ul className={styles.groupList}>
        {groups.map((group, index) => (
          <li
            key={index}
            className={`${styles.groupItem} ${activeGroup?.groupname === group.groupname ? styles.activeGroup : ''}`}
          >
            <div className={styles.groupNameWrapper}>
              <div onClick={() => onGroupClick(group)} className={styles.groupName}>
                {group.groupname}
              </div>
              {activeGroup?.groupname === group.groupname && (
                <button
                  className={styles.addOccasionButton}
                  onClick={openOccasionModal}
                  title="Add Occasion"
                >
                  <FaPlus className={styles.redPlusIcon} />
                </button>
              )}
            </div>
            <ul className={styles.subgroupList}>
              {group.occasions?.map((subgroup, subIndex) => (
                <li
                  key={subIndex}
                  onClick={() => onSubgroupClick(subgroup)}
                  className={styles.subgroupItem}
                >
                  {subgroup.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Modal for creating new group */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Create New Group</h3>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.modalButtons}>
              <button onClick={handleCreateGroup} className={styles.modalCreateButton}>
                Create
              </button>
              <button onClick={() => setShowModal(false)} className={styles.modalCancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding occasion */}
      {showOccasionModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Add Occasion</h3>
            <input
              type="text"
              placeholder="Occasion Name"
              value={newOccasionName}
              onChange={(e) => setNewOccasionName(e.target.value)}
              className={styles.modalInput}
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.membersList}>
              {selectedMembers.map((member) => (
                <div key={member.userID} className={styles.memberItem}>
                  <input
                    type="checkbox"
                    checked={member.selected}
                    onChange={() => toggleMemberSelection(member.userID)}
                    disabled={member.userID === currentUserID} // Disable the checkbox for the current user
                  />
                  <span>{member.username}</span>
                </div>
              ))}
            </div>
            <div className={styles.modalButtons}>
              <button onClick={handleAddOccasion} className={styles.modalCreateButton}>
                Add
              </button>
              <button onClick={() => setShowOccasionModal(false)} className={styles.modalCancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsSidebar;

import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa'; // Icon for the plus button
import styles from '../styles/groups.module.css';

const GroupsSidebar = ({ groups, onGroupClick, onSubgroupClick, activeGroup, onCreateGroup }) => {
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName);
      setNewGroupName('');
      setShowModal(false);
    }
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
            <div onClick={() => onGroupClick(group)} className={styles.groupName}>
              {group.groupname}
            </div>
            <ul className={styles.subgroupList}>
              {group.subgroups?.map((subgroup, subIndex) => (
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
    </div>
  );
};

export default GroupsSidebar;

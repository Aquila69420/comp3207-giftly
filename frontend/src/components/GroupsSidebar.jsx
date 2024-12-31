import React, { useState } from "react";
import { FaEllipsisV, FaPlus } from "react-icons/fa";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import styles from "../styles/groups.module.css";

/**
 * groups: [
 *   {
 *     id: 1,
 *     groupname: "Group 1",
 *     occasions: [
 *       {
 *         id: 11,
 *         occasionname: "Subgroup 1",
 *         divisions: [
 *           { id: 111, divisionName: "Division 1" },
 *           { id: 112, divisionName: "Division 2" },
 *         ],
 *       },
 *       ...
 *     ]
 *   },
 *   ...
 * ]
 */

const GroupsSidebar = ({
  groups = [],
  activeGroup,
  onGroupClick,       // invoked when user clicks a group
  onCreateGroup,      // invoked when user wants to create a new group
  onAddOccasion,      // invoked when user wants to add a new occasion
}) => {
  // State to track whether the main "Giftly" heading is open
  const [isMainOpen, setIsMainOpen] = useState(true);

  // Track which groups are expanded
  const [openGroups, setOpenGroups] = useState({});
  // Track which occasions are expanded
  const [openOccasions, setOpenOccasions] = useState({});

  // Simple toggler for groups
  const handleGroupToggle = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Simple toggler for occasions (subgroups)
  const handleOccasionToggle = (occasionId) => {
    setOpenOccasions((prev) => ({
      ...prev,
      [occasionId]: !prev[occasionId],
    }));
  };

  // If you want to open a modal or show a context menu for each item
  const handleMenuClick = (itemType, item) => {
    // itemType: "group" | "occasion" | "division" | "main-heading"
    // item: the data object for that item
    alert(`Menu click for ${itemType}\n${JSON.stringify(item, null, 2)}`);
  };

  // For adding a group
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroupSubmit = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
    }
    setNewGroupName("");
    setShowGroupModal(false);
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* MAIN HEADING */}
      <div className={styles.mainHeading}>
        {/* Left side: collapse/expand icon + text */}
        <div
          className={styles.headingLeft}
          onClick={() => setIsMainOpen(!isMainOpen)}
        >
          {isMainOpen ? <FiChevronDown /> : <FiChevronRight />}
          <h2 className={styles.mainHeadingText}>Giftly</h2>
        </div>

        {/* Right side: the three-dot menu (and optional "add group" icon) */}
        <div className={styles.headingRight}>
          {/* Three-dot menu for the main heading */}
          <div
            className={styles.iconWrapper}
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick("main-heading", {});
            }}
          >
            <FaEllipsisV />
          </div>
          {/* Plus icon to open "create group" modal */}
          <div
            className={styles.iconWrapper}
            onClick={(e) => {
              e.stopPropagation();
              setShowGroupModal(true);
            }}
          >
            <FaPlus />
          </div>
        </div>
      </div>

      {/* Collapsible content: the groups list */}
      {isMainOpen && (
        <div className={styles.groupsWrapper}>
          {groups.map((group) => {
            const groupOpen = openGroups[group.id] || false;
            const isActiveGroup = activeGroup?.id === group.id;

            return (
              <div key={group.id} className={styles.groupSection}>
                {/* GROUP HEADER */}
                <div
                  className={`${styles.groupHeading} ${
                    isActiveGroup ? styles.activeGroupBg : ""
                  }`}
                  onClick={() => {
                    handleGroupToggle(group.id);
                    onGroupClick?.(group);
                  }}
                >
                  <div className={styles.groupLeft}>
                    {groupOpen ? <FiChevronDown /> : <FiChevronRight />}
                    <span
                      className={
                        isActiveGroup
                          ? styles.activeGroupText
                          : styles.groupText
                      }
                    >
                      {group.groupname}
                    </span>
                  </div>

                  <div
                    className={styles.iconWrapper}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick("group", group);
                    }}
                  >
                    <FaEllipsisV />
                  </div>
                </div>

                {/* OCCASIONS (SUBGROUPS) */}
                {groupOpen &&
                  Array.isArray(group.occasions) &&
                  group.occasions.map((occasion) => {
                    const occasionOpen = openOccasions[occasion.id] || false;

                    return (
                      <div key={occasion.id} className={styles.occasionSection}>
                        <div
                          className={styles.occasionHeading}
                          onClick={() => {
                            handleOccasionToggle(occasion.id);
                            // If you want a callback: onOccasionClick?.(occasion);
                          }}
                        >
                          <div className={styles.occasionLeft}>
                            {occasionOpen ? <FiChevronDown /> : <FiChevronRight />}
                            <span className={styles.occasionText}>
                              {occasion.occasionname}
                            </span>
                          </div>
                          <div
                            className={styles.iconWrapper}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuClick("occasion", occasion);
                            }}
                          >
                            <FaEllipsisV />
                          </div>
                        </div>

                        {/* DIVISIONS */}
                        {occasionOpen &&
                          Array.isArray(occasion.divisions) &&
                          occasion.divisions.map((division) => (
                            <div
                              key={division.id}
                              className={styles.divisionItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                // If you want a callback: onDivisionClick?.(division);
                              }}
                            >
                              <div className={styles.divisionLeft}>
                                <span className={styles.divisionText}>
                                  {division.divisionName}
                                </span>
                              </div>
                              <div
                                className={styles.iconWrapper}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuClick("division", division);
                                }}
                              >
                                <FaEllipsisV />
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showGroupModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Create New Group</h3>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.modalButtons}>
              <button
                onClick={handleCreateGroupSubmit}
                className={styles.modalCreateButton}
              >
                Create
              </button>
              <button
                onClick={() => setShowGroupModal(false)}
                className={styles.modalCancelButton}
              >
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

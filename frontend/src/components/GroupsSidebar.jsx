import React, { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { FaEllipsisV, FaPlus } from "react-icons/fa";
import GroupsContextMenu from "./GroupsContextMenu";
import AddOccasionModal from "./AddOccasionModal";
import styles from "../styles/groups.module.css";

const GroupsSidebar = ({
  groups = [],
  activeGroup,
  onGroupClick,
  onOccasionClick,
  onAddOccasion,
  onCreateGroup,
}) => {
  const [isMainOpen, setIsMainOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState({});
  const [openOccasions, setOpenOccasions] = useState({});

  // Context menu
  const [menuConfig, setMenuConfig] = useState({
    isOpen: false,
    type: null,
    item: null,
  });

  const openMenu = (type, item) => {
    setMenuConfig({ isOpen: true, type, item });
  };
  const closeMenu = () => setMenuConfig({ isOpen: false, type: null, item: null });

  // Track “Add Group” modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Track “Add Occasion” modal
  const [showAddOccasionModal, setShowAddOccasionModal] = useState(false);
  const [targetGroupForOccasion, setTargetGroupForOccasion] = useState(null);

  // Group toggler
  const handleGroupToggle = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Occasion toggler
  const handleOccasionToggle = (occId) => {
    setOpenOccasions((prev) => ({ ...prev, [occId]: !prev[occId] }));
  };

  // Create group
  const handleCreateGroupSubmit = () => {
    if (newGroupName.trim()) {
      onCreateGroup?.(newGroupName.trim());
    }
    setNewGroupName("");
    setShowCreateGroupModal(false);
  };

  // Called from the context menu when user clicks "Add Occasion"
  const handleAddOccasionRequest = (group) => {
    setTargetGroupForOccasion(group);
    setShowAddOccasionModal(true);
    closeMenu();
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* Main heading */}
      <div className={styles.mainHeading}>
        <div
          className={styles.headingLeft}
          onClick={() => setIsMainOpen(!isMainOpen)}
        >
          {isMainOpen ? <FiChevronDown /> : <FiChevronRight />}
          <h2 className={styles.mainHeadingText}>Giftly</h2>
        </div>
        <div className={styles.headingRight}>
          {/* 3-dot menu for main heading if you want */}
          <div
            className={styles.iconWrapper}
            onClick={(e) => {
              e.stopPropagation();
              openMenu("main-heading", {});
            }}
          >
            <FaEllipsisV />
          </div>
          {/* Add Group */}
          <div
            className={styles.iconWrapper}
            onClick={() => setShowCreateGroupModal(true)}
          >
            <FaPlus />
          </div>
        </div>
      </div>

      {isMainOpen && (
        <div className={styles.groupsWrapper}>
          {groups.map((group) => {
            const isGroupOpen = openGroups[group.id] || false;
            const isActiveGroup = activeGroup?.id === group.id;
            return (
              <div key={group.id} className={styles.groupSection}>
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
                    {isGroupOpen ? <FiChevronDown /> : <FiChevronRight />}
                    <span
                      className={
                        isActiveGroup ? styles.activeGroupText : styles.groupText
                      }
                    >
                      {group.groupname}
                    </span>
                  </div>
                  <div
                    className={styles.iconWrapper}
                    onClick={(e) => {
                      e.stopPropagation();
                      openMenu("group", group);
                    }}
                  >
                    <FaEllipsisV />
                  </div>
                </div>

                {/* Occasions */}
                {isGroupOpen &&
                  Array.isArray(group.occasions) &&
                  group.occasions.map((occ) => {
                    const isOccOpen = openOccasions[occ.id] || false;
                    return (
                      <div key={occ.id} className={styles.occasionSection}>
                        <div
                          className={styles.occasionHeading}
                          onClick={() => {
                            handleOccasionToggle(occ.id);
                            onOccasionClick?.(occ);
                          }}
                        >
                          <div className={styles.occasionLeft}>
                            {isOccOpen ? <FiChevronDown /> : <FiChevronRight />}
                            <span className={styles.occasionText}>
                              {occ.occasionname}
                            </span>
                          </div>
                          <div
                            className={styles.iconWrapper}
                            onClick={(e) => {
                              e.stopPropagation();
                              openMenu("occasion", occ);
                            }}
                          >
                            <FaEllipsisV />
                          </div>
                        </div>

                        {/* Divisions */}
                        {isOccOpen &&
                          Array.isArray(occ.divisions) &&
                          occ.divisions.map((div) => (
                            <div key={div.id} className={styles.divisionItem}>
                              <span className={styles.divisionText}>
                                {div.divisionName || "Untitled Division"}
                              </span>
                              <div
                                className={styles.iconWrapper}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMenu("division", div);
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
      {showCreateGroupModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Create New Group</h3>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.modalButtons}>
              <button onClick={handleCreateGroupSubmit} className={styles.modalCreateButton}>
                Create
              </button>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className={styles.modalCancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD OCCASION MODAL */}
      {showAddOccasionModal && targetGroupForOccasion && (
        <AddOccasionModal
          group={targetGroupForOccasion}
          onClose={() => setShowAddOccasionModal(false)}
          onAddOccasion={onAddOccasion}
        />
      )}

      {/* CONTEXT MENU */}
      {menuConfig.isOpen && (
        <GroupsContextMenu
          type={menuConfig.type}
          item={menuConfig.item}
          onClose={closeMenu}
          onAddOccasionRequest={handleAddOccasionRequest}
        />
      )}
    </div>
  );
};

export default GroupsSidebar;

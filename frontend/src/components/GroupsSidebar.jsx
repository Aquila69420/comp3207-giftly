import React, { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { FaEllipsisH, FaPlus } from "react-icons/fa";
import GroupsContextMenu from "./GroupsContextMenu";
import AddOccasionModal from "./AddOccasionModal";
import styles from "../styles/groups.module.css";
import { ClipLoader } from "react-spinners";

/*
  Props:
    groups: array of group objects
    activeGroup: the current selected group
    onGroupClick: (group) => void
    onOccasionClick: (occasion) => void
    onAddOccasion: (group, occasionName, date, users) => void
    onCreateGroup: (groupName) => void

  The parent should handle the actual fetching/updating of `groups` after actions.
*/

const GroupsSidebar = ({
  groups = [],
  activeGroup,
  activeOccasion,
  activeDivision,
  onGroupClick,
  onOccasionClick,
  onDivisionClick,
  onAddOccasion,
  onCreateGroup,
  refreshGroups, // optional callback to re-fetch or update state
  loadingDivisions,
  loadingOccasions,
  loadingGroup,
}) => {
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [expandedOccasionId, setExpandedOccasionId] = useState(null);

  // Toggles for the entire side panel
  const [isMainOpen, setIsMainOpen] = useState(true);

  // Context menu state
  const [menuConfig, setMenuConfig] = useState({
    isOpen: false,
    type: null,
    item: null,
  });
  const openMenu = (type, item) => {
    setMenuConfig({ isOpen: true, type, item });
  };
  const closeMenu = () => setMenuConfig({ isOpen: false, type: null, item: null });

  // "Add Group" modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // "Add Occasion" modal
  const [showAddOccasionModal, setShowAddOccasionModal] = useState(false);
  const [targetGroupForOccasion, setTargetGroupForOccasion] = useState(null);

  // Expand/collapse a group
  const handleGroupToggle = (groupId, group) => {
    // If we click the same group, toggle it closed; 
    // otherwise expand the new group, collapse the old.
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
    setExpandedOccasionId(null); // Also reset any occasion expansions
    // Let parent know which group is "selected"
    onGroupClick?.(group);
  };

  // Expand/collapse an occasion
  const handleOccasionToggle = (occasionId, occasion) => {
    setExpandedOccasionId((prev) => (prev === occasionId ? null : occasionId));
    onOccasionClick?.(occasion);
  };

  // Actually create a new group
  const handleCreateGroupSubmit = async () => {
    if (newGroupName.trim()) {
      await onCreateGroup?.(newGroupName.trim());
      // Possibly refetch or update groups
      refreshGroups?.();
    }
    setNewGroupName("");
    setShowCreateGroupModal(false);
  };

  // Called when context menu user picks "Add Occasion"
  const handleAddOccasionRequest = (group) => {
    setTargetGroupForOccasion(group);
    setShowAddOccasionModal(true);
    closeMenu();
  };

  // After we create an occasion, we want to refresh
  const handleAddOccasionDone = async (group, name, date, users) => {
    await onAddOccasion?.(group, name, date, users);
    refreshGroups?.();
  };

  function getDivisionLabel(division) {
    if (!division.recipients || division.recipients.length === 0) {
      return "Loading...";
    }

    // Extract just the usernames
    const usernames = division.recipients.map(r => r.username);

    if (usernames.length === 1) {
      // e.g. "Harry's Gift"
      return `${usernames[0]}'s Gift`;
    } else {
      // e.g. "Sarah and Tony's Gifts"
      return `${usernames.join(" & ")}'s Gifts`;
    }
  }

  //
  // RENDER
  //
  return (
    <div className={styles.sidebarContainer}>
      {/* Collapsible main heading */}
      <div className={styles.mainHeading}>
        <div className={styles.headingLeft} onClick={() => setIsMainOpen(!isMainOpen)}>
          {isMainOpen ? <FiChevronDown /> : <FiChevronRight />}
          <h2 className={styles.mainHeadingText}>Giftly</h2>
        </div>
        <div className={styles.headingRight}>
          {/* 3-dot menu for main heading (FaEllipsisH) - optional */}
          <div
            className={styles.iconWrapper}
            onClick={(e) => {
              e.stopPropagation();
              openMenu("main-heading", {});
            }}
          >
            <FaEllipsisH />
          </div>
          {/* Add Group */}
          <div
            className={styles.iconWrapper}
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateGroupModal(true);
            }}
          >
            <FaPlus />
          </div>
        </div>
      </div>

      {/* Groups list */}
      {isMainOpen && (
        <div className={styles.groupsWrapper}>
          {/* Spinner for loading groups */}
          {loadingGroup ? (
            <div className={styles.spinnerContainer}>
              <ClipLoader />
            </div>
          ) : (

          groups.map((group) => {
            const isExpanded = expandedGroupId === group.id;
            const isActiveGroup = activeGroup?.id === group.id;
            return (
              <div key={group.id} className={styles.groupSection}>
                <div
                  className={`${styles.groupHeading} ${isActiveGroup ? styles.activeGroupBg : ""}`}
                  onClick={() => handleGroupToggle(group.id, group)}
                >
                  <div className={styles.groupLeft}>
                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                    <span className={isActiveGroup ? styles.activeGroupText : styles.groupText}>
                      {group.groupname}
                    </span>
                  </div>
                  {/* Three horizontal dots, hidden unless hover */}
                  <div
                    className={styles.iconWrapper}
                    onClick={(e) => {
                      e.stopPropagation();
                      openMenu("group", group);
                    }}
                  >
                    <FaEllipsisH />
                  </div>
                </div>

                {/* Animate the expand/collapse for occasions */}
                <div
                  className={styles.animatedPanel}
                  style={{
                    maxHeight: isExpanded
                      ? group.occasions?.length
                        ? `${group.occasions.length * 60}px`
                        : "60px"
                      : "0px",
                  }}
                >
                  {Array.isArray(group.occasions) &&
                  loadingOccasions ? (
                    <div className={styles.spinnerContainer}>
                      <ClipLoader />
                    </div>
                  ) : (
                    
                    
                    group.occasions?.map((occ) => {
                      
                      const occIsExpanded = expandedOccasionId === occ.id;
                      const isActiveOccasion = activeOccasion?.id === occ.id;
                    
                      return (
                        <div key={occ.id} className={styles.occasionSection}>
                          <div
                            className={`${styles.occasionHeading} ${
                              isActiveOccasion ? styles.activeOccasionBg : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOccasionToggle(occ.id, occ);
                            }}
                          >
                            <div className={styles.occasionLeft}>
                              {occIsExpanded ? <FiChevronDown /> : <FiChevronRight />}
                              <span
                                className={
                                  isActiveOccasion ? styles.activeOccasionText : styles.occasionText
                                }
                              >
                                {occ.occasionname}
                              </span>
                            </div>
                            <div
                              className={styles.iconWrapper}
                              onClick={(event) => {
                                event.stopPropagation();
                                openMenu("occasion", occ);
                              }}
                            >
                              <FaEllipsisH />
                            </div>
                          </div>
                    
                          {/* Spinner for loading occasions */}
                          {occIsExpanded && loadingDivisions ? (
                            <div className={styles.spinnerContainer}>
                              <ClipLoader />
                            </div>
                          ) : (
                            <div
                              className={styles.animatedPanel}
                              style={{
                                maxHeight: occIsExpanded
                                  ? occ.divisions
                                    ? `${occ.divisions.length * 40 + 10}px`
                                    : "40px"
                                  : "0px",
                              }}
                            >
                              {occ.divisions?.map((div) => {
                                const label = getDivisionLabel(div);
                                const isActiveDivision = activeDivision?.id === div.id;
                    
                                return (
                                  <div
                                    key={div.id}
                                    className={`${styles.divisionItem} ${
                                      isActiveDivision ? styles.activeDivisionBg : ""
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDivisionClick?.(div);
                                    }}
                                  >
                                    <span
                                      className={
                                        isActiveDivision
                                          ? styles.activeDivisionText
                                          : styles.divisionText
                                      }
                                    >
                                      {label}
                                    </span>
                                    <div
                                      className={styles.iconWrapper}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openMenu("division", div);
                                      }}
                                    >
                                      <FaEllipsisH />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                </div>
              </div>
            );
          })
          )}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCreateGroupModal(false)}>
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
          onAddOccasion={handleAddOccasionDone} // call the updated function
        />
      )}

      {/* CONTEXT MENU */}
      {menuConfig.isOpen && (
        <GroupsContextMenu
          type={menuConfig.type}
          item={menuConfig.item}
          onClose={closeMenu}
          onAddOccasionRequest={handleAddOccasionRequest}
          // after any action, re-fetch or update
          onActionDone={() => {
            refreshGroups?.();
          }}
        />
      )}
    </div>
  );
};

export default GroupsSidebar;

import React, { useState } from "react";
import OccasionDateChangeModal from "../components/OccasionDateChangeModal";
import CreateDivisionModal from "../components/CreateDivisionModal";
import ShowMembersModal from "../components/ShowMembersModal";
import InviteUserModal from "../components/InviteUserModal";
import GetShareableLinkModal from "../components/GetShareableLinkModal";
import RenameGroupModal from "../components/RenameGroupModal";
import styles from "../styles/groups.module.css";
import config from "../config";
import Cart from "../components/Cart";

/**
 * Props:
 *  type: "group" | "occasion" | "division" | "main-heading"
 *  item:  the group/occasion/division data
 *  onClose:  function to close
 *  onAddOccasionRequest: function (group) => void (for "Add Occasion" in group)
 *
 *  We assume "item" for a group has:
 *    - item.id
 *    - item.groupname
 *    - item.admin (the userID of the admin)
 *    - item.users: array of { userID, username }
 *
 *  for an occasion we assume:
 *    - item.id
 *    - item.occasionname
 *    - ...
 *
 */
const GroupsContextMenu = ({
  type,
  item,
  onClose,
  onAddOccasionRequest,
  onActionDone,
}) => {
  const currentUserID = localStorage.getItem("userID");
  const isAdmin = item?.admin === currentUserID;

  const [showDateModal, setShowDateModal] = useState(false);
  const [showCreateDivisionModal, setShowCreateDivisionModal] = useState(false);

  // Additional modals
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  const [showCartModal, setShowCartModal] = useState(false); // State for cart modal


  //
  // ========== GROUP ACTIONS ==========
  //

  // 1) Delete group
  const handleDeleteGroup = async () => {
    if (!window.confirm(`Delete group: ${item.groupname}? This action is permanent.`)) {
      return;
    }
    try {
      const response = await fetch(`${config.backendURL}/groups/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          groupID: item?.id,
        }),
      });
      const data = await response.json();
      if (data.result) {
        alert("Group deleted successfully");
        onActionDone?.();
        // Possibly refresh groups or navigate away
        // ...
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      onClose();
    }
  };

  // 2) Leave group
  const handleLeaveGroup = async () => {
    if (!window.confirm(`Leave group: ${item.groupname}?`)) return;
    try {
      const response = await fetch(`${config.backendURL}/groups/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          groupID: item?.id,
        }),
      });
      const data = await response.json();
      if (data.result || data.response) {
        alert("You left the group successfully");
        onActionDone?.();
        // Possibly refresh groups
        // ...
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      onClose();
    }
  };

  //
  // ========== OCCASION ACTIONS ==========
  //
  const handleDeleteOccasion = async () => {
    if (!window.confirm(`Delete occasion ID ${item?.id}?`)) return;
    try {
      const response = await fetch(`${config.backendURL}/groups/occasions/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasionID: item?.id }),
      });
      const data = await response.json();
      if (data.result) {
        alert(`Occasion deleted successfully`);
        // Possibly refresh
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      onClose();
    }
  };

  const handleLeaveOccasion = async () => {
    if (!window.confirm(`Leave occasion: ${item.occasionname}?`)) return;
    try {
      const response = await fetch(`${config.backendURL}/groups/occasions/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          occasionID: item?.id,
        }),
      });
      const data = await response.json();
      if (data.result) {
        alert(`You left the occasion`);
        // Possibly refresh
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      onClose();
    }
  };

  const handleRenameOccasion = async () => {
    // e.g. you'd open a rename modal or do something similar
    alert("Rename occasion: " + item?.id);
    onClose();
  };

  //
  // ========== BUILD MENU ITEMS DYNAMICALLY ==========
  //
  let menuItems = [];

  if (type === "main-heading") {
    menuItems = []; // or any main heading items
  } 
  else if (type === "group") {
    // If user is admin, we show rename group, delete group, invite users, show members
    // If user is NOT admin, we show leave group, show members
    if (isAdmin) {
      menuItems = [
        { label: "Delete Group", onClick: handleDeleteGroup },
        { label: "Rename Group", onClick: () => setShowRenameModal(true) },
        { label: "Invite Users", onClick: () => setShowInviteModal(true) },
        { label: "Get link to group", onClick: () => setShowLinkModal(true) },
        { label: "Show Members", onClick: () => setShowMembersModal(true) },
        {
          label: "Add Occasion",
          onClick: () => onAddOccasionRequest?.(item),
        },
      ];
    } else {
      menuItems = [
        { label: "Leave Group", onClick: handleLeaveGroup },
        { label: "Show Members", onClick: () => setShowMembersModal(true) },
      ];
    }
  } 
  else if (type === "occasion") {
    menuItems = [
      { label: "Leave Occasion", onClick: handleLeaveOccasion },
      { label: "Show Members", onClick: () => setShowMembersModal(true) },
      { label: "Rename", onClick: handleRenameOccasion },
      {
        label: "Date Change",
        onClick: () => setShowDateModal(true),
      },
      {
        label: "Delete Occasion",
        onClick: handleDeleteOccasion,
      },
      {
        label: "Create Division",
        onClick: () => setShowCreateDivisionModal(true),
      },
    ];
  } 
  else if (type === "division") {
    menuItems = [
      { label: "Show Members", onClick: () => setShowMembersModal(true) },
      { label: "Leave", onClick: () => alert("Leave division: " + item?.id) },
      { label: "Show Cart", onClick: () => setShowCartModal(true) },
    ];
  }

  return (
    <div className={styles.menuBackdrop} onClick={onClose}>
      <div className={styles.menuContainer} onClick={(e) => e.stopPropagation()}>
        <h4 className={styles.menuTitle}>
          {type === "group" && "Group Options"}
          {type === "occasion" && "Occasion Options"}
          {type === "division" && "Division Options"}
        </h4>
        <ul className={styles.menuList}>
          {menuItems.map((m, i) => (
            <li key={i} className={styles.menuItem} onClick={m.onClick}>
              {m.label}
            </li>
          ))}
        </ul>

        {/* MODALS */}

        {/* Show members */}
        {showMembersModal && type === "group" && (
          <ShowMembersModal group={item} onClose={() => setShowMembersModal(false)} />
        )}
        {showMembersModal && type === "occasion" && (
          // If you want to handle an occasion’s members, you'd do a similar approach
          <ShowMembersModal group={null} occasion={item} onClose={() => setShowMembersModal(false)} />
        )}
        {showMembersModal && type === "division" && (
          // If divisions have a user list, you can do something similar
          <ShowMembersModal group={null} division={item} onClose={() => setShowMembersModal(false)} />
        )}

        {/* Invite user */}
        {showInviteModal && type === "group" && (
          <InviteUserModal group={item} onClose={() => setShowInviteModal(false)} />
        )}

        {/* Get shareable link */}
        { showLinkModal && type === "group" && (
          <GetShareableLinkModal group={item} onClose={() => setShowLinkModal(false)}/>
        )}

        {/* Rename group */}
        {showRenameModal && type === "group" && (
          <RenameGroupModal group={item} onClose={() => setShowRenameModal(false)} onActionDone={onActionDone} />
        )}

        {/* Date Change (occasion) */}
        {showDateModal && type === "occasion" && (
          <OccasionDateChangeModal
            occasion={item}
            onClose={() => setShowDateModal(false)}
          />
        )}

        {showCartModal && (
          console.log('Session ID: ', item?.id),
          <div className={styles.modalBackdrop} onClick={() => setShowCartModal(false)}>
            <div
              className={styles.modalContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeButton}
                onClick={() => setShowCartModal(false)}
              >
                &times;
              </button>
              <Cart 
                key={Math.random().toString(36).substring(7)}
                sessionId={item?.id} // Pass division ID as sessionId
                context="shared-cart"
              />
            </div>
          </div>
        )}

        {/* Create Division (occasion) */}
        {showCreateDivisionModal && type === "occasion" && (
          <CreateDivisionModal
            occasion={item}
            onClose={() => setShowCreateDivisionModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GroupsContextMenu;

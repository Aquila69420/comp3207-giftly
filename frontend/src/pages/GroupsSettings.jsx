import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaPencilAlt, FaCheck } from 'react-icons/fa';
import GroupsMembersList from "../components/GroupsMembersList"; 
import styles from '../styles/groups.module.css';

const GroupsSettings = () => {
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // For navigating back to the groups page
  const location = useLocation();
//   const [memberUsernames, setMemberUsernames] = useState([]);
  // const [memberDetails, setMemberDetails] = useState([]); // Array of { username, userID }
  const { groupID, members: initialMembers, activeGroup: group } = location.state || { groupID: '', members: [], activeGroup: {} };
  const [members, setMembers] = useState(initialMembers);
  const [activeGroup, setActiveGroup] = useState(group);

  const [groupName, setGroupName] = useState(
    location.state?.groupName || 'Unknown Group'
  );
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupName);
  const currentUserID = localStorage.getItem("userID");
  console.log('activeGroup', activeGroup);
  const isAdmin = activeGroup.admin === currentUserID;


  // useEffect(() => {
  //   const fetchUsernames = async () => {
  //     try {
  //       const response = await fetch('http://localhost:5000/get_usernames', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ userIDs: members }),
  //       });

  //       const data = await response.json();
  //       if (data.result) {
  //         const combinedDetails = members.map((id, index) => ({
  //           userID: id,
  //           username: data.usernames[index],
  //         }));
  //         // setMemberDetails(combinedDetails);
  //       } else {
  //         setError(data.msg);
  //       }
  //     } catch (error) {
  //       setError('Error fetching usernames: ' + error.message);
  //     }
  //   };

  //   fetchUsernames();
  // }, [members]);
  
  const handleSaveGroupName = async () => {
	// Only update the group name if it has changed
	if (newGroupName === groupName) {
	  setIsEditingGroupName(false);
	  return;
	}
	try {
      const response = await fetch('http://localhost:5000/groups/change_groupname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: localStorage.getItem('userID'),
          groupID: groupID,
          groupname: newGroupName,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setGroupName(newGroupName); // Update group name in the UI
        setIsEditingGroupName(false); // Exit editing mode
        setError(null);
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError('Error updating group name: ' + error.message);
    }
  };

  const handleRemoveMember = async (userIDToRemove) => {
    try {
      const response = await fetch("http://localhost:5000/groups/kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          groupID: groupID,
          user_to_remove: userIDToRemove,
        }),
      });
      const data = await response.json();
      if (data.result) {
        //update the members list
        setMembers((prev) => prev.filter((member) => member.userID !== userIDToRemove));
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError("Error removing member: " + error.message);
    }
  };
  

  const handleInvite = async () => {
    if (username.trim()) {
      try {
			const response = await fetch('http://localhost:5000/groups/add_user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
				  userID: localStorage.getItem('userID'),
				  user_to_add: username,
				  groupID: groupID,
				}),
			});
			console.log(response);
			const addUserData = await response.json();
			if (addUserData.result) {
          setUsername(''); 
          setError(null);
          // Update the members list
          setMembers((prev) => [...prev, { userID: addUserData.userID, username }]);
      } else {
          setError(addUserData.msg);
      }
      } catch (error) {
        setError('Error inviting user: ' + error.message);
      }
    }
  };


  const handleDeleteGroup = async () => {
    try {
      const response = await fetch('http://localhost:5000/groups/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: localStorage.getItem('userID'),
          groupID: groupID,
        }),
      });
      const data = await response.json();
      if (data.result) {
        navigate('/groups'); // Navigate back to the groups page after deletion
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError('Error deleting group: ' + error.message);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch('http://localhost:5000/groups/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: localStorage.getItem('userID'),
          groupID: groupID,
        }),
      });
      const data = await response.json();
      if (data.result) {
        navigate('/groups'); // Navigate back to the groups page after leaving
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError('Error leaving group: ' + error.message);
    }
  }

  return (
    <div className={styles.groupsSettingsPage}>
      {/* Top Bar */}
      <div className={styles.groupsTopBar}>
        <button
          className={styles.groupsBackButton}
          onClick={() => navigate('/groups')}
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
              <button
                onClick={handleSaveGroupName}
                className={styles.editGroupNameButton}
              >
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
        {/* Add Member Section */}
        {isAdmin && (
          <>
            <h2 className={styles.groupsSettingsHeading}>Add a Member to the Group</h2>
            <div className={styles.groupsSettingsForm}>
              <input
                type="text"
                placeholder="Enter a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.groupsSettingsInput}
              />
              <button
                onClick={handleInvite}
                className={styles.groupsSettingsButton}
              >
                Add Member
              </button>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Members Section
        <h2 className={styles.membersHeading}>Members</h2>
        <ul className={styles.membersList}>
          {memberUsernames.map((member, index) => (
			<li key={index} className={styles.memberItem}>
			  {member}
			</li>
		  ))}
        </ul> */}

        {/* Members Section */}
        <h2 className={styles.membersHeading}>Members</h2>
        <ul className={styles.membersList}>
          {members.map((member) => (
            <GroupsMembersList
              key={member.userID}
              member={member}
              onRemove={() => handleRemoveMember(member.userID)}
              isCurrentUser={member.userID === currentUserID}
              isAdmin={isAdmin}
            />
          ))}
        </ul>

        {/* Group Action Section */}
        <div className={styles.groupActionSection}>
          {isAdmin ? (
            // Delete Group button for admin
            <button
              onClick={handleDeleteGroup}
              className={styles.deleteGroupButton}
            >
              Delete Group
            </button>
          ) : (
            // Leave Group button for non-admin users
            <button
              onClick={handleLeaveGroup}
              className={styles.leaveGroupButton}
            >
              Leave Group
            </button>
          )}
        </div>

		
      </div>
    </div>
  );
};

export default GroupsSettings;

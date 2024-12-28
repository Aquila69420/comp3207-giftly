import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '../styles/groups.module.css';

const GroupsSettings = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // For navigating back to the groups page
  const location = useLocation();
  const { groupName, groupID, members } = location.state || { groupName: 'Unknown Group', groupID: '', members: [] };

  console.log('groupName:', groupName, 'groupID:', groupID, 'members:', members);
  

  const handleInvite = async () => {
    if (username.trim()) {
      try {

        console.log('username:', username, 'groupID:', groupID);

        const response = await fetch('http://localhost:5000/groups/add_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: localStorage.getItem('username'),
            user_to_add: username,
            groupID: groupID,
          }),
        });
        console.log(response);
        const data = await response.json();
        if (data.result) {
          setUsername(''); // Clear the username field after inviting
          setError(null);
		  // Update the members list
		  members.push(username);
        } else {
          setError(data.msg);
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
          username: localStorage.getItem('username'),
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
        <span className={styles.groupsTopBarTitle}>{groupName}</span>
      </div>

      {/* Main Content */}
      <div className={styles.groupsSettingsContent}>
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

        {error && <p className={styles.error}>{error}</p>}

		{/* Members Section */}
        <h2 className={styles.membersHeading}>Members</h2>
        <ul className={styles.membersList}>
          {members.map((member, index) => (
			<li key={index} className={styles.memberItem}>
			  {member}
			</li>
		  ))}
        </ul>

        {/* Delete Group Button */}
        <div className={styles.deleteGroupSection}>
          <button
            onClick={handleDeleteGroup}
            className={styles.deleteGroupButton}
          >
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupsSettings;

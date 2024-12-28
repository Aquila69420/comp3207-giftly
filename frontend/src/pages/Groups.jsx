import React, { useState, useEffect } from 'react';
import GroupsSidebar from '../components/GroupsSidebar';
import GroupsChat from '../components/GroupsChat';
import GroupsTopBar from '../components/GroupsTopbar';
import styles from '../styles/groups.module.css';
import { useNavigate } from 'react-router-dom';


const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSubgroup, setActiveSubgroup] = useState(null);
  const [username] = useState('atharva'); // Replace with actual logged-in username
  const [userID] = useState('06bac64c-9de0-4757-ba1a-ccff044a3399'); // Replace with actual logged-in user id
  const [occasion, setOccasion] = useState("X's Birthday"); // Replace with actual occasion
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch groups from backend
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('http://localhost:5000/groups/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID }),
        });

        const data = await response.json();
        if (data.result) {
          setGroups(data.groups);
          if (data.groups.length > 0) {
            setActiveGroup(data.groups[0]); // Set the first group as the active group
          }
        } else {
          setError(data.msg);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [userID]);

  // Handle group creation
  const handleCreateGroup = async (newGroupName) => {
    if (!newGroupName) return;

    try {
      const response = await fetch('http://localhost:5000/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, groupname: newGroupName }),
      });
      const data = await response.json();
      if (data.result) {
        //Fetch the updated groups list
        const response = await fetch('http://localhost:5000/groups/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID }),
        });

        const data = await response.json();

        if (data.result) {
            setGroups(data.groups);
            if (data.groups.length > 0) {
              setActiveGroup(data.groups[0]); // Set the first group as the active group
            }
        } else {
            setError(data.msg);
        }

      } else {
        console.error(data.msg);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className={styles.groupsContainer}>
      {/* Top Bar */}
      <GroupsTopBar
        onBack={() => console.log('Back')}
        onSettings={() => navigate('/groups/settings', { state: { groupID: activeGroup?.id, groupName: activeGroup?.groupname, members: activeGroup?.users } })}
        occasion={occasion}
      />

      {/* Sidebar and Chat Area */}
      <div className={styles.groupsContent}>
        <GroupsSidebar
          groups={groups}
          onGroupClick={setActiveGroup}
          onSubgroupClick={setActiveSubgroup}
          onCreateGroup={handleCreateGroup}
          activeGroup={activeGroup}
        />
        <GroupsChat group={activeGroup} subgroup={activeSubgroup} />
      </div>
    </div>
  );
};

export default Groups;

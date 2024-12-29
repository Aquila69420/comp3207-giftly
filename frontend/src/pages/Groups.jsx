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
//   const [username] = useState('atharva'); // Replace with actual logged-in username
  const [userID] = useState(localStorage.getItem('userID'));
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

  // Handle occasion addition
  const handleAddOccasion = async (group, occasionName, occasionDate, users) => {
    try {
      const response = await fetch('http://localhost:5000/groups/occasions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID,
          groupID: group.id,
          users,
          occasionname: occasionName,
          occasiondate: occasionDate,
        }),
      });

      const data = await response.json();
      if (data.result) {
        // Update the active group with the new occasion
        const updatedGroup = data.group;
        setGroups((prevGroups) =>
          prevGroups.map((grp) => (grp.id === group.id ? updatedGroup : grp))
        );
        setActiveGroup(updatedGroup); // Update the active group in state
      } else {
        setError(data.msg);
      }
    } catch (error) {
      console.error('Error adding occasion:', error);
    }
  };





  return (
    <div className={styles.groupsContainer}>
      {/* Top Bar */}
      <GroupsTopBar
        onBack={() => navigate("/")}
        onSettings={() => navigate('/groups/settings', { state: { groupID: activeGroup?.id, groupName: activeGroup?.groupname, members: activeGroup?.users, activeGroup } })}
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
          onAddOccasion={handleAddOccasion}
        />
        <GroupsChat group={activeGroup} subgroup={activeSubgroup} />
      </div>
    </div>
  );
};

export default Groups;

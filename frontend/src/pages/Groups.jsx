import React, { useState, useEffect } from 'react';
import GroupsSidebar from '../components/GroupsSidebar';
import GroupsChat from '../components/GroupsChat';
import GroupsTopBar from '../components/GroupsTopbar';
import styles from '../styles/groups.module.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSubgroup, setActiveSubgroup] = useState(null);
  const [username] = useState('atharva'); // Replace with actual logged-in username
  const [occasion, setOccasion] = useState("X's Birthday"); // Replace with actual occasion
  const [error, setError] = useState(null);

  // Fetch groups from backend
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('http://localhost:5000/groups/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();
        if (data.result) {
          setGroups(data.groups);
        } else {
          setError(data.msg);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [username]);

  // Handle group creation
  const handleCreateGroup = async (newGroupName) => {
    if (!newGroupName) return;

    try {
      const response = await fetch('http://localhost:5000/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, groupname: newGroupName }),
      });
      const data = await response.json();
      if (data.result) {
        setGroups([...groups, { groupname: newGroupName, subgroups: [] }]);
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
        onSettings={() => console.log('Settings')}
        occasion={occasion}
      />

      {/* Sidebar and Chat Area */}
      <div className={styles.groupsContent}>
        <GroupsSidebar
          groups={groups}
          onGroupClick={setActiveGroup}
          onSubgroupClick={setActiveSubgroup}
          onCreateGroup={handleCreateGroup}
        />
        <GroupsChat group={activeGroup} subgroup={activeSubgroup} />
      </div>
    </div>
  );
};

export default Groups;

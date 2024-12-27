import React, { useState, useEffect } from 'react';
import GroupsSidebar from '../components/GroupsSidebar';
import Chat from '../components/GroupsChat';
import styles from '../styles/groups.module.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSubgroup, setActiveSubgroup] = useState(null);
  const [username] = useState('atharva'); // Replace with actual logged-in username
  const [newGroupName, setNewGroupName] = useState('');
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
        console.log('Fetched groups:', data); // Debugging log
        
        if (data.result === "OK") {
            setGroups(data.groups);
            console.log('Groups state updated:', data.groups); // Debugging log
        } else {
            setError(data.msg);
            console.error(data.msg);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [username]);

  // Handle group creation
  const handleCreateGroup = async () => {
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
        setNewGroupName(''); // Reset input
      } else {
        console.error(data.msg);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleGroupClick = (group) => {
    setActiveGroup(group);
    setActiveSubgroup(null);
  };

  const handleSubgroupClick = (subgroup) => {
    setActiveSubgroup(subgroup);
  };

  return (
    <div className={styles.container}>
      <GroupsSidebar
        groups={groups}
        onGroupClick={handleGroupClick}
        onSubgroupClick={handleSubgroupClick}
      />
      <div>
        <input
          type="text"
          placeholder="Enter new group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <button onClick={handleCreateGroup}>Add Group</button>
      </div>
      <Chat group={activeGroup} subgroup={activeSubgroup} />
    </div>
  );
};

export default Groups;

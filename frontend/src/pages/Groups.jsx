import React, { useState, useEffect } from 'react';
import GroupsSidebar from '../components/GroupsSidebar';
import GroupsChat from '../components/GroupsChat';
import GroupsTopBar from '../components/GroupsTopbar';
import styles from '../styles/groups.module.css';
import { useNavigate } from 'react-router-dom';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeOccasion, setActiveOccasion] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Typically stored from user auth/login
  const userID = localStorage.getItem('userID'); 
  const [occasion] = useState("X's Birthday"); // Arbitrary example

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('http://localhost:5000/groups/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID }),
        });
        const data = await response.json();
        console.log('data', data);
        if (data.result) {
          /**
           * data.groups might look like:
           * [
           *   { id: 1, groupname: 'Group 1', occasions: [11, 12] },
           *   { id: 2, groupname: 'Group 2', occasions: [21] }
           * ]
           * i.e., just IDs in the "occasions" array
           */
          setGroups(data.groups);
          if (data.groups.length > 0) {
            setActiveGroup(data.groups[0]);
          }
        } else {
          setError(data.msg);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Error fetching groups');
      }
    };
    fetchGroups();
  }, [userID]);

  /**
   * 1. When user clicks a group in the sidebar:
   *    - If we haven't already fetched that group's full occasions,
   *      we fetch them now (groups/occasions/get).
   *    - Update the group in `groups` state with the new occasions array
   *      (actual objects, not just IDs).
   *    - Set the group as activeGroup
   */
  const handleGroupClick = async (group) => {
    // If the group is null or we already loaded its occasions, just set it active
    if (!group) return;

    // Check if we have real occasion objects or just IDs
    const hasFullOccasions = Array.isArray(group.occasions) && group.occasions.length > 0 
      && typeof group.occasions[0] === 'object'; // naive check

    // Only fetch if we don't have real occasion objects yet
    if (!hasFullOccasions) {
      try {
        const response = await fetch('http://localhost:5000/groups/occasions/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID, groupID: group.id }),
        });
        const data = await response.json();
        if (data.result) {
          /**
           * data.occasions might look like:
           * [
           *    { id: 11, occasionname: 'Subgroup 1', divisions: [...] },
           *    { id: 12, occasionname: 'Subgroup 2', divisions: [...] }
           * ]
           */
          const updatedGroup = {
            ...group,
            occasions: data.occasions, 
          };

          // Merge into groups state
          setGroups((prevGroups) =>
            prevGroups.map((g) => (g.id === group.id ? updatedGroup : g))
          );
          // Set the updated group as active
          setActiveGroup(updatedGroup);
        } else {
          console.error(data.msg);
          setError(data.msg);
        }
      } catch (err) {
        console.error('Error fetching occasions:', err);
        setError('Error fetching occasions');
      }
    } else {
      // Already have full occasions, just set group active
      setActiveGroup(group);
    }
  };

  // For the future: you could do a similar approach for fetching divisions
  // if the "divisions" data in each occasion is also just IDs.

  // Create group
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
        // Re-fetch all groups
        const res2 = await fetch('http://localhost:5000/groups/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID }),
        });
        const data2 = await res2.json();
        if (data2.result) {
          setGroups(data2.groups);
          if (data2.groups.length > 0) {
            setActiveGroup(data2.groups[0]);
          }
        } else {
          setError(data2.msg);
        }
      } else {
        console.error(data.msg);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Add occasion to a group
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
        // data.group is the updated group with the new occasion
        const updatedGroup = data.group;
        setGroups((prevGroups) =>
          prevGroups.map((grp) => (grp.id === group.id ? updatedGroup : grp))
        );
        // Also set it active, if desired:
        setActiveGroup(updatedGroup);
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
        onSettings={() =>
          navigate('/groups/settings', {
            state: {
              groupID: activeGroup?.id,
              groupName: activeGroup?.groupname,
              members: activeGroup?.users,
              activeGroup,
            },
          })
        }
        occasion={occasion}
      />

      {/* Sidebar and Chat Area */}
      <div className={styles.groupsContent}>
        <GroupsSidebar
          groups={groups}
          activeGroup={activeGroup}
          onGroupClick={handleGroupClick}
          onCreateGroup={handleCreateGroup}
          onAddOccasion={handleAddOccasion}
          // If you need further click handlers:
          // onSubgroupClick={...}
          // onDivisionClick={...}
        />

        {/* 
          If you want to display a chat based on the active group/occasion:
          pass them as props to your GroupsChat:
        */}
        <GroupsChat group={activeGroup} occasion={activeOccasion} />
      </div>

      {error && <p style={{ color: 'red', padding: '1rem' }}>{error}</p>}
    </div>
  );
};

export default Groups;

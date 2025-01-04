import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GroupsTopBar from "../components/GroupsTopbar";
import GroupsSidebar from "../components/GroupsSidebar";
import GroupsChat from "../components/GroupsChat";
import styles from "../styles/groups.module.css";

const Groups = () => {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");
  const username = localStorage.getItem("username");
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeOccasion, setActiveOccasion] = useState(null);
  const [error, setError] = useState(null);
  const [activeDivision, setActiveDivision] = useState(null);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingOccasions, setLoadingOccasions] = useState(false);

  const [loadingGroup, setLoadingGroup] = useState(false);

  useEffect(() => {
    if (!userID) return;
    const fetchGroups = async () => {
      setLoadingGroup(true);
      try {
        const res = await fetch("http://localhost:5000/groups/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID }),
        });
        const data = await res.json();
        if (data.result) {
          setGroups(data.groups);

          if (data.groups.length > 0) {
            setActiveGroup(data.groups[0]);
          }
        } else {
          setError(data.msg);
        }
      } catch (err) {
        setError("Error fetching groups: " + err.message);
      } finally {
        setLoadingGroup(false);
      }
    };
    fetchGroups();
  }, [userID]);

  // Refresh groups
  const handleRefreshGroups = async () => {
    setLoadingGroup(true);
    try {
      const res = await fetch("http://localhost:5000/groups/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
      });
      const data = await res.json();
      if (data.result) {
        setGroups(data.groups);
        
        console.log('Active group:', activeGroup.id);
        // Keep the same active group if it's still in the updated list
        if (activeGroup) {
          const sameGroup = data.groups.find((g) => g.id === activeGroup.id);
          if (sameGroup) {
            // Merge any existing data from "activeGroup" (like occasions) if needed
            // or re-fetch them again lazily in handleGroupClick
            setActiveGroup(sameGroup);
            handleGroupClick(sameGroup);
            console.log('Active group updated:', sameGroup.id);
          } else {
            setActiveGroup(data.groups[0]);
            handleGroupClick(data.groups[0]);
          }
        }

      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Error fetching groups: " + err.message);
    } finally { 
      setLoadingGroup(false);
    }
  };
  

  // Lazily fetch occasions when a group is clicked
  const handleGroupClick = async (group) => {
    if (!group) return;
    // Check if already loaded full occasions
    const hasOccasionObjects =
      Array.isArray(group.occasions) &&
      group.occasions.length > 0 &&
      typeof group.occasions[0] === "object";

    if (!hasOccasionObjects) {
      try {
        setLoadingOccasions(true);
        const res = await fetch("http://localhost:5000/groups/occasions/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID, groupID: group.id }),
        });
        const data = await res.json();
        if (data.result) {
          const updatedGroup = { ...group, occasions: data.occasions };
          setGroups((prev) =>
            prev.map((g) => (g.id === group.id ? updatedGroup : g))
          );
          setActiveGroup(updatedGroup);
        } else {
          setError(data.msg);
        }
      } catch (err) {
        setError("Error fetching occasions: " + err.message);
      } finally {
        setLoadingOccasions(false);
      }
    } else {
      setActiveGroup(group);
    }
    setActiveOccasion(null); // reset activeOccasion
    setActiveDivision(null); // reset activeDivision
  };

  // Lazily fetch divisions for an occasion
  const handleOccasionClick = async (occasion) => {
    if (!occasion) return;
    const hasDivisions =
      Array.isArray(occasion.divisions) &&
      occasion.divisions.length > 0 &&
      typeof occasion.divisions[0] === "object";

    
    if (!hasDivisions) {
      setLoadingDivisions(true);
      try {
        const res = await fetch("http://localhost:5000/groups/divisions/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID, occasionID: occasion.id }),
        });
        const data = await res.json();
        if (data.result) {
          // Merge divisions into the occasion
          const updatedOccasion = { ...occasion, divisions: data.divisions };
          // Update activeGroup's occasions
          const updatedGroup = {
            ...activeGroup,
            occasions: activeGroup.occasions.map((occ) =>
              occ.id === occasion.id ? updatedOccasion : occ
            ),
          };
          // Update groups state
          setGroups((prev) =>
            prev.map((g) => (g.id === activeGroup.id ? updatedGroup : g))
          );
          setActiveGroup(updatedGroup);
          setActiveOccasion(updatedOccasion);
          setActiveDivision(updatedOccasion.divisions[0]);
        } else {
          setError(data.msg);
        }
      } catch (err) {
        setError("Error fetching divisions: " + err.message);
      } finally {
        setLoadingDivisions(false);
      }
    } else {
      setActiveOccasion(occasion);
      setActiveDivision(occasion.divisions[0]);
    }

    // if (occasion.divisions && occasion.divisions.length > 0) {
    //   setActiveDivision(occasion.divisions[0]);
    //   console.log('Active divisionn:', occasion.divisions[0]);
    // } else {
    //   setActiveDivision(null);
    // }
  
    setActiveOccasion(occasion);
  };

  // Set the active division
  const handleDivisionClick = (division) => {
    setActiveDivision(division);
  };

  // Create a new group
  const handleCreateGroup = async (groupName) => {
    if (!groupName.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, groupname: groupName.trim() }),
      });
      console.log('Response:', res);
      const data = await res.json();
      if (data.result) {
        // refetch groups
        setLoadingGroup(true);
        const res2 = await fetch("http://localhost:5000/groups/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID }),
        });
        const data2 = await res2.json();
        if (data2.result) {
          setGroups(data2.groups);
          setActiveGroup(data.group);
          handleGroupClick(data.group);
        } else {
          setError(data2.msg);
        }
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Error creating group: " + err.message);
    } finally {
      setLoadingGroup(false);
    }
  };

  // Add an occasion to a group
  const handleAddOccasion = async (group, occasionName, occasionDate, chosenUserIDs) => {
    try {
      const res = await fetch("http://localhost:5000/groups/occasions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID,
          groupID: group.id,
          users: chosenUserIDs, // array of user IDs
          occasionname: occasionName,
          occasiondate: occasionDate,
        }),
      });
      const data = await res.json();
      if (data.result) {
        // Add the new occasion to the group
        const updatedGroup = {
          ...group,
          occasions: group.occasions.concat(data.occasion),
        };
        setGroups((prev) =>
          prev.map((g) => (g.id === group.id ? updatedGroup : g))
        );
        setActiveGroup(updatedGroup);

      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Error adding occasion: " + err.message);
    }
  };

  return (
    <div className={styles.groupsContainer}>
      <GroupsTopBar userID={userID} />

      <div className={styles.groupsContent}>
        <GroupsSidebar
          groups={groups}
          activeGroup={activeGroup}
          activeOccasion={activeOccasion}
          activeDivision={activeDivision}
          onGroupClick={handleGroupClick}
          onOccasionClick={handleOccasionClick}
          onDivisionClick={handleDivisionClick}
          onAddOccasion={handleAddOccasion}
          onCreateGroup={handleCreateGroup}
          refreshGroups={handleRefreshGroups}
          loadingDivisions={loadingDivisions}
          loadingOccasions={loadingOccasions}
          loadingGroup={loadingGroup}
          
        />
        <div style={{ flex: 1 }}>
        <GroupsChat
          userID={userID}
          username={username}
          group={activeGroup}         // or division={activeDivision}
          division={activeDivision}   // optional 
        />
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Groups;

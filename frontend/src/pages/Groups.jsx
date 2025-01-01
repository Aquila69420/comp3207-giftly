import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GroupsTopBar from "../components/GroupsTopbar";
import GroupsSidebar from "../components/GroupsSidebar";
import GroupsChat from "../components/GroupsChat";
import styles from "../styles/groups.module.css";

const Groups = () => {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeOccasion, setActiveOccasion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userID) return;
    const fetchGroups = async () => {
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
      }
    };
    fetchGroups();
  }, [userID]);

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
      }
    } else {
      setActiveGroup(group);
    }
    setActiveOccasion(null); // reset activeOccasion
  };

  // Lazily fetch divisions for an occasion
  const handleOccasionClick = async (occasion) => {
    if (!occasion) return;
    const hasDivisions =
      Array.isArray(occasion.divisions) &&
      occasion.divisions.length > 0 &&
      typeof occasion.divisions[0] === "object";

    if (!hasDivisions) {
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
        } else {
          setError(data.msg);
        }
      } catch (err) {
        setError("Error fetching divisions: " + err.message);
      }
    } else {
      setActiveOccasion(occasion);
    }
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
      const data = await res.json();
      if (data.result) {
        // refetch groups
        const res2 = await fetch("http://localhost:5000/groups/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID }),
        });
        const data2 = await res2.json();
        if (data2.result) {
          setGroups(data2.groups);
          setActiveGroup(data.group);
        } else {
          setError(data2.msg);
        }
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("Error creating group: " + err.message);
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
      <GroupsTopBar
        onBack={() => navigate("/")}
        onSettings={() =>
          navigate("/groups/settings", {
            state: {
              groupID: activeGroup?.id,
              groupName: activeGroup?.groupname,
              members: activeGroup?.users,
              activeGroup,
            },
          })
        }
        occasion={activeOccasion?.occasionname || "No Occasion"}
      />

      <div className={styles.groupsContent}>
        <GroupsSidebar
          groups={groups}
          activeGroup={activeGroup}
          onGroupClick={handleGroupClick}
          onOccasionClick={handleOccasionClick}
          onAddOccasion={handleAddOccasion}
          onCreateGroup={handleCreateGroup}
        />
        <GroupsChat group={activeGroup} occasion={activeOccasion} />
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Groups;

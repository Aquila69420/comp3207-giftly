import React, { useState } from 'react';
import Sidebar from '../components/GroupsSidebar';
import Chat from '../components/GroupsChat';
import styles from '../styles/groups.module.css';

const Groups = () => {
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSubgroup, setActiveSubgroup] = useState(null);

  const groups = [
    {
      name: "Friends Group",
      subgroups: [
        { name: "A's Birthday" },
        { name: "B's Graduation" },
      ],
    },
    {
      name: "Family Group",
      subgroups: [
        { name: "Mom's Anniversary" },
        { name: "Dad's Birthday" },
      ],
    },
  ];

  const handleGroupClick = (group) => {
    setActiveGroup(group);
    setActiveSubgroup(null);
  };

  const handleSubgroupClick = (subgroup) => {
    setActiveSubgroup(subgroup);
  };

  return (
    <div className={styles.container}>
      <Sidebar
        groups={groups}
        onGroupClick={handleGroupClick}
        onSubgroupClick={handleSubgroupClick}
      />
      <Chat group={activeGroup} subgroup={activeSubgroup} />
    </div>
  );
};

export default Groups;

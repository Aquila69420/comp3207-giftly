import React from 'react';
import styles from '../styles/groups.module.css';

const GroupsSidebar = ({ groups, onGroupClick, onSubgroupClick }) => {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Groups</h2>
      <ul className={styles.groupList}>
        {groups.map((group, index) => (
          <li
            key={index}
            className={styles.groupItem}
            onClick={() => onGroupClick(group)}
          >
            {group.name}
            <ul>
              {group.subgroups?.map((subgroup, subIndex) => (
                <li
                  key={subIndex}
                  className={styles.subgroupItem}
                  onClick={() => onSubgroupClick(subgroup)}
                >
                  {subgroup.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupsSidebar;

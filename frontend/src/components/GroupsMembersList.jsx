import React from "react";
import { FaTimes } from "react-icons/fa";
import styles from "../styles/groups.module.css";

const GroupsMembersList = ({ member, onRemove, isCurrentUser }) => {
  return (
    <li className={styles.memberItem}>
      {member.username}
      {!isCurrentUser && (
        <FaTimes
          className={styles.removeIcon}
          title="Remove Member"
          onClick={onRemove}
        />
      )}
    </li>
  );
};

export default GroupsMembersList;

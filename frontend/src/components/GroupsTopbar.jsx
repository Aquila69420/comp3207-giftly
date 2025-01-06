// src/components/GroupsTopBar.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import CalendarModal from './CalendarModal';
import config from '../config';

// We'll assume you pass `userID` as props, so we can fetch the deadlines
// and we also accept an optional "onBack" callback or route to /home
const GroupsTopBar = ({ userID }) => {
  const navigate = useNavigate();
  const [deadlines, setDeadlines] = useState([]); // from /groups/calendar/get
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Next upcoming occasion (the earliest future date)
  const [upcomingOccasion, setUpcomingOccasion] = useState(null);

  useEffect(() => {
    if (!userID) return;
    fetchDeadlines(userID);
  }, [userID]);

  const fetchDeadlines = async (uid) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${config.backendURL}/groups/calendar/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: uid }),
      });
      const data = await res.json();
      if (data.deadlines) {
        setDeadlines(data.deadlines);
        computeNextOccasion(data.deadlines);
      }
    } catch (err) {
      setError("Failed to load deadlines: " + err.message);
    }
    setLoading(false);
  };

  // find the earliest upcoming date (after "now") from deadlines
  const computeNextOccasion = (deadlinesList) => {
    const now = new Date();
    // parse each date to a real Date obj
    const upcoming = deadlinesList
      .map((d) => {
        return {
          ...d,
          dateObj: new Date(d.occasiondate),
        };
      })
      // only future or same-day events
      .filter((d) => d.dateObj >= now)
      // sort ascending
      .sort((a, b) => a.dateObj - b.dateObj);

    if (upcoming.length > 0) {
      setUpcomingOccasion(upcoming[0]);
    } else {
      setUpcomingOccasion(null);
    }
  };

  const handleBack = () => {
    navigate("/home"); // or do onBack?.();
  };

  const handleUpcomingClick = () => {
    if (!loading) {
      setShowCalendar(true);
    }
  };

  return (
    <div style={styles.topBarContainer}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={handleBack}>
        {/* &larr; Back */}
        <IoMdArrowRoundBack size={25} />
      </button>

      {/* Center: upcoming occasion info */}
      <div style={styles.centerInfo}>
        {loading && <span>Loading...</span>}
        {!loading && !upcomingOccasion && <span>No upcoming occasions</span>}
        {!loading && upcomingOccasion && (
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={handleUpcomingClick}
            title="Show Calendar"
          > 
            {"Next Occasion: "}
            {upcomingOccasion.occasionname} 
            {" (" + upcomingOccasion.occasiondate + ")"}
          </span>
        )}
      </div>

      {/* Possibly something on the right side, but left blank for now */}
      <div style={styles.placeholderRight} />

      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarModal
          deadlines={deadlines}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
};

// Some inline styles just for the example
const styles = {
  topBarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f3f3",
    padding: "0.5rem 1rem",
    borderBottom: "1px solid #ccc",
  },
  backButton: {
    background: "transparent",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
  },
  centerInfo: {
    flex: 1,
    textAlign: "center",
    fontSize: "1rem",
  },
  placeholderRight: {
    width: "2rem", // just to keep spacing
  },
};

export default GroupsTopBar;

// src/components/CalendarModal.jsx
import React from "react";
import ReactCalendar from "react-calendar"; 
// or any library you want, e.g. react-big-calendar or fullcalendar

import "react-calendar/dist/Calendar.css";

const CalendarModal = ({ deadlines, onClose }) => {
  // "deadlines" is array of { occasionID, occasionname, occasiondate, groupID, groupname }

  // For convenience, build a map by day (yyyy-mm-dd) => array of occasions
  const eventsByDate = buildEventsByDate(deadlines);

  const tileContent = ({ date, view }) => {
    // date is a Date object, convert to yyyy-mm-dd
    if (view === "month") {
      const dateStr = toYMD(date);
      if (eventsByDate[dateStr]) {
        // highlight or show short text
        return (
          <div style={{ backgroundColor: "#007bff", color: "#fff", borderRadius: "4px", fontSize: "0.75rem" }}>
            {eventsByDate[dateStr].map((evt, idx) => (
              <div key={idx}>{evt.occasionname}</div>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const handleClickDay = (value, event) => {
    // value is the date object
    const dateStr = toYMD(value);
    if (eventsByDate[dateStr]) {
      // Maybe show a small popup or alert with details
      const details = eventsByDate[dateStr]
        .map((e) => `${e.occasionname} (Group: ${e.groupname})`)
        .join("\n");
      alert(details);
    }
  };

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Your Occasions Calendar</h2>
        <ReactCalendar
          onClickDay={handleClickDay}
          tileContent={tileContent}
        />
        <div style={styles.modalButtons}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

function buildEventsByDate(deadlines) {
  const map = {};
  deadlines.forEach((d) => {
    const dateStr = d.occasiondate; // or parse & reformat
    if (!map[dateStr]) {
      map[dateStr] = [];
    }
    map[dateStr].push(d);
  });
  return map;
}

function toYMD(date) {
  // convert Date object to yyyy-mm-dd
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const styles = {
  modalBackdrop: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    minWidth: "300px",
  },
  modalTitle: {
    marginTop: 0,
  },
  modalButtons: {
    textAlign: "right",
  },
};

export default CalendarModal;

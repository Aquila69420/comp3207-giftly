// src/components/WizardAddOccasionModal.jsx

import React, { useState } from "react";
import styles from "../styles/groups.module.css";
import config from "../config";

// Sample templates with default type
const OCCASION_TEMPLATES = [
  { label: "Birthday", type: "group_gifting" },
  { label: "Engagement", type: "group_gifting" },
  { label: "Wedding", type: "group_gifting" },
  { label: "Graduation", type: "group_gifting" },
  { label: "Anniversary", type: "group_gifting" },
  { label: "Baby Shower", type: "group_gifting" },
  { label: "Christmas", type: "exclusion_gifting" },
  { label: "Secret Santa", type: "secret_santa" },
  { label: "Housewarming", type: "group_gifting" },
  { label: "Retirement", type: "group_gifting" },
  { label: "Promotion", type: "group_gifting" },
  { label: "Other/Custom", type: null }, // we let them pick the type next
];

const OCCASION_TYPES = [
  { value: "secret_santa", label: "Secret Santa", description: "Each user randomly gifts another user (1-to-1 pairing)." },
  { value: "exclusion_gifting", label: "Exclusion Gifting", description: "Every user except one gifts that one user, repeated for each user." },
  { value: "group_gifting", label: "Group Gifting", description: "All or some members combine to gift specific recipient(s)." },
];

/**
 * WizardAddOccasionModal merges:
 *  - Step 1: pick template
 *  - Step 2: pick membership
 *  - Step 3: pick recipients (only if group_gifting)
 *  - Step 4: name & date
 *  - Then calls create_occasion + relevant function (secret_santa, group_gifting, or exclusion_gifting)
 *
 *  Props:
 *   - group (object) => the group doc
 *   - onClose() => close modal
 *   - onCreated(occasion) => callback after success
 */
const WizardAddOccasionModal = ({ group, onClose, onCreated }) => {
  const currentUserID = localStorage.getItem("userID");

  // wizard step index: 0,1,2,3
  const [stepIndex, setStepIndex] = useState(0);

  // user inputs
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [occasionType, setOccasionType] = useState(null);

  const [involvedUserIDs, setInvolvedUserIDs] = useState(() => {
    // By default, everyone is checked
    return group.users.map(u => u.userID);
  });

  const [recipientIDs, setRecipientIDs] = useState([]); // for group_gifting only

  const [occasionName, setOccasionName] = useState("");
  const [occasionDate, setOccasionDate] = useState("");

  // Step 1: pick template from OCCASION_TEMPLATES
  const renderStepTemplate = () => {
    return (
      <div>
        <h3>Choose an Occasion Template</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {OCCASION_TEMPLATES.map((tpl) => (
            <li key={tpl.label} style={{ margin: "0.5rem 0"}}>
              <button
                onClick={() => {
                  setSelectedTemplate(tpl);
                  // if tpl.type is not null => skip picking type
                  setOccasionType(tpl.type);
                  // go next
                  handleNext();
                }}
                style={{ cursor: "pointer", color: "white", backgroundColor: "#085b5e", border: "none", borderRadius: "10px" }}
              >
                {tpl.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Step 1b: If they picked "Other/Custom", let them pick from the 3 types
  const renderStepType = () => {
    if (selectedTemplate && selectedTemplate.type !== null) {
      // they already have a type, skip
      return null;
    }
    return (
      <div>
        <h3>Pick the Occasion Type</h3>
        {OCCASION_TYPES.map((t) => (
          <div key={t.value} style={{ marginBottom: "1rem" }}>
            <label>
              <input
                type="radio"
                name="occasionType"
                value={t.value}
                checked={occasionType === t.value}
                onChange={() => setOccasionType(t.value)}
              />
              <strong>{t.label}</strong> - <em>{t.description}</em>
            </label>
          </div>
        ))}
        <button
          disabled={!occasionType}
          onClick={handleNext}
          className={styles.modalCreateButton}
        >
          Next
        </button>
      </div>
    );
  };

  // Step 2: pick recipients if type=group_gifting
  const renderStepRecipients = () => {
    if (occasionType !== "group_gifting") {
      // skip
      return null;
    }
    return (
      <div>
        <h3>Select Recipient(s)</h3>
        <p>(These user(s) will receive the group gift. Others will chip in.)</p>
        <ul>
          {involvedUserIDs.map((uid) => {
            // find user doc
            const member = group.users.find(u => u.userID === uid);
            if (!member) return null;
            const checked = recipientIDs.includes(uid);
            return (
              <li key={uid}>
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) {
                        setRecipientIDs(recipientIDs.filter(r => r !== uid));
                      } else {
                        setRecipientIDs([...recipientIDs, uid]);
                      }
                    }}
                  />
                  {member.username}
                </label>
              </li>
            );
          })}
        </ul>
        <button onClick={handleNext} className={styles.modalCreateButton}>
          Next
        </button>
      </div>
    );
  };

  // Step 3: pick membership (everyone is default, current user is forced in)
  const renderStepInvolved = () => {
    return (
      <div>
      <h3>Select People Involved</h3>
      <ul>
        {group.users
        .filter(member => !recipientIDs.includes(member.userID)) // Exclude recipientIDs
        .map((member) => {
          const checked = involvedUserIDs.includes(member.userID);
          const disabled = (member.userID === currentUserID); // you can't uncheck yourself
          return (
          <li key={member.userID}>
            <label>
            <input
              type="checkbox"
              disabled={disabled}
              checked={checked}
              onChange={() => {
              if (disabled) return;
              if (checked) {
                // remove
                setInvolvedUserIDs(involvedUserIDs.filter(id => id !== member.userID));
              } else {
                // add
                setInvolvedUserIDs([...involvedUserIDs, member.userID]);
              }
              }}
            />
            {member.username}
            {disabled && " (You)"}
            </label>
          </li>
          );
        })}
      </ul>
      <button onClick={handleNext} className={styles.modalCreateButton}>
        Next
      </button>
      </div>
    );
  };

  // Step 4: name & date
  const renderStepNameDate = () => {
    return (
      <div>
        <h3>Occasion Name & Date</h3>
        {/* Suggest name based on recipients or template */}
        <input
          type="text"
          placeholder="Occasion Name"
          value={occasionName}
          onChange={(e) => setOccasionName(e.target.value)}
          style={{ display: "block", marginBottom: "0.5rem" }}
        />
        <input
          type="date"
          value={occasionDate}
          onChange={(e) => setOccasionDate(e.target.value)}
          style={{ display: "block", marginBottom: "0.5rem" }}
        />
        <button
          onClick={handleCreate}
          className={styles.modalCreateButton}
          disabled={!occasionName || !occasionDate}
        >
          Create
        </button>
      </div>
    );
  };

  const handleNext = () => {
    setStepIndex((prev) => prev + 1);
  };

  const handleCreate = async () => {
    // 1) create the occasion
    // 2) call the relevant function to create divisions
    console.log("Occasion Data:", occasionName, occasionDate, involvedUserIDs, occasionType, recipientIDs);
    try {
      // create occasion
      const res = await fetch(`${config.backendURL}/groups/occasions/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUserID,
          groupID: group.id,
          users: involvedUserIDs,
          occasionname: occasionName,
          occasiondate: occasionDate,
        }),
      });
      const data = await res.json();
      if (!data.result) {
        alert("Error creating occasion: " + data.msg);
        return;
      }
      const oc = data.occasion; // newly created occasion doc

      // now create divisions if needed
      if (occasionType === "secret_santa") {
        await callSecretSanta(oc.id);
      } else if (occasionType === "exclusion_gifting") {
        await callExclusionGifting(oc.id);
      } else if (occasionType === "group_gifting") {
        // pass the recipientIDs
        if (recipientIDs.length === 0) {
          alert("No recipients selected, but type=group_gifting");
          return;
        }
        await callGroupGifting(oc.id, recipientIDs);
      }

      alert("Occasion + Divisions created successfully!");
      onCreated?.(oc); // notify parent
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const callSecretSanta = async (occasionID) => {
    const res = await fetch(`${config.backendURL}/groups/secret_santa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userID: currentUserID,
        occasionID,
      }),
    });
    const data = await res.json();
    if (!data.result) throw new Error(data.msg);
  };

  const callExclusionGifting = async (occasionID) => {
    const res = await fetch(`${config.backendURL}/groups/exclusion_gifting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userID: currentUserID,
        occasionID,
      }),
    });
    const data = await res.json();
    if (!data.result) throw new Error(data.msg);
  };

  const callGroupGifting = async (occasionID, recipients) => {
    const res = await fetch(`${config.backendURL}/groups/group_gifting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userID: currentUserID,
        occasionID,
        recipients,
      }),
    });
    const data = await res.json();
    if (!data.result) throw new Error(data.msg);
  };

  // Render the wizard steps
  let stepContent = null;
  if (stepIndex === 0) {
    stepContent = renderStepTemplate();
  } else if (stepIndex === 1 && selectedTemplate && selectedTemplate.type === null && !occasionType) {
    // if user chose "Other/Custom" => pick type
    stepContent = renderStepType();
  } else if (
    // The second step might be recipients if type=group_gifting
    (stepIndex === 1 && selectedTemplate?.type !== null && selectedTemplate.type === "group_gifting") ||
    (stepIndex === 2 && occasionType === "group_gifting" && selectedTemplate?.type === null)
  ) {
    stepContent = renderStepRecipients();
  } else if (
    (stepIndex === 2 && selectedTemplate?.type !== null) ||
    (stepIndex === 3 && selectedTemplate?.type === null && occasionType)
  ) {
    // The third step is picking membership
    stepContent = renderStepInvolved();
  } else {
    // final step => name & date
    stepContent = renderStepNameDate();
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.modalCancelButton} style={{ float: "right" }}>
          X
        </button>
        {stepContent}
      </div>
    </div>
  );
};

export default WizardAddOccasionModal;

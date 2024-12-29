import React, { useState } from 'react';
import config from '../config';

function UpdateDetailsBlock({username}) {
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [notifications, setNotifications] = useState('');

  const handleUpdateDetails = async (field) => {
    console.log(`Updating ${field}...`);
    try {
        const response = await fetch(`${config.backendURL}/update_user_details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"username": username, "field": field, "newUsername": newUsername, "newPassword": newPassword, "newEmail": newEmail, "newPhone": newPhone, "newNotifications": notifications}),
        });
        const result = await response.json();
        console.log('Response from backend:', result);
    } catch (error) {
        console.error('Error sending update data:', error);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '38%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '850px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <input
          type="text"
          placeholder="Update Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '150px',
          }}
        />
        <input
          type="text"
          placeholder="Update Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '150px',
          }}
        />
        <input
          type="text"
          placeholder="Update Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '150px',
          }}
        />
        <input
          type="text"
          placeholder="Update Phone"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '150px',
          }}
        />
        <select
          value={notifications}
          onChange={(e) => setNotifications(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '150px',
          }}
        >
          <option value="" disabled>
            -- Opt for Notifications --
          </option>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <button
          onClick={() => handleUpdateDetails('password')}
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '150px',
          }}
        >
          Update Password
        </button>
        <button
          onClick={() => handleUpdateDetails('username')}
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '150px',
          }}
        >
          Update Username
        </button>
        <button
          onClick={() => handleUpdateDetails('email')}
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '150px',
          }}
        >
          Update Email
        </button>
        <button
          onClick={() => handleUpdateDetails('phone')}
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '150px',
          }}
        >
          Update Phone
        </button>
        <button
          onClick={() => handleUpdateDetails('notifications')}
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '150px',
          }}
        >
          Update Notifications
        </button>
      </div>
    </div>
  );
}

export default UpdateDetailsBlock;

import React from 'react';

function SendNotifications({username}) {
  const handleSendNotification = async () => {
    console.log('Sending notification to user', username);
    const notification_message = "This is a test"
    try {
        const response = await fetch('http://localhost:5000/send_notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"username": username, "notification": notification_message}),
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
        top: '10px', // Adjusted to position it above the wishlist component
        left: '320px',
        width: '140px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <button
        onClick={handleSendNotification}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        Send Notification
      </button>
    </div>
  );
}

export default SendNotifications;

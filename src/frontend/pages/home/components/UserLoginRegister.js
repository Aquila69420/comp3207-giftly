import React, { useState } from 'react';

function UserLoginRegister({ setUsername }) {
  const [usernameLogin, setUsernameLogin] = useState('');
  const [usernameRegister, setUsernameRegister] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [passwordRegister, setPasswordRegister] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notifications, setNotifications] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: usernameLogin, passwordLogin }),
      });
      const result = await response.json();
      console.log('Login Response:', result);

      if (result.response === "User successfully logged in.") {
        setUsernameLogin(usernameLogin);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: usernameRegister, password: passwordRegister, email: email, phone: phone, notifications: notifications }),
      });
      const result = await response.json();
      console.log('Register Response:', result);
      if (result.response === "User successfully registered.") {
        setUsernameRegister(usernameRegister);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <input
        type="text"
        placeholder="Username"
        value={usernameLogin}
        onChange={(e) => setUsernameLogin(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '96%',
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={passwordLogin}
        onChange={(e) => setPasswordLogin(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '96%',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={handleLogin}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '5px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
          }}
        >
          Login
        </button>
      </div>
    <div
        style={{
          position: 'absolute',
          top: '200px',
          right: '1px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
    >
      <input
        type="text"
        placeholder="Username"
        value={usernameRegister}
        onChange={(e) => setUsernameRegister(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '96%',
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={passwordRegister}
        onChange={(e) => setPasswordRegister(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '96%',
        }}
      />
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '96%',
        }}
      />
      <input
        type="text"
        placeholder="Phone number (ie: +44 7765xxxxxx)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '96%',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginTop: '10px', // Add some spacing between the select box and the button
        }}
      >
        <select
          value={notifications}
          onChange={(e) => setNotifications(e.target.value === 'true')}
          style={{
            padding: '8px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '100%',
            marginBottom: '10px', // Add spacing to separate it from the button
          }}
        >
          <option value="" disabled>-- Opt for Notifications --</option>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
        <button
          onClick={handleRegister}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: "10px",
            borderRadius: '5px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            width: '20%',
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center',
          }}
        >
          Register
        </button>
      </div>
      </div>
    </div>
  );
}

export default UserLoginRegister;

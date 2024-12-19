import React, { useState } from 'react';

function AuthForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      console.log('Login Response:', result);
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
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      console.log('Register Response:', result);
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
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '100%',
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '100%',
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
        <button
          onClick={handleRegister}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '5px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default AuthForm;
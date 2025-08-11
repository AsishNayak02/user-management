'use client';
import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/login', { username, password });
      setToken(res.data.accessToken);
      setMessage('Login successful');
    } catch {
      setMessage('Login failed');
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await axios.get('/api/admin-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(JSON.stringify(res.data));
    } catch {
      setMessage('Not authorized');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button onClick={handleLogin}>Login</button>
      <button onClick={fetchAdminData}>Fetch Admin Data</button>
      <p>{message}</p>
    </div>
  );
}

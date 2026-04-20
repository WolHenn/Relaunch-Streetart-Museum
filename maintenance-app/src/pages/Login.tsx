// src/pages/Login.tsx
import { useState } from 'react';

export default function Login({ setToken }: { setToken: (t: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8082/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } else {
      alert('Login fehlgeschlagen!');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Maintenance Login</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Benutzername" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
        />
        <input 
          type="password" 
          placeholder="Passwort" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
        />
        <button type="submit">Einloggen</button>
      </form>
    </div>
  );
}
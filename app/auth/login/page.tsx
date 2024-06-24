'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login } = useAuth(); // Mengambil login dari useAuth
  const { isLoggedIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Panggil fungsi login dari useAuth untuk mengatur status login menjadi true
      await login(username, password);

      // Handle successful login logic here
    } catch (error) {
      // Handle error jika login gagal
      alert(error);
      console.error('Login error:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Username: Yes</label>
            <input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.5rem', width: '100%' }}>Login</button>
        </form>
      </div>
    );
  } else {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Username: Not</label>
            <input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.5rem', width: '100%' }}>Login</button>
        </form>
      </div>
    );
  }
};

const LoginPage: React.FC = () => {
  return(
    <AuthProvider>
      <Login/>
    </AuthProvider>
  )
};

export default LoginPage;

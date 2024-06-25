'use client';

import { useState, useEffect } from 'react';
import { loginUser } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

// Fungsi untuk mengenkripsi data sebelum disimpan ke cookie
const encryptData = (data: any): string => {
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret_key').toString();
  return encryptedData;
};

const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const {user} = await loginUser(username, password);
      const encryptedUser = encryptData(user);
      Cookies.set('user', encryptedUser, { expires: 1 }); // Simpan data pengguna di cookie selama 1 hari
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to login. Please try again.');
      console.error('Login error:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userCookie = Cookies.get('user');
        if (userCookie) {
          const decryptedUser = decryptData(userCookie);
          // Jika user ada, langsung arahkan ke halaman Dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Handle error, misalnya dengan menampilkan pesan kesalahan atau melakukan tindakan lainnya
      }
    };
    fetchUser();
  }, []);

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username</label>
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
};

export default Login;

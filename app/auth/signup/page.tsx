'use client';

import { useState, useEffect } from 'react';
import { handleSignUp } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [retypePassword, setRetypePassword] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSignUp(username, email, password, retypePassword);
      setIsSuccess(true); // Set success state to true
      router.push('/dashboard');
    } catch (error) {
      alert(error);
      console.error('Error submitting form:', error);
      // Handle error state or display error message
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
      <h2>Signup2</h2>
      <form onSubmit={handleSignUpSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div style={{ marginBottom: '1rem' }}>
          <label>Retype Password:</label>
          <input
            type="password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem', width: '100%' }}>Signup</button>
      </form>
    </div>
  );
};

export default Signup;

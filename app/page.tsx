'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';

const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

const Home: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userCookie = Cookies.get('user');
        if (userCookie) {
          const decryptedUser = decryptData(userCookie);
          // Jika user ada, langsung arahkan ke halaman Dashboard
          router.push('/dashboard');
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Handle error, misalnya dengan menampilkan pesan kesalahan atau melakukan tindakan lainnya
      }
    };
    fetchUser();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1>Welcome to My Next.js App</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/auth/login" style={{ padding: '1rem', border: '1px solid black', borderRadius: '4px' }}>
          Login
        </Link>
        <Link href="/auth/signup" style={{ padding: '1rem', border: '1px solid black', borderRadius: '4px' }}>
          Signup
        </Link>
      </div>
    </div>
  );
}

export default Home;

'use client'

import CryptoJS from 'crypto-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const decryptData = (encryptedData: string): any => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  };

const Dashboard: React.FC = () => {

    const [user, setUser] = useState<any | null>(null);
    const router = useRouter();
  
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const userCookie = Cookies.get('user');
          if (userCookie) {
            const decryptedUser = decryptData(userCookie);
            setUser(decryptedUser);
          } else {
            // Jika tidak ada cookie user, redirect ke halaman login
            router.push('/auth/login');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          // Handle error, misalnya dengan menampilkan pesan kesalahan atau melakukan tindakan lainnya
          router.push('/auth/login'); // Jika terjadi kesalahan, tetap arahkan ke halaman login
        }
      };
      fetchUser();
    }, []);

    const handleLogout = () => {
        Cookies.remove('user'); // Menghapus cookie 'user'
        router.push('/auth/login'); // Redirect ke halaman login setelah logout
    };
  
    if (!user) {
      return null; // Menampilkan null jika sedang menunggu pengambilan data user dari cookie
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            <h1>Welcome to My Next.js App: {user.username}</h1>
            <button onClick={handleLogout} style={{ padding: '0.5rem', marginTop: '1rem' }}>
            Logout
            </button>
        </div>
    );
}

export default Dashboard;
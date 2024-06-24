'use client';

import { getUsers } from '@/lib/data';
import Link from 'next/link';

const Home: React.FC = async () => {
  const users = await getUsers();
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
    {users.map((users, index) => (
      <h6>{users.username}</h6>
    ))}
  </div>
  );
}

export default Home;

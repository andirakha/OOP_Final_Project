'use client';

import Link from 'next/link';

const Home: React.FC = async () => {
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

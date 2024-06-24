'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const Home: React.FC = () => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
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
  } else {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1>Welcome to My Next.js App Not</h1>
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
};

const HomePage: React.FC = () => {
  return(
    <AuthProvider>
      <Home/>
    </AuthProvider>
  )
}

export default HomePage;

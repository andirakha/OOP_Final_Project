'use client';

import { useState } from 'react';
import { handleSignUp } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [retypePassword, setRetypePassword] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSignUp(username, email, password, retypePassword);
      setIsSuccess(true); // Set success state to true
      router.push('/');
    } catch (error) {
      alert(error);
      console.error('Error submitting form:', error);
      // Handle error state or display error message
    }
  };
  
  if (isLoggedIn) {
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
  } else {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
        <h2>Signup2</h2>
        <form onSubmit={handleSignUpSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Username: Not</label>
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
  }
};

const SignupPage: React.FC = () => {
  return(
    <AuthProvider>
      <Signup/>
    </AuthProvider>
  )
}

export default SignupPage;

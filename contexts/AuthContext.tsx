// AuthContext.tsx
import { checkIdCart, loginUser } from '@/lib/actions';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Create a new context
const AuthContext = createContext<{
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
}>({
  isLoggedIn: false,
  login: async () => {},
});

type AuthProviderProps = {
    children: ReactNode; // Menggunakan ReactNode untuk menentukan bahwa children bisa berupa apa saja yang valid dalam JSX
  };

// Export provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // Check localStorage for login status on initial load
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    return storedLoggedIn ? JSON.parse(storedLoggedIn) : false;
  });
  const router = useRouter();

  // Update localStorage when isLoggedIn changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  const login = async (username: string, password: string) => {
    try {
        // Perform login logic (e.g., API call)
        // Assuming loginUser and checkIdCart are imported properly
        await loginUser(username, password);
        await checkIdCart(username);
        setIsLoggedIn(true);
        router.push('/');
        
      } catch (error) {
        throw new Error('Login failed. Please check your credentials.');
      }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
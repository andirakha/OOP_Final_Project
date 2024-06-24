import { checkIdCart, loginUser } from '@/lib/actions';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

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
    // Check cookies for login status on initial load
    const storedLoggedIn = Cookies.get('isLoggedIn');
    return storedLoggedIn ? JSON.parse(storedLoggedIn) : false;
  });
  const router = useRouter();

  // Update cookies when isLoggedIn changes
  useEffect(() => {
    Cookies.set('isLoggedIn', JSON.stringify(isLoggedIn));
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

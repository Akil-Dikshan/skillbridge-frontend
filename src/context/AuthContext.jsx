import { createContext, useState, useEffect } from 'react';
import { validateToken } from '@/api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const userData = await validateToken();
        setUser(userData);
      } catch (error) {
        console.error('Token validation failed', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginContext = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logoutContext = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};

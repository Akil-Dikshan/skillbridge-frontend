import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const payload = decodeJwt(token);
      if (!payload || payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setUser(null);
      } else {
        setUser({ userId: payload.userId, email: payload.sub, roleType: payload.role });
      }
      setIsLoading(false);
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

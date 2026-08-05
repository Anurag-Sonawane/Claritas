import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check sessionStorage and localStorage on mount
  useEffect(() => {
    async function initAuth() {
      const sessionUser = sessionStorage.getItem('claritas_user');
      const localUser = localStorage.getItem('claritas_user');

      let parsedUser = null;
      if (sessionUser) {
        try { parsedUser = JSON.parse(sessionUser); } catch (e) { sessionStorage.removeItem('claritas_user'); }
      } else if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          if (parsed && parsed.rememberMe) parsedUser = parsed;
          else localStorage.removeItem('claritas_user');
        } catch (e) { localStorage.removeItem('claritas_user'); }
      }

      if (parsedUser) {
        setUser(parsedUser);
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const { user: authenticatedUser, token } = await api.login(email, password);
      const userWithPersistence = { ...authenticatedUser, rememberMe };

      setUser(userWithPersistence);

      localStorage.removeItem('claritas_user');
      sessionStorage.removeItem('claritas_user');
      localStorage.removeItem('claritas_token');
      sessionStorage.removeItem('claritas_token');

      if (rememberMe) {
        localStorage.setItem('claritas_user', JSON.stringify(userWithPersistence));
        localStorage.setItem('claritas_token', token);
      } else {
        sessionStorage.setItem('claritas_user', JSON.stringify(userWithPersistence));
        sessionStorage.setItem('claritas_token', token);
      }

      return userWithPersistence;
    } catch (err) {
      throw new Error(err.message || 'Authentication failed');
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('claritas_user');
    sessionStorage.removeItem('claritas_user');
    localStorage.removeItem('claritas_token');
    sessionStorage.removeItem('claritas_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

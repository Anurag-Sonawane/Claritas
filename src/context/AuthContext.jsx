/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { clearAuthStorage } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session against the backend on mount
  useEffect(() => {
    async function initAuth() {
      const sessionUser = sessionStorage.getItem('claritas_user');
      const localUser = localStorage.getItem('claritas_user');
      const token = localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token');

      let parsedUser = null;
      if (sessionUser) {
        try { parsedUser = JSON.parse(sessionUser); } catch { sessionStorage.removeItem('claritas_user'); }
      } else if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          if (parsed && parsed.rememberMe) parsedUser = parsed;
          else localStorage.removeItem('claritas_user');
        } catch { localStorage.removeItem('claritas_user'); }
      }

      if (parsedUser && token) {
        try {
          // Verify with live backend
          const verifiedUser = await api.getCurrentUser();
          const merged = {
            ...parsedUser,
            ...verifiedUser,
            avatarUrl: verifiedUser.avatarUrl || verifiedUser.avatar_url || parsedUser.avatarUrl || parsedUser.avatar_url,
          };
          setUser(merged);
        } catch (err) {
          console.warn('Session verification notice:', err.message);
          // If token expired or invalid and couldn't be refreshed
          clearAuthStorage();
          setUser(null);
        }
      } else {
        clearAuthStorage();
        setUser(null);
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const data = await api.login(email, password, rememberMe);
      const userWithPersistence = {
        ...data.user,
        avatarUrl: data.user.avatarUrl || data.user.avatar_url,
        rememberMe
      };

      setUser(userWithPersistence);

      if (rememberMe) {
        localStorage.setItem('claritas_user', JSON.stringify(userWithPersistence));
      } else {
        sessionStorage.setItem('claritas_user', JSON.stringify(userWithPersistence));
      }

      return userWithPersistence;
    } catch (err) {
      throw new Error(err.message || 'Authentication failed');
    }
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      if (!prev) return prev;
      const merged = {
        ...prev,
        ...updatedFields,
        avatarUrl: updatedFields.avatarUrl || updatedFields.avatar_url || prev.avatarUrl || prev.avatar_url,
      };
      if (prev.rememberMe) {
        localStorage.setItem('claritas_user', JSON.stringify(merged));
      } else {
        sessionStorage.setItem('claritas_user', JSON.stringify(merged));
      }
      return merged;
    });
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      setUser(null);
      clearAuthStorage();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUser }}>
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

export default AuthContext;

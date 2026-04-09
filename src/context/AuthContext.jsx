import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('claritas_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password !== 'password') {
      throw new Error('Invalid credentials. Hint: use "password"');
    }

    let authenticatedUser = null;

    if (email === 'admin@claritas.edu') {
      authenticatedUser = {
        id: 'user-001',
        name: 'Aarav Sharma',
        email: 'admin@claritas.edu',
        role: 'admin',
        roleName: 'Super Admin',
        avatarUrl: 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=f87171&color=fff&rounded=true',
      };
    } else if (email === 'student@claritas.edu') {
      authenticatedUser = {
        id: 'student-001',
        name: 'Anurag Sonawane',
        email: 'student@claritas.edu',
        role: 'student',
        roleName: 'Student',
        avatarUrl: 'https://ui-avatars.com/api/?name=Anurag+Sonawane&background=2ec4f1&color=fff&rounded=true',
      };
    } else {
      throw new Error('User not found. Use admin@claritas.edu or student@claritas.edu');
    }

    setUser(authenticatedUser);
    localStorage.setItem('claritas_user', JSON.stringify(authenticatedUser));
    return authenticatedUser;
  };

  const logout = async () => {
    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    setUser(null);
    localStorage.removeItem('claritas_user');
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

import React, { useEffect, useState, createContext, useContext } from 'react';
type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('specMeetUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);
  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be an API call in a real application
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock user data
      const mockUser = {
        id: '1',
        name: email.split('@')[0],
        email,
        isAdmin: email.includes('admin')
      };
      setUser(mockUser);
      localStorage.setItem('specMeetUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  // Mock register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be an API call in a real application
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock user data
      const mockUser = {
        id: '1',
        name,
        email,
        isAdmin: false
      };
      setUser(mockUser);
      localStorage.setItem('specMeetUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('specMeetUser');
  };
  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
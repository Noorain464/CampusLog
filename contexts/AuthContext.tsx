import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, removeToken, getToken } from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await getToken();
      if (storedToken) {
        setTokenState(storedToken);
        // Try to get user profile
        try {
          const response = await authAPI.getProfile();
          if (response.success) {
            setUser(response.user);
          }
        } catch (error) {
          // Token might be invalid, clear it
          await removeToken();
          setTokenState(null);
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        await setToken(response.token);
        setTokenState(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role = 'student') => {
    try {
      const response = await authAPI.register(name, email, password, role);
      if (response.success) {
        await setToken(response.token);
        setTokenState(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await removeToken();
      setTokenState(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


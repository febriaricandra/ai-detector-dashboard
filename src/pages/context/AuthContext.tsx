import React, { createContext, useContext, useState, useEffect } from 'react';
import Api from '../../utils/Api';

interface User {
  username: string;
  email: string;
  id?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data from API
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await Api.get('/users/profile');
      console.log('User data fetched:', response.data);
      if (response.status === 200) {
        const userData = response.data;
        setUser(userData);
      } else {
        // Token invalid, hapus dari localStorage
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await Api.post('/login', {
        email: credentials.email,
        password: credentials.password,
      });

      // Assuming the API returns a token and user data
      const { token, user: userData } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user data in context
      setUser(userData);

      console.log('Login successful:', userData);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Login error:', error.message);
      } else {
        console.error('Login error:', error);
      }
      // Re-throw error untuk handling di component
      throw error;
    }
  };

  const logout = async () => {
    //delete token from localStorage
    localStorage.removeItem('token');
    setUser(null);
    //redirect to login page
    window.location.href = '/';
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
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
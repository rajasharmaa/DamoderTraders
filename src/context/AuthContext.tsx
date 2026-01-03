// context/AuthContext.tsx - Updated version
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      console.log('API Base URL:', import.meta.env.VITE_API_URL);
      
      // First test connection
      const testResult = await api.test();
      console.log('Test connection:', testResult);
      
      const data = await api.auth.status();
      console.log('Auth status response:', data);
      
      if (data?.authenticated && data.user) {
        console.log('✅ User authenticated:', data.user);
        setUser(data.user);
      } else {
        console.log('❌ No authenticated user');
        setUser(null);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // Check if it's a CORS error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('CORS/Network error detected. Check server configuration.');
      }
      
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await api.auth.login({ email, password });
      console.log('Login response:', response);
      
      // Re-check auth status after successful login
      await checkAuth();
      
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message === 'ACCOUNT_NOT_FOUND') {
        errorMessage = 'No account found with this email. Please register first.';
      } else if (error.message === 'INVALID_PASSWORD') {
        errorMessage = 'Invalid password. Please try again.';
      } else if (error.message === 'AUTHENTICATION_FAILED') {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please try again later.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await api.auth.checkEmail(email);
      return response?.exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    try {
      console.log('📝 Registering user:', data.email);
      const response = await api.auth.register(data);
      console.log('Registration response:', response);
      
      await checkAuth();
      
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = error.message || 'Registration failed';
      
      if (errorMessage.includes('already exists') || 
          errorMessage.includes('duplicate') ||
          errorMessage.includes('EMAIL_ALREADY_EXISTS')) {
        throw new Error('An account with this email already exists.');
      } else if (errorMessage.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please try again later.');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('🚪 Logging out...');
      await api.auth.logout();
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add user data to context value for debugging
  useEffect(() => {
    console.log('👤 Current user state:', user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      checkAuth,
      checkEmailExists 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

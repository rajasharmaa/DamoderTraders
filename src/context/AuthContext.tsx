// context/AuthContext.tsx - Complete Fixed Version
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
  login: (email: string, password: string) => Promise<{ message: string; user: any }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ message: string; user: any }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking authentication status...');
      console.log('API Base URL:', import.meta.env.VITE_API_URL);
      console.log('Current origin:', window.location.origin);
      
      // First test the connection
      try {
        const testResult = await api.test();
        console.log('Connection test:', testResult);
      } catch (testError) {
        console.warn('Connection test failed:', testError);
      }
      
      // Check auth status
      const data = await api.auth.status();
      console.log('Auth status response:', data);
      
      if (data?.authenticated && data.user) {
        console.log('✅ User authenticated:', data.user);
        setUser(data.user);
        return true;
      } else {
        console.log('❌ No authenticated user');
        setUser(null);
        return false;
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('Network/CORS error. Check server configuration.');
      }
      
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('Cookies before login:', document.cookie);
      
      const response = await api.auth.login({ email, password });
      console.log('Login API response:', response);
      console.log('Cookies after API call:', document.cookie);
      
      // Wait a moment for cookies to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the session was established
      const isAuthenticated = await checkAuth();
      
      if (!isAuthenticated) {
        console.error('❌ Login API succeeded but session not established');
        console.error('Current cookies:', document.cookie);
        
        // Try debug endpoint to see what's happening
        try {
          const debug = await api.debug.cookies();
          console.error('Debug cookie info:', debug);
        } catch (debugError) {
          console.error('Debug endpoint failed:', debugError);
        }
        
        throw new Error('Login succeeded but session could not be established. Please try clearing cookies and logging in again.');
      }
      
      console.log('✅ Login and session established successfully');
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      
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
      } else if (error.message.includes('session could not be established')) {
        errorMessage = 'Login succeeded but session could not be established. This may be a cookie issue. Try: 1) Clear cookies for this site 2) Use a private/incognito window 3) Check if cookies are enabled';
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
      console.log('Registration API response:', response);
      
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify registration created a session
      const isAuthenticated = await checkAuth();
      
      if (!isAuthenticated) {
        console.warn('Registration succeeded but session not established');
        // Still return success since user was created
      }
      
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
      console.log('Cookies before logout:', document.cookie);
      
      await api.auth.logout();
      
      // Clear local state
      setUser(null);
      
      // Clear API cache
      api.utils.clearCache();
      
      // Wait for cookies to be cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ Logout successful');
      console.log('Cookies after logout:', document.cookie);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      api.utils.clearCache();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Debug: Log user state changes
  useEffect(() => {
    console.log('👤 Auth Context - User state updated:', user);
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

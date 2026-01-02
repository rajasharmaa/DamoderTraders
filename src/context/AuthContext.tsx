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
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  checkEmailExists: (email: string) => Promise<boolean>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const checkAuth = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking authentication status...');
      // Force no-cache for auth check
      const data = await apiRequest('/auth/status', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('Auth status response:', data);
      
      if (data && data.authenticated && data.user) {
        console.log('✅ User authenticated:', data.user);
        setUser(data.user);
        setIsInitialized(true);
        return true;
      } else {
        console.log('❌ No authenticated user');
        setUser(null);
        setIsInitialized(true);
        return false;
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsInitialized(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Custom apiRequest with enhanced error handling
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`https://damodertraders.onrender.com/api${endpoint}`, {
        ...options,
        credentials: 'include', // IMPORTANT
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      
      // Clear any existing session first
      await api.auth.logout().catch(() => {});
      
      // Add small delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await api.auth.login({ email, password });
      console.log('Login response:', response);
      
      // Wait for session to be saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check auth status
      const isAuthenticated = await checkAuth();
      
      if (!isAuthenticated) {
        throw new Error('Login successful but session not established');
      }
      
      console.log('✅ Login and session established successfully');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear any partial auth state
      setUser(null);
      
      let errorMessage = error.message || 'Login failed';
      
      // Handle specific error cases
      if (errorMessage === 'ACCOUNT_NOT_FOUND') {
        throw new Error('ACCOUNT_NOT_FOUND');
      } else if (errorMessage === 'INVALID_PASSWORD') {
        throw new Error('INVALID_PASSWORD');
      } else if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        throw new Error('NETWORK_ERROR');
      } else {
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await api.auth.checkEmail(email);
      return response.exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    try {
      console.log('📝 Registering user:', data.email);
      
      // Clear any existing session
      await api.auth.logout().catch(() => {});
      
      await api.auth.register(data);
      
      // Wait and check auth
      await new Promise(resolve => setTimeout(resolve, 500));
      await checkAuth();
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = error.message || 'Registration failed';
      
      if (errorMessage.includes('already exists') || 
          errorMessage.includes('duplicate') ||
          errorMessage.includes('EMAIL_ALREADY_EXISTS')) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      } else {
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('🚪 Logging out...');
      
      // Call server logout
      await api.auth.logout();
      
      // Clear local state immediately
      setUser(null);
      
      // Clear any cached data
      api.utils.clearCache();
      
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
  };

  // Add user data to context value for debugging
  useEffect(() => {
    console.log('👤 Current user state:', user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isInitialized,
      login, 
      register, 
      logout, 
      checkAuth,
      checkEmailExists,
      clearAuth
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

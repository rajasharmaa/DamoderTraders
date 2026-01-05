// context/AuthContext.tsx - PRODUCTION READY
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface LoginResponse {
  message: string;
  user: User;
  csrfToken?: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
  csrfToken?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  checkEmailExists: (email: string) => Promise<boolean>;
  clearAuth: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const LOGIN_TIMEOUT = 30000; // 30 seconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const authCheckInProgress = useRef(false);
  const authCheckPromise = useRef<Promise<boolean> | null>(null);
  const sessionCheckInterval = useRef<ReturnType<typeof setInterval>>();
  const loginTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearAuth = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    api.utils.clearAuthCache();
    localStorage.removeItem('auth_redirect');
    sessionStorage.removeItem('auth_temp_data');
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    // Return existing promise if check is already in progress
    if (authCheckInProgress.current && authCheckPromise.current) {
      return authCheckPromise.current;
    }
    
    authCheckInProgress.current = true;
    
    const authPromise = (async () => {
      try {
        const data = await api.auth.status() as AuthStatusResponse;
        
        if (data?.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setError(null);
          return true;
        } else {
          clearAuth();
          return false;
        }
      } catch (error) {
        // Only clear auth for specific session errors
        if (error instanceof Error && (
          error.message === 'SESSION_EXPIRED' ||
          error.message === 'AUTHENTICATION_FAILED' ||
          error.message === 'FORBIDDEN'
        )) {
          clearAuth();
        }
        return false;
      } finally {
        authCheckInProgress.current = false;
        authCheckPromise.current = null;
      }
    })();
    
    authCheckPromise.current = authPromise;
    return authPromise;
  }, [clearAuth]);

  // Initialize auth on mount (runs once)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
    };
  }, [checkAuth]);

  // Setup session check interval when authenticated (separate effect)
  useEffect(() => {
    if (!isAuthenticated) {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = undefined;
      }
      return;
    }
    
    // Only setup interval if we're authenticated and don't have one already
    if (!sessionCheckInterval.current) {
      sessionCheckInterval.current = setInterval(() => {
        checkAuth().catch(() => {
          // Silent fail for background checks
        });
      }, SESSION_CHECK_INTERVAL);
    }
    
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = undefined;
      }
    };
  }, [isAuthenticated, checkAuth]);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    
    // Clear any existing timeout
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
    }
    
    let shouldRestoreSession = false;
    let originalAuthState = { user, isAuthenticated };
    
    // Set login timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      loginTimeoutRef.current = setTimeout(() => {
        reject(new Error('LOGIN_TIMEOUT'));
      }, LOGIN_TIMEOUT);
    });

    try {
      // Don't clear auth yet - only clear CSRF cache
      api.utils.clearAuthCache();
      
      const response = await Promise.race([
        api.auth.login({ email, password }) as Promise<LoginResponse>,
        timeoutPromise
      ]);
      
      // Clear timeout since login succeeded
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = undefined;
      }
      
      // Check auth status to verify session was established
      const authVerified = await checkAuth();
      
      if (!authVerified) {
        shouldRestoreSession = true;
        throw new Error('SESSION_NOT_ESTABLISHED');
      }
      
      return response;
    } catch (error: any) {
      // Clear timeout on error
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = undefined;
      }
      
      // Restore original auth state if login failed but we had a valid session
      if (shouldRestoreSession && originalAuthState.isAuthenticated && originalAuthState.user) {
        setUser(originalAuthState.user);
        setIsAuthenticated(true);
      } else if (error.message === 'SESSION_NOT_ESTABLISHED') {
        // Only clear if session truly wasn't established
        clearAuth();
      }
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message === 'AUTHENTICATION_FAILED') {
        errorMessage = 'Invalid email or password.';
      } else if (error.message === 'LOGIN_TIMEOUT') {
        errorMessage = 'Login timeout. Please try again.';
      } else if (error.message === 'SESSION_NOT_ESTABLISHED') {
        errorMessage = 'Login succeeded but session could not be established.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Too many attempts. Please wait a moment before trying again.';
      } else if (error.message === 'SESSION_EXPIRED') {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.message === 'FORBIDDEN') {
        errorMessage = 'Access denied. Please contact support.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      await api.auth.checkEmail(email);
      return true;
    } catch (error: any) {
      // Only return false for specific "not found" errors
      if (error.message === 'EMAIL_NOT_FOUND' || error.message.includes('not found')) {
        return false;
      }
      // Re-throw network or server errors
      throw error;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }): Promise<RegisterResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Basic client-side validation
      if (data.password.length < 8) {
        throw new Error('PASSWORD_TOO_SHORT');
      }
      
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('INVALID_EMAIL');
      }
      
      const response = await api.auth.register(data) as RegisterResponse;
      
      // Don't assume auto-login - explicitly check auth status
      const isNowAuthenticated = await checkAuth();
      
      if (!isNowAuthenticated) {
        // Registration succeeded but no session created
        // This is normal - user needs to log in
        console.log('Registration successful - please log in');
      }
      
      return response;
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message === 'PASSWORD_TOO_SHORT') {
        errorMessage = 'Password must be at least 8 characters long.';
      } else if (error.message === 'INVALID_EMAIL') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('already exists') || 
                 error.message.includes('duplicate') ||
                 error.message === 'EMAIL_EXISTS') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Too many attempts. Please wait a moment before trying again.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Silent fail - we'll clear local state anyway
    } finally {
      clearAuth();
      setIsLoading(false);
    }
  };

  // Handle auth errors globally
  useEffect(() => {
    // Guard for SSR
    if (typeof window === 'undefined') return;
    
    const handleAuthError = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.error === 'SESSION_EXPIRED') {
        clearAuth();
        setError('Your session has expired. Please log in again.');
      }
    };

    window.addEventListener('auth-error', handleAuthError as EventListener);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError as EventListener);
    };
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      isAuthenticated,
      login, 
      register, 
      logout, 
      checkAuth,
      checkEmailExists,
      clearAuth,
      error
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

// Custom hook for auth-protected components (SSR-safe)
export function useAuthGuard(redirectOnFail = true) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  
  useEffect(() => {
    // Guard for SSR
    if (typeof window === 'undefined') return;
    
    if (!isLoading && !isAuthenticated) {
      checkAuth().then(isAuth => {
        if (!isAuth && redirectOnFail) {
          // Store current location for redirect back after login
          const redirectPath = window.location.pathname + window.location.search;
          localStorage.setItem('auth_redirect', redirectPath);
          window.location.href = '/login';
        }
      });
    }
  }, [isAuthenticated, isLoading, checkAuth, redirectOnFail]);
  
  return { isAuthenticated, isLoading };
}

// Optional: Helper to dispatch auth errors from API layer
export function dispatchAuthError(errorType: 'SESSION_EXPIRED' | 'FORBIDDEN' | 'AUTHENTICATION_FAILED') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-error', { 
      detail: { error: errorType } 
    }));
  }
}

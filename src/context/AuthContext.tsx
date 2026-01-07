// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

// ✅ FIXED: Simplified interfaces to match API response
interface LoginResponse {
  user: User;
  rememberToken?: string;
}

interface RegisterResponse {
  user: User;
}

interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
  csrfToken?: string;
  fromRememberToken?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  checkEmailExists: (email: string) => Promise<boolean>;
  clearAuth: () => void;
  error: string | null;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;
const LOGIN_TIMEOUT = 30000;
const REMEMBER_TOKEN_KEY = 'dt_remember_token';
const REMEMBER_ME_KEY = 'dt_remember_me';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMeState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(REMEMBER_ME_KEY);
    return saved === 'true';
  });
  
  const authCheckInProgress = useRef(false);
  const authCheckPromise = useRef<Promise<boolean> | null>(null);
  const sessionCheckInterval = useRef<ReturnType<typeof setInterval>>();
  const loginTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const setRememberMe = useCallback((value: boolean) => {
    setRememberMeState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(REMEMBER_ME_KEY, value.toString());
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    api.utils.clearAuthCache();
    localStorage.removeItem('auth_redirect');
    sessionStorage.removeItem('auth_temp_data');
    localStorage.removeItem(REMEMBER_TOKEN_KEY);
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (authCheckInProgress.current && authCheckPromise.current) {
      return authCheckPromise.current;
    }
    
    authCheckInProgress.current = true;
    
    const authPromise = (async () => {
      try {
        const rememberToken = localStorage.getItem(REMEMBER_TOKEN_KEY);
        let authParams = {};
        
        if (rememberToken) {
          authParams = { rememberToken };
        }
        
        const data = await api.auth.status(authParams) as AuthStatusResponse;
        
        if (data?.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setError(null);
          
          if (data.fromRememberToken && rememberToken) {
            console.log('Logged in via remember token');
          }
          
          return true;
        } else {
          clearAuth();
          return false;
        }
      } catch (error) {
        if (error instanceof Error && (
          error.message === 'SESSION_EXPIRED' ||
          error.message === 'AUTHENTICATION_FAILED' ||
          error.message === 'FORBIDDEN' ||
          error.message === 'INVALID_REMEMBER_TOKEN'
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

  useEffect(() => {
    if (!isAuthenticated) {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = undefined;
      }
      return;
    }
    
    if (!sessionCheckInterval.current) {
      sessionCheckInterval.current = setInterval(() => {
        checkAuth().catch(() => {});
      }, SESSION_CHECK_INTERVAL);
    }
    
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = undefined;
      }
    };
  }, [isAuthenticated, checkAuth]);

  const login = async (email: string, password: string, rememberMe = false): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    
    setRememberMe(rememberMe);
    
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
    }
    
    let shouldRestoreSession = false;
    let originalAuthState = { user, isAuthenticated };
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      loginTimeoutRef.current = setTimeout(() => {
        reject(new Error('LOGIN_TIMEOUT'));
      }, LOGIN_TIMEOUT);
    });

    try {
      api.utils.clearAuthCache();
      
      // ✅ FIXED: Handle the actual API response which includes rememberToken
      // Backend returns: { user: User, message: string, rememberToken?: string }
      const loginResponse = await Promise.race([
        api.auth.login({ email, password, rememberMe }),
        timeoutPromise
      ]) as any; // Temporary type until api.ts is fixed
      
      // Extract user and rememberToken from response
      const user = loginResponse.user;
      const rememberToken = loginResponse.rememberToken;
      
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = undefined;
      }
      
      // ✅ FIXED: Store remember token if provided in login response
      // Backend login API already returns rememberToken when rememberMe = true
      if (rememberMe && rememberToken) {
        localStorage.setItem(REMEMBER_TOKEN_KEY, rememberToken);
      } else if (!rememberMe) {
        localStorage.removeItem(REMEMBER_TOKEN_KEY);
      }
      
      const authVerified = await checkAuth();
      
      if (!authVerified) {
        shouldRestoreSession = true;
        throw new Error('SESSION_NOT_ESTABLISHED');
      }
      
      // ✅ Return properly typed response
      const response: LoginResponse = {
        user,
        rememberToken
      };
      
      return response;
    } catch (error: any) {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = undefined;
      }
      
      localStorage.removeItem(REMEMBER_TOKEN_KEY);
      
      if (shouldRestoreSession && originalAuthState.isAuthenticated && originalAuthState.user) {
        setUser(originalAuthState.user);
        setIsAuthenticated(true);
      } else if (error.message === 'SESSION_NOT_ESTABLISHED') {
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
      if (error.message === 'EMAIL_NOT_FOUND' || error.message.includes('not found')) {
        return false;
      }
      throw error;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }): Promise<RegisterResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (data.password.length < 8) {
        throw new Error('PASSWORD_TOO_SHORT');
      }
      
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('INVALID_EMAIL');
      }
      
      // ✅ FIXED: API returns User directly, not wrapped
      const user = await api.auth.register(data) as User;
      
      // ✅ Create proper response type
      const response: RegisterResponse = {
        user
      };
      
      const isNowAuthenticated = await checkAuth();
      
      if (!isNowAuthenticated) {
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
    } finally {
      clearAuth();
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
      error,
      rememberMe,
      setRememberMe
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

export function useAuthGuard(redirectOnFail = true) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!isLoading && !isAuthenticated) {
      checkAuth().then(isAuth => {
        if (!isAuth && redirectOnFail) {
          const redirectPath = window.location.pathname + window.location.search;
          localStorage.setItem('auth_redirect', redirectPath);
          window.location.href = '/login';
        }
      });
    }
  }, [isAuthenticated, isLoading, checkAuth, redirectOnFail]);
  
  return { isAuthenticated, isLoading };
}

export function dispatchAuthError(errorType: 'SESSION_EXPIRED' | 'FORBIDDEN' | 'AUTHENTICATION_FAILED') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-error', { 
      detail: { error: errorType } 
    }));
  }
}

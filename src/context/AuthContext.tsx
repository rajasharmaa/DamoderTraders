// context/AuthContext.tsx - Complete Persistent Session Version
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  isPersistent: boolean;
  lastActivity: number;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  session?: {
    expiresAt: string;
    maxAge: number;
    persistent: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  checkEmailExists: (email: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  clearLocalAuth: () => void;
  getAuthHeaders: () => Record<string, string>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const STORAGE_KEYS = {
  AUTH_STATE: 'dt_auth_state_v2',
  SESSION_TOKEN: 'dt_session_token',
  USER_DATA: 'dt_user_data',
  SESSION_EXPIRY: 'dt_session_expiry',
  REMEMBER_ME: 'dt_remember_me',
  LAST_ACTIVITY: 'dt_last_activity',
  LAST_SYNC: 'dt_last_sync',
};

// Session timeout (30 days for persistent, 7 days for regular)
const SESSION_TIMEOUTS = {
  PERSISTENT: 30 * 24 * 60 * 60 * 1000, // 30 days
  REGULAR: 7 * 24 * 60 * 60 * 1000, // 7 days
  GRACE_PERIOD: 24 * 60 * 60 * 1000, // 24 hours grace period
};

// Token refresh interval (refresh 1 hour before expiry)
const TOKEN_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour

// Activity tracking interval
const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    expiresAt: null,
    isPersistent: false,
    lastActivity: Date.now(),
  });
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null);
  const [activityInterval, setActivityInterval] = useState<NodeJS.Timeout | null>(null);

  // ==================== LOCAL STORAGE MANAGEMENT ====================

  // Store auth state to localStorage
  const storeAuthState = useCallback((state: AuthState) => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(state));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
      console.log('💾 Auth state saved to localStorage');
    } catch (error) {
      console.error('Error storing auth state:', error);
    }
  }, []);

  // Get auth state from localStorage
  const getStoredAuthState = useCallback((): AuthState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error getting stored auth state:', error);
    }
    
    return {
      user: null,
      token: null,
      expiresAt: null,
      isPersistent: false,
      lastActivity: Date.now(),
    };
  }, []);

  // Clear all auth data from localStorage
  const clearLocalAuth = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('🧹 Cleared all local auth data');
    } catch (error) {
      console.error('Error clearing local auth:', error);
    }
  }, []);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    const newAuthState = {
      ...authState,
      lastActivity: Date.now(),
    };
    setAuthState(newAuthState);
    storeAuthState(newAuthState);
  }, [authState, storeAuthState]);

  // ==================== SESSION MANAGEMENT ====================

  // Check if session is valid
  const isSessionValid = useCallback((state: AuthState): boolean => {
    if (!state.user || !state.expiresAt) return false;
    
    const now = Date.now();
    const expiresAt = state.expiresAt;
    const lastActivity = state.lastActivity;
    
    // Check if session is expired
    if (expiresAt <= now) {
      console.log('❌ Session expired');
      return false;
    }
    
    // Check for inactivity timeout (30 days for persistent, 7 days for regular)
    const inactivityTimeout = state.isPersistent 
      ? SESSION_TIMEOUTS.PERSISTENT 
      : SESSION_TIMEOUTS.REGULAR;
    
    if (now - lastActivity > inactivityTimeout) {
      console.log('❌ Session inactive for too long');
      return false;
    }
    
    return true;
  }, []);

  // Start activity tracking
  const startActivityTracking = useCallback(() => {
    if (activityInterval) {
      clearInterval(activityInterval);
    }
    
    const interval = setInterval(() => {
      updateLastActivity();
    }, ACTIVITY_CHECK_INTERVAL);
    
    setActivityInterval(interval);
    
    // Also track user interactions
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => updateLastActivity();
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [activityInterval, updateLastActivity]);

  // Start periodic sync with server
  const startPeriodicSync = useCallback(() => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        await syncWithServer();
      } catch (error) {
        console.log('Periodic sync failed:', error);
      }
    }, TOKEN_REFRESH_INTERVAL);
    
    setSyncInterval(interval);
  }, [syncInterval]);

  // Sync auth state with server
  const syncWithServer = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.auth.status();
      
      if (response?.authenticated && response.user) {
        // Update local state with server data
        const currentState = getStoredAuthState();
        const newState: AuthState = {
          ...currentState,
          user: response.user,
          expiresAt: Date.now() + (currentState.isPersistent ? SESSION_TIMEOUTS.PERSISTENT : SESSION_TIMEOUTS.REGULAR),
          lastActivity: Date.now(),
        };
        
        setAuthState(newState);
        setUser(response.user);
        setIsAuthenticated(true);
        storeAuthState(newState);
        
        console.log('✅ Synced with server');
        return true;
      } else {
        // Server says not authenticated
        console.log('❌ Server says not authenticated');
        return false;
      }
    } catch (error) {
      console.log('Sync with server failed, using cached data');
      return true; // Return true to keep using cached data
    }
  }, [getStoredAuthState, storeAuthState]);

  // ==================== INITIALIZATION ====================

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const storedState = getStoredAuthState();
        
        if (isSessionValid(storedState)) {
          // Valid session found in localStorage
          console.log('✅ Restored session from localStorage');
          setAuthState(storedState);
          setUser(storedState.user);
          setIsAuthenticated(true);
          
          // Start activity tracking
          startActivityTracking();
          
          // Start periodic sync
          startPeriodicSync();
          
          // Sync with server in background
          setTimeout(() => {
            syncWithServer().catch(console.error);
          }, 1000);
        } else {
          // No valid session, check with server
          console.log('ℹ️ No valid session in localStorage, checking server');
          await checkAuth();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearLocalAuth();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Cleanup
    return () => {
      if (syncInterval) clearInterval(syncInterval);
      if (activityInterval) clearInterval(activityInterval);
    };
  }, []);

  // ==================== AUTH METHODS ====================

  const checkAuth = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking authentication status...');
      
      // First try server
      const response = await api.auth.status();
      console.log('Server auth response:', response);
      
      if (response?.authenticated && response.user) {
        console.log('✅ Server authentication successful');
        
        const newState: AuthState = {
          user: response.user,
          token: 'session-active',
          expiresAt: Date.now() + SESSION_TIMEOUTS.REGULAR,
          isPersistent: false,
          lastActivity: Date.now(),
        };
        
        setAuthState(newState);
        setUser(response.user);
        setIsAuthenticated(true);
        storeAuthState(newState);
        
        // Start tracking
        startActivityTracking();
        startPeriodicSync();
        
        return true;
      } else {
        console.log('❌ Server authentication failed');
        
        // Check localStorage as fallback
        const storedState = getStoredAuthState();
        if (isSessionValid(storedState)) {
          console.log('⚠️ Using cached auth data');
          setAuthState(storedState);
          setUser(storedState.user);
          setIsAuthenticated(true);
          return true;
        } else {
          console.log('❌ No valid auth data found');
          clearLocalAuth();
          setUser(null);
          setIsAuthenticated(false);
          return false;
        }
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // Network error, try localStorage
      const storedState = getStoredAuthState();
      if (isSessionValid(storedState)) {
        console.log('🌐 Network error, using cached auth');
        setAuthState(storedState);
        setUser(storedState.user);
        setIsAuthenticated(true);
        return true;
      }
      
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('Remember me:', rememberMe);
      
      // Call login API
      const response = await api.auth.login({ email, password, rememberMe });
      console.log('Login API response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }
      
      // Calculate expiry time
      let expiresAt: number;
      if (response.session?.expiresAt) {
        expiresAt = new Date(response.session.expiresAt).getTime();
      } else {
        expiresAt = Date.now() + (rememberMe ? SESSION_TIMEOUTS.PERSISTENT : SESSION_TIMEOUTS.REGULAR);
      }
      
      // Create auth state
      const newState: AuthState = {
        user: response.user,
        token: 'session-active',
        expiresAt,
        isPersistent: rememberMe,
        lastActivity: Date.now(),
      };
      
      // Update state
      setAuthState(newState);
      setUser(response.user);
      setIsAuthenticated(true);
      storeAuthState(newState);
      
      // Start tracking
      startActivityTracking();
      startPeriodicSync();
      
      // Store login info
      localStorage.setItem('last_login_email', email);
      localStorage.setItem('last_login_time', Date.now().toString());
      
      console.log('✅ Login successful, session stored');
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'Login failed. Please try again.';
      
      if (errorMessage.includes('User not found')) {
        errorMessage = 'No account found with this email. Please register first.';
      } else if (errorMessage.includes('Invalid password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing session...');
      
      // Try to refresh with server
      await api.auth.refreshSession();
      
      // Update local expiry
      const currentState = getStoredAuthState();
      const newExpiresAt = Date.now() + (currentState.isPersistent ? SESSION_TIMEOUTS.PERSISTENT : SESSION_TIMEOUTS.REGULAR);
      
      const newState: AuthState = {
        ...currentState,
        expiresAt: newExpiresAt,
        lastActivity: Date.now(),
      };
      
      setAuthState(newState);
      storeAuthState(newState);
      
      console.log('✅ Session refreshed');
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      
      // Check if we can continue with cached data
      const currentState = getStoredAuthState();
      if (isSessionValid(currentState)) {
        console.log('⚠️ Using cached session despite refresh failure');
        return true;
      }
      
      return false;
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
      
      // Auto-login after registration
      await login(data.email, data.password, false);
      
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = error.message || 'Registration failed. Please try again.';
      
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('🚪 Logging out...');
      
      // Try server logout
      try {
        await api.auth.logout();
      } catch (error) {
        console.log('Server logout failed, continuing with local logout');
      }
      
      // Clear all state
      setAuthState({
        user: null,
        token: null,
        expiresAt: null,
        isPersistent: false,
        lastActivity: Date.now(),
      });
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear local storage
      clearLocalAuth();
      
      // Clear API cache
      api.utils.clearCache();
      
      // Stop intervals
      if (syncInterval) {
        clearInterval(syncInterval);
        setSyncInterval(null);
      }
      if (activityInterval) {
        clearInterval(activityInterval);
        setActivityInterval(null);
      }
      
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force clear everything even if error
      setUser(null);
      setIsAuthenticated(false);
      clearLocalAuth();
      api.utils.clearCache();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    const updatedUser = { ...user, ...userData } as User;
    const newState = { ...authState, user: updatedUser };
    
    setUser(updatedUser);
    setAuthState(newState);
    storeAuthState(newState);
    
    console.log('👤 User data updated');
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'X-Session-Valid': isAuthenticated ? 'true' : 'false',
    };
    
    if (authState.token && authState.token !== 'session-active') {
      headers['Authorization'] = `Bearer ${authState.token}`;
    }
    
    return headers;
  };

  // ==================== DEBUG & MONITORING ====================

  // Log auth state changes
  useEffect(() => {
    console.log('🔐 Auth State Updated:', {
      isAuthenticated,
      user: user?.email,
      expiresAt: authState.expiresAt ? new Date(authState.expiresAt).toLocaleString() : null,
      isPersistent: authState.isPersistent,
      timeRemaining: authState.expiresAt ? Math.round((authState.expiresAt - Date.now()) / 1000 / 60) + ' minutes' : 'none',
    });
  }, [user, isAuthenticated, authState]);

  // Auto-refresh before expiry
  useEffect(() => {
    if (!authState.expiresAt) return;
    
    const timeUntilExpiry = authState.expiresAt - Date.now();
    const refreshThreshold = 60 * 60 * 1000; // 1 hour before expiry
    
    if (timeUntilExpiry < refreshThreshold && timeUntilExpiry > 0) {
      console.log('⏰ Session expiring soon, scheduling refresh...');
      const timeout = setTimeout(() => {
        refreshToken().catch(console.error);
      }, timeUntilExpiry - 300000); // 5 minutes before expiry
      
      return () => clearTimeout(timeout);
    }
  }, [authState.expiresAt]);

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
      refreshToken,
      clearLocalAuth,
      getAuthHeaders,
      updateUser,
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

// Export helper functions for direct use
export const authHelpers = {
  getStoredAuthState: (): AuthState => {
    try {
      const stored = localStorage.getItem('dt_auth_state_v2');
      return stored ? JSON.parse(stored) : {
        user: null,
        token: null,
        expiresAt: null,
        isPersistent: false,
        lastActivity: Date.now(),
      };
    } catch {
      return {
        user: null,
        token: null,
        expiresAt: null,
        isPersistent: false,
        lastActivity: Date.now(),
      };
    }
  },
  
  isSessionValid: (): boolean => {
    const state = authHelpers.getStoredAuthState();
    if (!state.user || !state.expiresAt) return false;
    
    const now = Date.now();
    if (state.expiresAt <= now) return false;
    
    const inactivityTimeout = state.isPersistent 
      ? SESSION_TIMEOUTS.PERSISTENT 
      : SESSION_TIMEOUTS.REGULAR;
    
    return now - state.lastActivity <= inactivityTimeout;
  },
  
  clearAuth: () => {
    ['dt_auth_state_v2', 'dt_session_token', 'dt_user_data', 'dt_session_expiry', 'dt_remember_me', 'dt_last_activity', 'dt_last_sync'].forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

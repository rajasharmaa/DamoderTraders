// lib/api.ts - Complete Persistent API Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://damodertraders.onrender.com/api';

// Local storage keys for API cache
const STORAGE_KEYS = {
  API_CACHE: 'dt_api_cache_v2',
  CACHE_TIMESTAMP: 'dt_cache_timestamp',
  LAST_REQUEST: 'dt_last_request',
  REQUEST_QUEUE: 'dt_request_queue',
  OFFLINE_REQUESTS: 'dt_offline_requests',
};

// External APIs configuration
const EXTERNAL_APIS = {
  PRODUCTS: 'https://fakestoreapi.com/products',
  INDUSTRIAL_SUPPLIES: 'https://dummyjson.com/products/category',
  GEOCODING: 'https://api.opencagedata.com/geocode/v1/json',
};

// Cache configuration
let memoryCache = new Map<string, { data: any; timestamp: number; expiresAt: number }>();
const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Initialize cache from localStorage
const initializeCache = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.API_CACHE);
    const timestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP);
    
    if (cached && timestamp) {
      const cacheData = JSON.parse(cached);
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      // Only load cache if it's less than 1 hour old
      if (now - cacheTime < 60 * 60 * 1000) {
        for (const [key, value] of Object.entries(cacheData)) {
          if ((value as any).expiresAt > now) {
            memoryCache.set(key, value as any);
          }
        }
        console.log('✅ Loaded API cache from localStorage:', memoryCache.size, 'items');
      } else {
        console.log('🧹 Cache too old, clearing...');
        localStorage.removeItem(STORAGE_KEYS.API_CACHE);
      }
    }
  } catch (error) {
    console.error('Error loading cache:', error);
    localStorage.removeItem(STORAGE_KEYS.API_CACHE);
  }
};

// Save cache to localStorage
const saveCacheToStorage = () => {
  try {
    if (memoryCache.size > 0) {
      const cacheObj = Object.fromEntries(memoryCache);
      localStorage.setItem(STORAGE_KEYS.API_CACHE, JSON.stringify(cacheObj));
      localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    }
  } catch (error) {
    console.error('Error saving cache:', error);
  }
};

// Clean expired cache entries
const cleanExpiredCache = () => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiresAt <= now) {
      memoryCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    saveCacheToStorage();
  }
};

// Initialize on load
initializeCache();

// Auto-save cache periodically
setInterval(() => {
  if (memoryCache.size > 0) {
    saveCacheToStorage();
  }
}, 2 * 60 * 1000); // Save every 2 minutes

// Auto-clean cache periodically
setInterval(cleanExpiredCache, 10 * 60 * 1000); // Clean every 10 minutes

// Interface definitions
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface RequestOptions extends RequestInit {
  useCache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  retries?: number;
  externalApi?: keyof typeof EXTERNAL_APIS;
  externalEndpoint?: string;
  timeout?: number;
  skipAuth?: boolean;
  forceRefresh?: boolean;
}

interface QueuedRequest {
  url: string;
  options: RequestOptions;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timestamp: number;
}

// Request queue for rate limiting
let requestQueue: QueuedRequest[] = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 3;
const REQUEST_DELAY = 100; // 100ms between requests

// Process request queue
const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const batch = requestQueue.splice(0, MAX_CONCURRENT_REQUESTS);
    const promises = batch.map(async ({ url, options, resolve, reject, timestamp }) => {
      // Skip if request is too old (more than 1 minute)
      if (Date.now() - timestamp > 60 * 1000) {
        reject(new Error('Request timeout (queued too long)'));
        return;
      }
      
      try {
        const result = await fetchWithRetry(url, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    });
    
    await Promise.all(promises);
  }
  
  isProcessingQueue = false;
};

// Queue a request
const queueRequest = (url: string, options: RequestOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      url,
      options,
      resolve,
      reject,
      timestamp: Date.now(),
    });
    
    // Trigger queue processing
    setTimeout(processQueue, 0);
  });
};

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const authState = localStorage.getItem('dt_auth_state_v2');
    if (authState) {
      const parsed = JSON.parse(authState);
      return parsed.token || null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
};

// Get session state
const getSessionState = () => {
  try {
    const authState = localStorage.getItem('dt_auth_state_v2');
    return authState ? JSON.parse(authState) : null;
  } catch {
    return null;
  }
};

// Check if session is about to expire
const shouldRefreshSession = (): boolean => {
  const session = getSessionState();
  if (!session || !session.expiresAt) return false;
  
  const now = Date.now();
  const expiresAt = session.expiresAt;
  const refreshThreshold = 15 * 60 * 1000; // 15 minutes before expiry
  
  return expiresAt - now < refreshThreshold;
};

// Update last request time
const updateLastRequestTime = () => {
  localStorage.setItem(STORAGE_KEYS.LAST_REQUEST, Date.now().toString());
};

// Get cache TTL based on endpoint
const getCacheTtl = (endpoint: string): number => {
  if (endpoint.includes('/products/')) {
    return endpoint.includes('/search') ? CACHE_TTL.SHORT : CACHE_TTL.MEDIUM;
  } else if (endpoint.includes('/auth/')) {
    return CACHE_TTL.SHORT;
  } else {
    return CACHE_TTL.MEDIUM;
  }
};

// Fetch with retry logic
const fetchWithRetry = async (url: string, options: RequestOptions, retries = 3): Promise<any> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  
  throw new Error('Max retries exceeded');
};

// Main API request function
export async function apiRequest(
  endpoint: string, 
  options: RequestOptions = {}
) {
  updateLastRequestTime();
  
  const {
    useCache = true,
    cacheKey = endpoint,
    cacheTtl,
    retries = 3,
    externalApi,
    externalEndpoint,
    timeout = 30000,
    skipAuth = false,
    forceRefresh = false,
    ...fetchOptions
  } = options;

  // Generate full URL
  let url: string;
  if (externalApi && EXTERNAL_APIS[externalApi]) {
    url = externalEndpoint 
      ? `${EXTERNAL_APIS[externalApi]}${externalEndpoint}`
      : EXTERNAL_APIS[externalApi];
  } else {
    url = `${API_BASE_URL}${endpoint}`;
  }

  // Check cache first (if not forcing refresh)
  if (useCache && !forceRefresh && !endpoint.includes('/auth/')) {
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`💾 Cache hit: ${cacheKey}`);
      return cached.data;
    }
  }

  // Get auth headers
  const authToken = getAuthToken();
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client': 'damodar-traders-web',
    'X-Client-Version': '2.0.0',
  };

  if (authToken && !skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  // Add session refresh header if needed
  if (shouldRefreshSession() && !skipAuth) {
    defaultHeaders['X-Session-Refresh'] = 'true';
  }

  // Prepare fetch options
  const fetchOpts: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  };

  try {
    // Use queued request system
    const response = await queueRequest(url, {
      ...fetchOpts,
      timeout,
      retries,
    });

    // Handle session expired
    if (response.status === 401 && !skipAuth) {
      console.log('🔐 Session expired, attempting refresh...');
      
      try {
        // Try to refresh session
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-session`, {
          method: 'POST',
          credentials: 'include',
          headers: defaultHeaders,
        });

        if (refreshResponse.ok) {
          // Retry original request with refreshed session
          console.log('✅ Session refreshed, retrying request...');
          return await apiRequest(endpoint, { ...options, forceRefresh: true });
        } else {
          throw new Error('SESSION_EXPIRED');
        }
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
        throw new Error('SESSION_EXPIRED');
      }
    }

    // Handle other error statuses
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` };
      }
      
      const error = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Cache the response (except for auth endpoints)
    if (useCache && !endpoint.includes('/auth/')) {
      const ttl = cacheTtl || getCacheTtl(endpoint);
      const expiresAt = Date.now() + ttl;
      
      memoryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expiresAt,
      });
    }

    return data;
  } catch (error: any) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // Check cache for fallback data
    if (useCache && !endpoint.includes('/auth/')) {
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        console.log(`⚠️ Using cached data for ${endpoint} due to error`);
        return cached.data;
      }
    }
    
    throw error;
  }
}

// Enhanced API object
export const api = {
  // Auth endpoints
  auth: {
    register: (data: any) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      useCache: false,
    }),
    
    login: (data: any) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      useCache: false,
    }),
    
    logout: () => apiRequest('/auth/logout', { 
      method: 'POST',
      useCache: false,
    }),
    
    status: () => apiRequest('/auth/status', {
      useCache: false,
      timeout: 10000,
    }),
    
    refreshSession: () => apiRequest('/auth/refresh-session', {
      method: 'POST',
      useCache: false,
    }),
    
    sessionInfo: () => apiRequest('/auth/session-info', {
      useCache: false,
    }),
    
    keepAlive: () => apiRequest('/auth/keep-alive', {
      useCache: false,
      timeout: 5000,
    }),
    
    forgotPassword: (email: string) => apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      useCache: false,
    }),
    
    resetPassword: (data: { token: string; password: string }) => 
      apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
        useCache: false,
      }),
    
    checkEmail: (email: string) => apiRequest(`/auth/check-email?email=${encodeURIComponent(email)}`, {
      useCache: false,
      cacheTtl: CACHE_TTL.SHORT,
    }),
    
    validatePassword: (password: string) => apiRequest('/auth/validate-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
      useCache: false,
    }),
  },

  // Product endpoints
  products: {
    getAll: async () => {
      try {
        const localData = await apiRequest('/products', {
          useCache: true,
          cacheTtl: CACHE_TTL.MEDIUM,
        }).catch(() => null);
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
          return localData;
        }
        
        return [];
      } catch {
        return [];
      }
    },
    
    getByCategory: async (category: string) => {
      try {
        const localData = await apiRequest(`/products/category/${category}`, {
          useCache: true,
          cacheTtl: CACHE_TTL.MEDIUM,
        }).catch(() => null);
        
        return localData || [];
      } catch {
        return [];
      }
    },
    
    getById: async (id: string) => {
      try {
        const data = await apiRequest(`/products/${id}`, {
          useCache: true,
          cacheTtl: CACHE_TTL.MEDIUM,
        });
        return data || null;
      } catch {
        return null;
      }
    },
    
    search: async (params: { search?: string; category?: string }) => {
      try {
        const query = new URLSearchParams();
        if (params.search) query.append('search', params.search);
        if (params.category) query.append('category', params.category);
        const queryString = query.toString();
        
        const data = await apiRequest(`/products/search${queryString ? `?${queryString}` : ''}`, {
          useCache: true,
          cacheTtl: CACHE_TTL.SHORT,
        });
        
        return data || [];
      } catch {
        return [];
      }
    },
    
    getSuggestions: async (query: string) => {
      try {
        if (!query || query.trim().length < 2) return [];
        
        const suggestions = await apiRequest(`/products/search/suggestions?query=${encodeURIComponent(query)}`, {
          useCache: true,
          cacheTtl: CACHE_TTL.SHORT,
        }).catch(() => []);
        
        return suggestions || [];
      } catch {
        return [];
      }
    },
    
    getDiscounted: async () => {
      try {
        const data = await apiRequest('/products/discounted', {
          useCache: true,
          cacheTtl: CACHE_TTL.MEDIUM,
        });
        return data || [];
      } catch (error) {
        console.warn('Failed to fetch discounted products:', error);
        return [];
      }
    },
    
    getPopular: async () => {
      try {
        const data = await apiRequest('/products/popular', {
          useCache: true,
          cacheTtl: CACHE_TTL.MEDIUM,
        });
        return data || [];
      } catch (error) {
        console.warn('Failed to fetch popular products:', error);
        return [];
      }
    },
  },

  // Inquiry endpoints
  inquiries: {
    create: (data: any) => apiRequest('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
      useCache: false,
    }),
    
    getUserInquiries: async () => {
      try {
        return await apiRequest('/user/inquiries');
      } catch {
        return [];
      }
    },
  },

  // User endpoints
  users: {
    getProfile: async (id: string) => {
      try {
        return await apiRequest(`/users/${id}`);
      } catch {
        return null;
      }
    },
    
    updateProfile: (id: string, data: any) => apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      useCache: false,
    }),
  },

  // Debug endpoints
  debug: {
    session: () => apiRequest('/debug/session', { useCache: false }),
    cookies: () => apiRequest('/debug/cookies', { useCache: false }),
    db: () => apiRequest('/debug/db', { useCache: false }),
  },

  // External APIs
  external: {
    getIndustrialProducts: async (category?: string, limit = 20) => {
      try {
        let endpoint = '';
        if (category) {
          endpoint = `/${category}?limit=${limit}`;
        } else {
          endpoint = `?limit=${limit}`;
        }
        
        const data = await apiRequest('', {
          externalApi: 'INDUSTRIAL_SUPPLIES',
          externalEndpoint: endpoint,
          useCache: true,
          cacheKey: `industrial_${category || 'all'}_${limit}`,
          cacheTtl: CACHE_TTL.MEDIUM,
        });
        
        return data?.products || [];
      } catch (error) {
        console.warn('Failed to fetch industrial products:', error);
        return [];
      }
    },
  },

  // Session management
  session: {
    // Check if user should stay logged in
    shouldStayLoggedIn: (): boolean => {
      try {
        const authState = localStorage.getItem('dt_auth_state_v2');
        const lastRequest = localStorage.getItem(STORAGE_KEYS.LAST_REQUEST);
        
        if (!authState || !lastRequest) return false;
        
        const parsedAuth = JSON.parse(authState);
        const lastRequestTime = parseInt(lastRequest, 10);
        const now = Date.now();
        
        // Check if session is expired
        if (parsedAuth.expiresAt && parsedAuth.expiresAt <= now) {
          return false;
        }
        
        // Check inactivity (30 days for persistent, 7 days for regular)
        const inactivityTimeout = parsedAuth.isPersistent 
          ? 30 * 24 * 60 * 60 * 1000 
          : 7 * 24 * 60 * 60 * 1000;
        
        return now - lastRequestTime < inactivityTimeout;
      } catch (error) {
        return false;
      }
    },
    
    // Extend session
    extendSession: () => {
      localStorage.setItem(STORAGE_KEYS.LAST_REQUEST, Date.now().toString());
      
      // Also update auth state expiry if it exists
      try {
        const authState = localStorage.getItem('dt_auth_state_v2');
        if (authState) {
          const parsed = JSON.parse(authState);
          if (parsed.expiresAt) {
            const extension = parsed.isPersistent 
              ? 30 * 24 * 60 * 60 * 1000 
              : 7 * 24 * 60 * 60 * 1000;
            parsed.expiresAt = Date.now() + extension;
            localStorage.setItem('dt_auth_state_v2', JSON.stringify(parsed));
          }
        }
      } catch (error) {
        console.error('Error extending session:', error);
      }
    },
    
    // Clear all session data
    clearSession: () => {
      [
        'dt_auth_state_v2',
        'dt_session_token',
        'dt_user_data',
        'dt_session_expiry',
        'dt_remember_me',
        'dt_last_activity',
        'dt_last_sync',
        STORAGE_KEYS.LAST_REQUEST,
      ].forEach(key => {
        localStorage.removeItem(key);
      });
    },
    
    // Get session info
    getSessionInfo: () => {
      try {
        const authState = localStorage.getItem('dt_auth_state_v2');
        const lastRequest = localStorage.getItem(STORAGE_KEYS.LAST_REQUEST);
        
        return {
          authState: authState ? JSON.parse(authState) : null,
          lastRequest: lastRequest ? parseInt(lastRequest, 10) : null,
          now: Date.now(),
        };
      } catch (error) {
        return null;
      }
    },
  },
  
  // Cache management
  utils: {
    clearCache: (key?: string) => {
      if (key) {
        memoryCache.delete(key);
      } else {
        memoryCache.clear();
      }
      saveCacheToStorage();
    },

    getCacheStats: () => {
      const now = Date.now();
      const validEntries = Array.from(memoryCache.entries())
        .filter(([_, value]) => value.expiresAt > now);
      
      return {
        total: memoryCache.size,
        valid: validEntries.length,
        expired: memoryCache.size - validEntries.length,
        entries: validEntries.map(([key, value]) => ({
          key,
          age: now - value.timestamp,
          expiresIn: value.expiresAt - now,
        })),
      };
    },

    preload: async (endpoints: string[]) => {
      const promises = endpoints.map(endpoint => 
        apiRequest(endpoint, { useCache: true }).catch(() => null)
      );
      return Promise.all(promises);
    },
    
    // Save cache to storage manually
    saveCache: saveCacheToStorage,
    
    // Get cache size
    getCacheSize: () => {
      try {
        const cache = localStorage.getItem(STORAGE_KEYS.API_CACHE);
        return cache ? Math.round(cache.length / 1024) : 0; // Size in KB
      } catch {
        return 0;
      }
    },
  },
  
  // Health check
  health: async () => {
    try {
      return await apiRequest('/health', {
        useCache: false,
        timeout: 5000,
      });
    } catch {
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Test connection
  test: async () => {
    try {
      return await apiRequest('/test', {
        useCache: true,
        cacheTtl: CACHE_TTL.SHORT,
        timeout: 5000,
      });
    } catch {
      return null;
    }
  },
};

// Start periodic session keep-alive
setInterval(() => {
  if (api.session.shouldStayLoggedIn()) {
    api.auth.keepAlive().catch(() => {
      // Silent fail
    });
  }
}, 5 * 60 * 1000); // Every 5 minutes

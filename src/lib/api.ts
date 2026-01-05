// lib/api.ts - SECURED VERSION (FULLY CORRECTED)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://damodertraders.onrender.com/api';

// External APIs configuration
const EXTERNAL_APIS = {
  PRODUCTS: 'https://fakestoreapi.com/products',
  INDUSTRIAL_SUPPLIES: 'https://dummyjson.com/products/category',
} as const;

// Cache configuration - consider upgrading to LRU cache for production
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 1000;

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

interface RequestOptions extends RequestInit {
  useCache?: boolean;
  cacheKey?: string;
  retries?: number;
  externalApi?: keyof typeof EXTERNAL_APIS;
  externalEndpoint?: string;
  timeout?: number;
  requiresAuth?: boolean;
}

// Rate limiting
const requestQueue = new Map<string, Array<QueueItem>>();

interface QueueItem<T = unknown> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  requestFn: () => Promise<T>;
}

const REQUEST_DELAY = 100;

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Clean up old timestamps and filter recent ones
    const recentRequests = userRequests.filter(time => now - time < this.timeWindow);
    
    // Clean up empty user entries to prevent memory growth
    if (recentRequests.length === 0) {
      this.requests.delete(key);
      return true;
    }
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}

const apiRateLimiter = new RateLimiter(10, 60000);

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// CSRF token management
let csrfToken: string | null = null;

function getCsrfToken(): string | null {
  if (!csrfToken) {
    csrfToken = getCookie('XSRF-TOKEN') || getCookie('csrfToken');
  }
  return csrfToken;
}

function updateCsrfToken(token: string) {
  csrfToken = token;
}

// Simple LRU-like cache cleanup
function cleanupCache() {
  if (cache.size > MAX_CACHE_ENTRIES) {
    // Remove oldest entries when cache exceeds limit
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_ENTRIES * 0.2));
    toRemove.forEach(([key]) => cache.delete(key));
  }
}

// Request queue
async function queueRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (!requestQueue.has(key)) {
    requestQueue.set(key, []);
  }
  
  return new Promise<T>((resolve, reject) => {
    const queue = requestQueue.get(key)!;
    queue.push({ resolve, reject, requestFn });
    
    if (queue.length === 1) {
      processQueue(key);
    }
  });
}

async function processQueue(key: string) {
  const queue = requestQueue.get(key);
  if (!queue || queue.length === 0) {
    requestQueue.delete(key);
    return;
  }
  
  const { resolve, reject, requestFn } = queue[0];
  
  try {
    const result = await requestFn();
    resolve(result);
  } catch (error) {
    reject(error);
  } finally {
    queue.shift();
    if (queue.length > 0) {
      setTimeout(() => processQueue(key), REQUEST_DELAY);
    } else {
      requestQueue.delete(key);
    }
  }
}

export async function apiRequest<T = unknown>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<T | null> {
  const {
    useCache = true,
    cacheKey,
    retries = 2,
    externalApi,
    externalEndpoint,
    timeout = 10000,
    requiresAuth = false,
    ...fetchOptions
  } = options;

  // Get method properly, defaulting to GET
  const method = (fetchOptions.method || 'GET').toUpperCase();

  // Build URL first for cache key generation
  let url: string;
  
  if (externalApi && EXTERNAL_APIS[externalApi]) {
    url = externalEndpoint ? 
      `${EXTERNAL_APIS[externalApi]}${externalEndpoint}` : 
      EXTERNAL_APIS[externalApi];
  } else {
    url = `${API_BASE_URL}${endpoint}`;
  }

  // Generate robust cache key including URL and body
  const effectiveCacheKey = cacheKey || 
    `${method}_${url}_${JSON.stringify(fetchOptions.body || '')}`;

  // Check rate limiting for non-GET requests
  if (method !== 'GET') {
    // Use session-based key for rate limiting
    const userKey = getCookie('sessionId') || getCookie('userId') || 'anonymous';
    if (!apiRateLimiter.canMakeRequest(userKey)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  // Check cache (only for GET requests)
  if (useCache && 
      method === 'GET' && 
      !endpoint.includes('/auth/') && 
      !endpoint.includes('/user/') &&
      !endpoint.includes('/debug/')) {
    const cached = cache.get(effectiveCacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }

  // Set credentials: 'include' for same-origin, 'omit' for external APIs
  const defaultOptions: RequestInit = {
    credentials: externalApi ? 'omit' : 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...fetchOptions.headers,
    },
  };

  // Add CSRF token for state-changing operations (only for same-origin)
  if (!externalApi && method !== 'GET') {
    const token = getCsrfToken();
    if (token) {
      (defaultOptions.headers as Record<string, string>)['X-CSRF-Token'] = token;
    }
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...fetchOptions,
        method,
        headers: {
          ...defaultOptions.headers,
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle authentication errors
      if (response.status === 401) {
        apiUtils.clearAuthCache();
        const errorData = await response.json().catch(() => ({}));
        
        if (requiresAuth) {
          throw new Error('LOGIN_REQUIRED');
        } else if (endpoint.includes('/auth/login')) {
          throw new Error('AUTHENTICATION_FAILED');
        } else {
          throw new Error('SESSION_EXPIRED');
        }
      }

      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Bad request');
      }

      if (response.status === 403) {
        throw new Error('FORBIDDEN');
      }

      if (response.status === 404) {
        return null;
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (response.status >= 500) {
        if (attempt === retries) {
          throw new Error('Server error. Please try again later.');
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      let data: unknown;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Only update CSRF token from trusted (non-external) API responses
      if (!externalApi && data && typeof data === 'object' && 'csrfToken' in data) {
        updateCsrfToken((data as any).csrfToken);
      }

      // Cache successful GET responses
      if (useCache && 
          method === 'GET' && 
          !endpoint.includes('/auth/') && 
          !endpoint.includes('/user/') &&
          !endpoint.includes('/debug/')) {
        cache.set(effectiveCacheKey, {
          data,
          timestamp: Date.now(),
        });
        cleanupCache();
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          lastError = new Error('Request timeout. Please check your connection.');
        }
        
        // Re-throw auth errors immediately
        if (error.message === 'AUTHENTICATION_FAILED' ||
            error.message === 'SESSION_EXPIRED' ||
            error.message === 'FORBIDDEN' ||
            error.message === 'LOGIN_REQUIRED') {
          throw error;
        }
      } else {
        lastError = new Error('Unknown error occurred');
      }
      
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

// External API interfaces for better type safety
interface ExternalProduct {
  id: number;
  title: string;
  category: string;
  image: string;
  price: number;
  description?: string;
}

interface IndustrialProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail?: string;
}

// External API functions
export const externalApi = {
  getIndustrialProducts: async (category?: string, limit = 20): Promise<IndustrialProduct[]> => {
    try {
      let endpoint = '';
      if (category) {
        endpoint = `/${category}?limit=${limit}`;
      }
      
      const data = await apiRequest<{ products: IndustrialProduct[] }>('', {
        externalApi: 'INDUSTRIAL_SUPPLIES',
        externalEndpoint: endpoint,
        useCache: true,
        cacheKey: `industrial_${category || 'all'}_${limit}`,
      });
      
      return data?.products || [];
    } catch (error) {
      console.error('Industrial supplies API failed:', error);
      return [];
    }
  },

  getExternalSuggestions: async (query: string, limit = 5) => {
    try {
      if (!query || query.trim().length < 2) return [];
      
      const data = await apiRequest<ExternalProduct[]>('', {
        externalApi: 'PRODUCTS',
        useCache: true,
        cacheKey: `suggestions_${query}`,
      });
      
      const suggestions = Array.isArray(data) 
        ? data
            .filter((product) => 
              product.title.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, limit)
            .map((product) => ({
              id: product.id.toString(),
              name: product.title,
              category: product.category,
              image: product.image,
              price: product.price,
            }))
        : [];
      
      return suggestions;
    } catch (error) {
      console.error('External suggestions API failed:', error);
      return [];
    }
  },
};

// Cache management
export const apiUtils = {
  clearCache: (key?: string) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  },

  clearAuthCache: () => {
    Array.from(cache.keys()).forEach(key => {
      if (key.includes('user') || key.includes('inquiries') || key.includes('auth')) {
        cache.delete(key);
      }
    });
  },

  getCacheStats: () => {
    const now = Date.now();
    return {
      size: cache.size,
      entries: Array.from(cache.entries()).map(([key, entry]) => ({
        key: key.substring(0, 50),
        age: now - entry.timestamp,
        expired: now - entry.timestamp > CACHE_TTL,
      })),
    };
  },

  preload: async (endpoints: string[]) => {
    const promises = endpoints.map(endpoint => 
      apiRequest(endpoint, { useCache: true }).catch(() => null)
    );
    return Promise.all(promises);
  },

  // Queue with more specific key generation
  queueApiRequest: async <T>(endpoint: string, options: RequestOptions = {}): Promise<T | null> => {
    const queueKey = `${endpoint}_${JSON.stringify(options.body || '')}_${options.method || 'GET'}`;
    const requestFn = () => apiRequest<T>(endpoint, options);
    return queueRequest(queueKey, requestFn);
  },
};

export const api = {
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
    }),
    validatePassword: (password: string) => apiRequest('/auth/validate-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
      useCache: false,
    }),
  },

  products: {
    getAll: async () => {
      try {
        const localData = await apiRequest<any[]>('/products').catch(() => null);
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
          return localData;
        }
        
        return await externalApi.getIndustrialProducts();
      } catch {
        return [];
      }
    },
    getByCategory: async (category: string) => {
      try {
        const localData = await apiRequest<any[]>(`/products/category/${category}`).catch(() => null);
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
          return localData;
        }
        
        return await externalApi.getIndustrialProducts(category);
      } catch {
        return [];
      }
    },
    getById: async (id: string) => {
      try {
        const data = await apiRequest(`/products/${id}`);
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
        
        const data = await apiRequest<any[]>(`/products/search${queryString ? `?${queryString}` : ''}`);
        
        if ((!data || data.length === 0) && params.search) {
          return await externalApi.getExternalSuggestions(params.search, 20);
        }
        
        return data || [];
      } catch {
        return [];
      }
    },
    getSuggestions: async (query: string) => {
      try {
        if (!query || query.trim().length < 2) return [];
        
        const localSuggestions = await apiRequest<any[]>(`/products/search/suggestions?query=${encodeURIComponent(query)}`)
          .catch(() => []);
        
        if (localSuggestions && localSuggestions.length > 0) {
          return localSuggestions;
        }
        
        return await externalApi.getExternalSuggestions(query);
      } catch {
        return [];
      }
    },
    getDiscounted: async () => {
      try {
        const data = await apiRequest<any[]>('/products/discounted');
        return data || [];
      } catch {
        return [];
      }
    },
    getPopular: async () => {
      try {
        const data = await apiRequest<any[]>('/products/popular');
        return data || [];
      } catch {
        return [];
      }
    },
  },

  inquiries: {
    create: (data: any) => apiUtils.queueApiRequest('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
      useCache: false,
      requiresAuth: true,
    }),
    getUserInquiries: async () => {
      try {
        return await apiRequest<any[]>('/user/inquiries', {
          requiresAuth: true,
        });
      } catch {
        return [];
      }
    },
  },

  users: {
    getProfile: async (id: string) => {
      try {
        return await apiRequest(`/users/${id}`, {
          requiresAuth: true,
        });
      } catch {
        return null;
      }
    },
    updateProfile: (id: string, data: any) => apiUtils.queueApiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      useCache: false,
      requiresAuth: true,
    }),
  },

  external: externalApi,

  utils: apiUtils,

  health: async () => {
    try {
      return await apiRequest<{ status: string; timestamp: string }>('/health');
    } catch {
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  },

  test: async () => {
    try {
      return await apiRequest('/test');
    } catch {
      return null;
    }
  },
};

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Optional: Export for debugging/monitoring
if (typeof window !== 'undefined') {
  (window as any).__API_DEBUG = {
    cacheStats: () => apiUtils.getCacheStats(),
    clearCache: apiUtils.clearCache,
    rateLimiter: apiRateLimiter,
  };
}

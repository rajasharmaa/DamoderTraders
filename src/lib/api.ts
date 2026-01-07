// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const EXTERNAL_APIS = {
  PRODUCTS: 'https://fakestoreapi.com/products',
  INDUSTRIAL_SUPPLIES: 'https://dummyjson.com/products/category',
} as const;

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  price: number;
  discount?: number;
  external?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  phone?: string;
}

export interface Inquiry {
  id: string;
  userId: string;
  productId: string;
  message: string;
  status: 'pending' | 'responded' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: 'LOGIN_REQUIRED' | 'AUTHENTICATION_FAILED' | 'SESSION_EXPIRED' | 
               'FORBIDDEN' | 'TIMEOUT' | 'SERVER_ERROR' | 'RATE_LIMITED' | 
               'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'NOT_FOUND',
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  hits: number;
  metadata?: {
    size?: number;
    tags?: string[];
    source?: 'internal' | 'external';
  };
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 1000;
const CACHE_CLEANUP_INTERVAL = 60000;

interface RequestOptions extends RequestInit {
  useCache?: boolean;
  cacheKey?: string;
  retries?: number;
  externalApi?: keyof typeof EXTERNAL_APIS;
  externalEndpoint?: string;
  timeout?: number;
  requiresAuth?: boolean;
  cacheTags?: string[];
  retryFresh?: boolean;
  invalidateTags?: string[];
}

interface QueueItem<T = unknown> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  requestFn: () => Promise<T>;
}

const requestQueue = new Map<string, Array<QueueItem>>();
const REQUEST_DELAY = 100;

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.startCleanup();
  }

  private startCleanup() {
    if (typeof window === 'undefined') return;
    
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, times] of this.requests) {
        const validTimes = times.filter(time => now - time < this.timeWindow);
        if (validTimes.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validTimes);
        }
      }
    }, this.timeWindow);
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    const recentRequests = userRequests.filter(time => now - time < this.timeWindow);
    
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

  getStats() {
    return {
      trackedUsers: this.requests.size,
      totalRequests: Array.from(this.requests.values()).reduce((sum, times) => sum + times.length, 0)
    };
  }
}

const apiRateLimiter = new RateLimiter(10, 60000);

interface RequestState<T> {
  promise: Promise<T>;
  timestamp: number;
  retryCount: number;
}

const inflightRequests = new Map<string, RequestState<unknown>>();

function getEnvironmentPrefix(): string {
  if (import.meta.env.PROD) return 'prod';
  if (import.meta.env.DEV) return 'dev';
  if (import.meta.env.MODE === 'test') return 'test';
  return 'unknown';
}

function getOrCreateClientId(): string {
  if (typeof localStorage === 'undefined') return 'anonymous';
  
  let clientId = localStorage.getItem('client_id');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('client_id', clientId);
  }
  return clientId;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

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

function generateCacheKey(method: string, url: string, body?: BodyInit): string {
  const envPrefix = getEnvironmentPrefix();
  
  if (body instanceof FormData) {
    const formKeys = Array.from(body.keys()).sort();
    const formSummary = formKeys.map(key => {
      const value = body.get(key);
      return `${key}:${typeof value}`;
    }).join('|');
    return `${envPrefix}_${method}_${url}_formdata_${formSummary}`;
  }
  
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      const sortedBody = JSON.stringify(parsed, Object.keys(parsed).sort());
      return `${envPrefix}_${method}_${url}_${sortedBody}`;
    } catch {
      return `${envPrefix}_${method}_${url}_${body}`;
    }
  }
  
  return `${envPrefix}_${method}_${url}_${body || ''}`;
}

function cleanupCache(): void {
  const now = Date.now();
  let expiredCount = 0;
  let removedCount = 0;

  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
      expiredCount++;
    }
  }

  if (cache.size > MAX_CACHE_ENTRIES) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_ENTRIES * 0.2));
    toRemove.forEach(([key]) => {
      cache.delete(key);
      removedCount++;
    });
  }

  if (import.meta.env.DEV && (expiredCount > 0 || removedCount > 0)) {
    console.debug(`Cache cleanup: ${expiredCount} expired, ${removedCount} LRU removed`);
  }
}

if (typeof window !== 'undefined') {
  setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL);
}

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

async function dedupedRequest<T>(
  key: string, 
  requestFn: () => Promise<T>,
  retryFresh = false
): Promise<T> {
  const existing = inflightRequests.get(key);
  
  if (existing && !retryFresh) {
    return existing.promise as Promise<T>;
  }
  
  const requestPromise = requestFn();
  inflightRequests.set(key, {
    promise: requestPromise,
    timestamp: Date.now(),
    retryCount: 0
  });
  
  try {
    const result = await requestPromise;
    inflightRequests.delete(key);
    return result;
  } catch (error) {
    inflightRequests.delete(key);
    throw error;
  }
}

interface RequestMetrics {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  status?: number;
  size?: number;
  duration?: number;
  cacheHit?: boolean;
}

const requestMetrics: RequestMetrics[] = [];

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.csrfToken) {
        updateCsrfToken(data.csrfToken);
        return data.csrfToken;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch CSRF token:', error);
  }
  return null;
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
    timeout = 15000,
    requiresAuth = false,
    cacheTags = [],
    retryFresh = false,
    invalidateTags = [],
    ...fetchOptions
  } = options;

  const method = (fetchOptions.method || 'GET').toUpperCase();

  let url: string;
  if (externalApi && EXTERNAL_APIS[externalApi]) {
    url = externalEndpoint ? 
      `${EXTERNAL_APIS[externalApi]}${externalEndpoint}` : 
      EXTERNAL_APIS[externalApi];
  } else {
    url = `${API_BASE_URL}${endpoint}`;
  }

  const cacheKeyBase = generateCacheKey(method, url, fetchOptions.body);
  const effectiveCacheKey = cacheKey || 
    `${externalApi ? 'external' : 'internal'}:${cacheKeyBase}`;
  const dedupeKey = cacheKeyBase;

  const metric: RequestMetrics = {
    url,
    method,
    startTime: Date.now(),
    success: false
  };

  if (method !== 'GET' && !externalApi) {
    const userKey = getCookie('dt_session_id') || 
                    getOrCreateClientId();
    
    if (!apiRateLimiter.canMakeRequest(userKey)) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      throw new ApiError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMITED',
        429
      );
    }
  }

  if (useCache && 
      method === 'GET' && 
      !endpoint.includes('/auth/') && 
      !endpoint.includes('/user/') &&
      !endpoint.includes('/debug/')) {
    const cached = cache.get(effectiveCacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      cached.hits = (cached.hits || 0) + 1;
      cache.set(effectiveCacheKey, cached);
      
      metric.cacheHit = true;
      metric.endTime = Date.now();
      metric.success = true;
      metric.duration = metric.endTime - metric.startTime;
      requestMetrics.push(metric);
      
      if (import.meta.env.DEV) {
        console.debug(`✅ Cache hit: ${effectiveCacheKey.substring(0, 50)}...`);
      }
      
      return cached.data as T;
    }
  }

  try {
    const requestFn = async (): Promise<T> => {
      const defaultOptions: RequestInit = {
        credentials: externalApi ? 'omit' : 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...fetchOptions.headers,
        },
      };

      if (!externalApi && method !== 'GET') {
        let token = getCsrfToken();
        if (!token && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
          token = await fetchCsrfToken();
        }
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

          if (response.status === 401) {
            apiUtils.clearAuthCache();
            if (requiresAuth) {
              throw new ApiError('Login required', 'LOGIN_REQUIRED', 401);
            } else if (endpoint.includes('/auth/login')) {
              throw new ApiError('Authentication failed', 'AUTHENTICATION_FAILED', 401);
            } else {
              throw new ApiError('Session expired', 'SESSION_EXPIRED', 401);
            }
          }

          if (response.status === 400) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
              errorData.error || 'Bad request',
              'VALIDATION_ERROR',
              400,
              errorData.details
            );
          }

          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData.code === 'CSRF_ERROR') {
              updateCsrfToken('');
            }
            throw new ApiError(errorData.error || 'Access forbidden', 'FORBIDDEN', 403);
          }

          if (response.status === 404) {
            throw new ApiError('Resource not found', 'NOT_FOUND', 404);
          }

          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }

          if (response.status >= 500) {
            if (attempt === retries) {
              throw new ApiError('Server error. Please try again later.', 'SERVER_ERROR', response.status);
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
            throw new ApiError(
              errorData.error || errorData.message || `Request failed with status ${response.status}`,
              'SERVER_ERROR',
              response.status
            );
          }

          const contentType = response.headers.get('content-type');
          let data: unknown;
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          if (!externalApi && data && typeof data === 'object' && data !== null) {
            const token = (data as any).csrfToken;
            if (typeof token === 'string' && 
                token.length >= 16 &&
                token !== csrfToken &&
                !token.includes(' ') &&
                token.match(/^[a-zA-Z0-9\-_]+$/)) {
              updateCsrfToken(token);
            }
          }

          if (useCache && 
              method === 'GET' && 
              !endpoint.includes('/auth/') && 
              !endpoint.includes('/user/') &&
              !endpoint.includes('/debug/')) {
            cache.set(effectiveCacheKey, {
              data,
              timestamp: Date.now(),
              hits: 1,
              metadata: {
                tags: cacheTags,
                source: externalApi ? 'external' : 'internal',
                size: new Blob([JSON.stringify(data || '')]).size
              }
            });
            cleanupCache();
          }

          if (method !== 'GET' && invalidateTags.length > 0) {
            apiUtils.invalidateByTags(invalidateTags);
          }

          metric.endTime = Date.now();
          metric.success = true;
          metric.status = response.status;
          metric.duration = metric.endTime - metric.startTime;
          metric.size = new Blob([JSON.stringify(data || '')]).size;
          
          if (import.meta.env.DEV) {
            console.debug(`✅ ${method} ${endpoint} - ${response.status} (${metric.duration}ms)`);
          }
          
          return data as T;
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (error instanceof ApiError) {
            lastError = error;
            throw error;
          }
          
          if (error instanceof Error) {
            lastError = error;
            
            if (error.name === 'AbortError') {
              lastError = new ApiError('Request timeout. Please check your connection.', 'TIMEOUT', 408);
            }
          } else {
            lastError = new ApiError('Unknown error occurred', 'NETWORK_ERROR');
          }
          
          if (import.meta.env.DEV) {
            console.error(`❌ ${method} ${endpoint} attempt ${attempt + 1}/${retries + 1}:`, lastError.message);
          }
          
          if (attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new ApiError('Request failed after retries', 'NETWORK_ERROR');
    };

    const result = await dedupedRequest<T>(dedupeKey, requestFn, retryFresh);
    
    if (metric.endTime) {
      requestMetrics.push(metric);
      if (import.meta.env.DEV && requestMetrics.length > 100) {
        requestMetrics.shift();
      }
    }
    
    return result;
  } catch (error) {
    metric.endTime = Date.now();
    metric.success = false;
    metric.duration = metric.endTime - metric.startTime;
    requestMetrics.push(metric);
    throw error;
  }
}

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
  images?: string[];
}

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
        cacheKey: `external:industrial_${category || 'all'}_${limit}`,
        cacheTags: ['external', 'products'],
        timeout: 10000,
      });
      
      return data?.products || [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Industrial supplies API failed:', error);
      }
      return [];
    }
  },

  getExternalSuggestions: async (query: string, limit = 5) => {
    try {
      if (!query || query.trim().length < 2) return [];
      
      const data = await apiRequest<ExternalProduct[]>('', {
        externalApi: 'PRODUCTS',
        useCache: true,
        cacheKey: `external:suggestions_${query}`,
        cacheTags: ['external', 'suggestions'],
        timeout: 10000,
      });
      
      const suggestions = Array.isArray(data) 
        ? data
            .filter((product) => 
              product.title.toLowerCase().includes(query.toLowerCase()) ||
              product.category.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, limit)
            .map((product) => ({
              id: product.id.toString(),
              name: product.title,
              category: product.category,
              image: product.image,
              price: product.price,
              external: true
            }))
        : [];
      
      return suggestions;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('External suggestions API failed:', error);
      }
      return [];
    }
  },
};

export const apiUtils = {
  clearCache: (key?: string) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
    
    if (import.meta.env.DEV) {
      console.debug(`🧹 Cache cleared${key ? ` for key: ${key}` : ''}`);
    }
  },

  clearAuthCache: () => {
    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.includes('user') || key.includes('inquiries') || key.includes('auth') || key.includes('profile')) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => cache.delete(key));
    
    if (import.meta.env.DEV) {
      console.debug('🔐 Auth cache cleared');
    }
  },

  getCacheStats: () => {
    const now = Date.now();
    const entries = Array.from(cache.entries());
    const totalSize = entries.reduce((sum, [, entry]) => {
      try {
        const json = JSON.stringify(entry.data);
        return sum + new Blob([json]).size;
      } catch {
        return sum;
      }
    }, 0);
    
    const bySource = entries.reduce((acc, [, entry]) => {
      const source = entry.metadata?.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      size: cache.size,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      bySource,
      entries: entries.map(([key, entry]) => ({
        key: key.substring(0, 50),
        age: now - entry.timestamp,
        hits: entry.hits || 0,
        expired: now - entry.timestamp > CACHE_TTL,
        tags: entry.metadata?.tags || [],
        source: entry.metadata?.source,
        size: entry.metadata?.size
      })),
    };
  },

  preload: async (endpoints: string[]) => {
    const promises = endpoints.map(endpoint => 
      apiRequest(endpoint, { 
        useCache: true,
        cacheTags: ['preloaded'],
        timeout: 5000,
      }).catch(() => null)
    );
    return Promise.all(promises);
  },

  invalidateByTags: (tags: string[]) => {
    let count = 0;
    Array.from(cache.entries()).forEach(([key, entry]) => {
      const entryTags = entry.metadata?.tags || [];
      if (tags.some(tag => entryTags.includes(tag))) {
        cache.delete(key);
        count++;
      }
    });
    
    if (import.meta.env.DEV) {
      console.debug(`🗑️ Invalidated ${count} cache entries by tags: ${tags.join(', ')}`);
    }
  },

  estimateCacheSize: (): string => {
    let totalSize = 0;
    cache.forEach((entry) => {
      try {
        const json = JSON.stringify(entry.data);
        totalSize += new Blob([json]).size;
      } catch {
      }
    });
    return `${(totalSize / 1024).toFixed(2)} KB`;
  },

  getMetrics: (): RequestMetrics[] => {
    return [...requestMetrics];
  },

  clearMetrics: () => {
    requestMetrics.length = 0;
  },

  queueApiRequest: async <T>(endpoint: string, options: RequestOptions = {}): Promise<T | null> => {
    const queueKey = generateCacheKey(
      options.method || 'GET', 
      `${API_BASE_URL}${endpoint}`, 
      options.body
    );
    const requestFn = () => apiRequest<T>(endpoint, options);
    return queueRequest(queueKey, requestFn);
  },

  getRateLimiterStats: () => apiRateLimiter.getStats(),

  refreshCsrfToken: async (): Promise<string | null> => {
    return fetchCsrfToken();
  },

  setCsrfToken: (token: string) => {
    updateCsrfToken(token);
  },

  getCsrfToken: () => csrfToken,
};

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string; phone?: string }): Promise<any> => 
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        useCache: false,
        requiresAuth: false,
        timeout: 15000,
      }),
    
    login: (data: { email: string; password: string; rememberMe?: boolean }): Promise<any> => 
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        useCache: false,
        requiresAuth: false,
        timeout: 15000,
      }),
    
    logout: (): Promise<any> => 
      apiRequest('/auth/logout', { 
        method: 'POST',
        useCache: false,
        requiresAuth: true,
        timeout: 10000,
      }),
    
    status: (params?: { rememberToken?: string }): Promise<any> => {
      const url = params?.rememberToken 
        ? `/auth/status?rememberToken=${encodeURIComponent(params.rememberToken)}`
        : '/auth/status';
      
      return apiRequest(url, {
        method: 'GET',
        useCache: false,
        requiresAuth: false,
        timeout: 10000,
      });
    },
    
    forgotPassword: (email: string): Promise<any> => 
      apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        useCache: false,
        requiresAuth: false,
        timeout: 15000,
      }),
    
    resetPassword: (data: { token: string; password: string }): Promise<any> => 
      apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
        useCache: false,
        requiresAuth: false,
        timeout: 15000,
      }),
    
    checkEmail: (email: string): Promise<any> => 
      apiRequest(`/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        useCache: false,
        requiresAuth: false,
        timeout: 10000,
      }),
    
    validatePassword: (password: string): Promise<any> => 
      apiRequest('/auth/validate-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
        useCache: false,
        requiresAuth: false,
        timeout: 10000,
      }),
    
    refreshRememberToken: (): Promise<any> => 
      apiRequest('/auth/refresh-remember-token', {
        method: 'POST',
        useCache: false,
        requiresAuth: true,
        timeout: 10000,
      }),
  },

  products: {
    getAll: async (): Promise<Product[]> => {
      try {
        const localData = await apiRequest<Product[]>('/products', {
          cacheTags: ['products', 'all'],
          timeout: 10000,
        }).catch(() => null);
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
          return localData;
        }
        
        const externalProducts = await externalApi.getIndustrialProducts();
        return externalProducts.map(p => ({
          id: p.id.toString(),
          name: p.title,
          category: p.category,
          image: p.thumbnail || (p.images && p.images[0]) || '',
          description: p.title,
          price: p.price,
          external: true
        }));
      } catch {
        return [];
      }
    },
    
    getByCategory: async (category: string): Promise<Product[]> => {
      try {
        const localData = await apiRequest<Product[]>(`/products/category/${category}`, {
          cacheTags: ['products', 'category', category],
          timeout: 10000,
        }).catch(() => null);
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
          return localData;
        }
        
        const externalProducts = await externalApi.getIndustrialProducts(category);
        return externalProducts.map(p => ({
          id: p.id.toString(),
          name: p.title,
          category: p.category,
          image: p.thumbnail || (p.images && p.images[0]) || '',
          description: p.title,
          price: p.price,
          external: true
        }));
      } catch {
        return [];
      }
    },
    
    getById: async (id: string): Promise<Product | null> => {
      try {
        const data = await apiRequest<Product>(`/products/${id}`, {
          cacheTags: ['products', 'single', id],
          timeout: 10000,
        });
        return data || null;
      } catch {
        return null;
      }
    },
    
    search: async (params: { search?: string; category?: string }): Promise<Product[]> => {
      try {
        const query = new URLSearchParams();
        if (params.search) query.append('search', params.search);
        if (params.category) query.append('category', params.category);
        const queryString = query.toString();
        
        const data = await apiRequest<Product[]>(`/products/search${queryString ? `?${queryString}` : ''}`, {
          cacheTags: ['products', 'search', params.search || '', params.category || ''],
          timeout: 10000,
        });
        
        if ((!data || data.length === 0) && params.search) {
          const suggestions = await externalApi.getExternalSuggestions(params.search, 20);
          return suggestions.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            image: s.image,
            description: '',
            price: s.price,
            external: true
          }));
        }
        
        return data || [];
      } catch {
        return [];
      }
    },
    
    getSuggestions: async (query: string): Promise<any[]> => {
      try {
        if (!query || query.trim().length < 2) return [];
        
        const localSuggestions = await apiRequest<any[]>(`/products/search/suggestions?query=${encodeURIComponent(query)}`, {
          cacheTags: ['products', 'suggestions', query],
          timeout: 8000,
        }).catch(() => []);
        
        if (localSuggestions && localSuggestions.length > 0) {
          return localSuggestions;
        }
        
        return await externalApi.getExternalSuggestions(query);
      } catch {
        return [];
      }
    },
    
    getDiscounted: async (): Promise<Product[]> => {
      try {
        const data = await apiRequest<Product[]>('/products/discounted', {
          cacheTags: ['products', 'discounted'],
          timeout: 10000,
        });
        return data || [];
      } catch {
        return [];
      }
    },
    
    getPopular: async (): Promise<Product[]> => {
      try {
        const data = await apiRequest<Product[]>('/products/popular', {
          cacheTags: ['products', 'popular'],
          timeout: 10000,
        });
        return data || [];
      } catch {
        return [];
      }
    },
  },

  inquiries: {
    create: (data: { name: string; email: string; phone?: string; subject: string; message: string }): Promise<any> => 
      apiUtils.queueApiRequest('/inquiries', {
        method: 'POST',
        body: JSON.stringify(data),
        useCache: false,
        requiresAuth: false,
        invalidateTags: ['inquiries', 'user'],
        timeout: 15000,
      }),
    
    getUserInquiries: async (): Promise<any[]> => {
      try {
        return await apiRequest<any[]>('/user/inquiries', {
          requiresAuth: true,
          cacheTags: ['inquiries', 'user'],
          timeout: 10000,
        });
      } catch {
        return [];
      }
    },
  },

  users: {
    getProfile: async (id: string): Promise<any> => {
      try {
        return await apiRequest(`/users/${id}`, {
          requiresAuth: true,
          cacheTags: ['users', 'profile', id],
          timeout: 10000,
        });
      } catch {
        return null;
      }
    },
    
    updateProfile: (id: string, data: { name?: string; phone?: string }): Promise<any> => 
      apiUtils.queueApiRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        useCache: false,
        requiresAuth: true,
        invalidateTags: ['users', 'profile'],
        timeout: 15000,
      }),
  },

  external: externalApi,
  
  utils: apiUtils,

  health: async (): Promise<any> => {
    try {
      return await apiRequest('/health', {
        cacheTags: ['system', 'health'],
        timeout: 5000,
      });
    } catch {
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  },

  test: async (): Promise<any> => {
    try {
      return await apiRequest('/test', {
        cacheTags: ['system', 'test'],
        timeout: 5000,
      });
    } catch {
      return null;
    }
  },

  csrf: async (): Promise<any> => {
    try {
      return await apiRequest('/csrf-token', {
        cacheTags: ['system', 'csrf'],
        timeout: 5000,
      });
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

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).__API_DEBUG = {
    cacheStats: () => apiUtils.getCacheStats(),
    clearCache: apiUtils.clearCache,
    rateLimiter: apiRateLimiter,
    getMetrics: () => apiUtils.getMetrics(),
    clearMetrics: () => apiUtils.clearMetrics(),
    getRateLimiterStats: () => apiUtils.getRateLimiterStats(),
    cacheEntries: () => Array.from(cache.entries()),
    inflightRequests: () => Array.from(inflightRequests.keys()),
    requestQueue: () => Array.from(requestQueue.entries()),
    environment: getEnvironmentPrefix(),
    clientId: getOrCreateClientId(),
    csrfToken: apiUtils.getCsrfToken(),
    refreshCsrfToken: () => apiUtils.refreshCsrfToken(),
    setCsrfToken: (token: string) => apiUtils.setCsrfToken(token),
    cleanupCache,
    api: {
      auth: api.auth,
      products: api.products,
      health: api.health,
      test: api.test,
    },
  };
  
  console.log('🔧 API Debug tools available at window.__API_DEBUG');
  
  window.addEventListener('beforeunload', () => {
    apiRateLimiter.destroy();
  });
}

export type Transport = (url: string, options: RequestInit) => Promise<Response>;

let customTransport: Transport | null = null;

export function setTransport(transport: Transport) {
  customTransport = transport;
}

export function getTransport(): Transport {
  return customTransport || fetch;
}
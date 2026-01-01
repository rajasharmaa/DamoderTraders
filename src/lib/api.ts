// lib/api.ts
const API_BASE_URL = 'https://damodertraders.onrender.com/api';

// Cache configuration
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// External APIs configuration
const EXTERNAL_APIS = {
  PRODUCTS: 'https://fakestoreapi.com/products',
  INDUSTRIAL_SUPPLIES: 'https://dummyjson.com/products/category',
  GEOCODING: 'https://api.opencagedata.com/geocode/v1/json',
  // Add more external APIs as needed
};

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface RequestOptions extends RequestInit {
  useCache?: boolean;
  cacheKey?: string;
  retries?: number;
  externalApi?: keyof typeof EXTERNAL_APIS;
  externalEndpoint?: string;
  timeout?: number;
}

export async function apiRequest(
  endpoint: string, 
  options: RequestOptions = {}
) {
  const {
    useCache = true,
    cacheKey = endpoint,
    retries = 3,
    externalApi,
    externalEndpoint,
    timeout = 10000,
    ...fetchOptions
  } = options;

  // Check cache first
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  let url: string;
  
  // Determine if using external API
  if (externalApi && EXTERNAL_APIS[externalApi]) {
    if (externalEndpoint) {
      url = `${EXTERNAL_APIS[externalApi]}${externalEndpoint}`;
    } else {
      url = EXTERNAL_APIS[externalApi];
    }
  } else {
    url = `${API_BASE_URL}${endpoint}`;
  }

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  };

  // Add timeout support
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...fetchOptions,
        headers: {
          ...defaultOptions.headers,
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle specific status codes
      if (response.status === 400) {
        console.warn(`Bad request for endpoint: ${endpoint}`);
        if (endpoint.includes('/products/discounted') || endpoint.includes('/products/popular')) {
          return [];
        }
        return null;
      }

      if (response.status === 401) {
        // Handle unauthorized - get error message from response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Authentication failed' };
        }
        
        // For login endpoint, throw specific error messages
        if (endpoint.includes('/auth/login')) {
          const errorMessage = errorData.error || errorData.message || 'Invalid credentials';
          if (errorMessage.includes('User not found') || 
              errorMessage.includes('does not exist')) {
            throw new Error('ACCOUNT_NOT_FOUND');
          } else if (errorMessage.includes('Invalid password') || 
                     errorMessage.includes('credentials')) {
            throw new Error('INVALID_PASSWORD');
          } else {
            throw new Error('AUTHENTICATION_FAILED');
          }
        } else {
          throw new Error('SESSION_EXPIRED');
        }
      }

      if (response.status === 404) {
        console.warn(`Resource not found: ${endpoint}`);
        return null;
      }

      if (response.status === 429) {
        // Rate limiting - wait and retry
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (response.status === 500) {
        console.warn(`Server error 500 for endpoint: ${endpoint}`);
        if (endpoint.includes('/products') && !endpoint.match(/\/products\/[^\/]+$/)) {
          return [];
        }
        if (endpoint.match(/\/products\/[^\/]+$/) && !endpoint.includes('/products/search')) {
          return null;
        }
        throw new Error('Server error. Please try again later.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Cache the successful response
      if (useCache) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      lastError = error as Error;
      clearTimeout(timeoutId);
      
      // Don't retry on abort or specific errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      // Don't retry on authentication errors
      if (error.message === 'ACCOUNT_NOT_FOUND' || 
          error.message === 'INVALID_PASSWORD' ||
          error.message === 'AUTHENTICATION_FAILED') {
        throw error;
      }
      
      // Exponential backoff for retries
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`API request failed after ${retries} retries for endpoint:`, endpoint, lastError);
  throw lastError;
}

// External API specific functions
export const externalApi = {
  // Fetch industrial products from dummyjson
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
      });
      
      return data?.products || [];
    } catch (error) {
      console.warn('Failed to fetch industrial products:', error);
      return [];
    }
  },

  // Get product suggestions from external API
  getExternalSuggestions: async (query: string, limit = 5) => {
    try {
      if (!query || query.trim().length < 2) return [];
      
      const data = await apiRequest('', {
        externalApi: 'PRODUCTS',
        useCache: true,
        cacheKey: `suggestions_${query}`,
      });
      
      // Filter by query
      const suggestions = Array.isArray(data) 
        ? data
            .filter((product: any) => 
              product.title.toLowerCase().includes(query.toLowerCase()) ||
              product.description.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, limit)
            .map((product: any) => ({
              id: product.id,
              name: product.title,
              category: product.category,
              image: product.image,
              price: product.price,
            }))
        : [];
      
      return suggestions;
    } catch (error) {
      console.warn('Failed to fetch external suggestions:', error);
      return [];
    }
  },

  // Get location data
  getLocation: async (latitude: number, longitude: number) => {
    try {
      const apiKey = process.env.REACT_APP_GEOCODING_API_KEY;
      if (!apiKey) {
        throw new Error('Geocoding API key not configured');
      }
      
      const data = await apiRequest('', {
        externalApi: 'GEOCODING',
        externalEndpoint: `?q=${latitude}+${longitude}&key=${apiKey}&pretty=1`,
        useCache: true,
        cacheKey: `location_${latitude}_${longitude}`,
      });
      
      return data;
    } catch (error) {
      console.warn('Failed to fetch location:', error);
      return null;
    }
  },

  // Get currency exchange rates
  getExchangeRates: async (baseCurrency = 'INR') => {
    try {
      const data = await apiRequest('', {
        useCache: true,
        cacheKey: `exchange_rates_${baseCurrency}_${new Date().toISOString().split('T')[0]}`,
      });
      
      return data;
    } catch (error) {
      console.warn('Failed to fetch exchange rates:', error);
      return null;
    }
  },
};

// Cache management utilities
export const apiUtils = {
  clearCache: (key?: string) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  },

  getCacheStats: () => {
    return {
      size: cache.size,
      entries: Array.from(cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
      })),
    };
  },

  preload: async (endpoints: string[]) => {
    const promises = endpoints.map(endpoint => 
      apiRequest(endpoint, { useCache: true }).catch(() => null)
    );
    return Promise.all(promises);
  },
};

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
    status: () => apiRequest('/auth/status'),
    // Add forgot password endpoints
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

  // Product endpoints
  products: {
    getAll: async () => {
      try {
        // Try local API first, fallback to external
        const localData = await apiRequest('/products').catch(() => null);
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
          return localData;
        }
        
        // Fallback to external API
        console.log('Falling back to external API for products');
        return await externalApi.getIndustrialProducts();
      } catch {
        return [];
      }
    },
    getByCategory: async (category: string) => {
      try {
        const localData = await apiRequest(`/products/category/${category}`).catch(() => null);
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
          return localData;
        }
        
        // Fallback to external API
        console.log(`Falling back to external API for ${category} products`);
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
        
        const data = await apiRequest(`/products/search${queryString ? `?${queryString}` : ''}`);
        
        // If no results from local API, try external
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
        
        // Try local API first
        const localSuggestions = await apiRequest(`/products/search/suggestions?query=${encodeURIComponent(query)}`)
          .catch(() => []);
        
        if (localSuggestions && localSuggestions.length > 0) {
          return localSuggestions;
        }
        
        // Fallback to external API
        return await externalApi.getExternalSuggestions(query);
      } catch {
        return [];
      }
    },
    getDiscounted: async () => {
      try {
        const data = await apiRequest('/products/discounted');
        return data || [];
      } catch (error) {
        console.warn('Failed to fetch discounted products:', error);
        return [];
      }
    },
    getPopular: async () => {
      try {
        const data = await apiRequest('/products/popular');
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

  // External APIs
  external: externalApi,

  // Utilities
  utils: apiUtils,

  // Health check with external API fallback
  health: async () => {
    try {
      const localHealth = await apiRequest('/health').catch(() => null);
      
      if (localHealth) {
        return localHealth;
      }
      
      // Check external API as fallback
      try {
        const response = await fetch('https://httpbin.org/get', {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        
        return {
          status: response.ok ? 'HEALTHY' : 'DEGRADED',
          external: response.ok,
          timestamp: new Date().toISOString(),
        };
      } catch {
        return {
          status: 'ERROR',
          external: false,
          timestamp: new Date().toISOString(),
        };
      }
    } catch {
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  },
};

// Type definitions for better TypeScript support
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
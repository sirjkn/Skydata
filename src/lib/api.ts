/**
 * API Client for Skyway Suites
 * Handles all HTTP requests to the Vercel backend
 */

// API Base URL - Update this after deploying to Vercel
const API_BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api`
  : 'http://localhost:3000/api'; // For local development

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Generic fetch wrapper with auth
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// =============================================
// AUTH API
// =============================================

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: 'Customer' | 'Admin' | 'Manager';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    user_id: number;
    customer_name: string;
    email: string;
    role: string;
  };
  token: string;
}

export const authAPI = {
  signUp: (data: SignUpData) => 
    apiFetch<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  signIn: (data: SignInData) =>
    apiFetch<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  resetPassword: (email: string, newPassword: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    }),
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// =============================================
// PROPERTIES API
// =============================================

export const propertiesAPI = {
  getAll: () => 
    apiFetch<{ properties: any[] }>('/properties'),
  
  getById: (id: number) =>
    apiFetch<{ property: any }>(`/properties/${id}`),
  
  create: (data: any) =>
    apiFetch<{ property: any }>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    apiFetch<{ property: any }>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    apiFetch<{ success: boolean }>(`/properties/${id}`, {
      method: 'DELETE',
    }),
};

// =============================================
// BOOKINGS API
// =============================================

export const bookingsAPI = {
  getAll: () =>
    apiFetch<{ bookings: any[] }>('/bookings'),
  
  create: (data: any) =>
    apiFetch<{ booking: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    apiFetch<{ booking: any }>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// =============================================
// CUSTOMERS API
// =============================================

export const customersAPI = {
  getAll: () =>
    apiFetch<{ customers: any[] }>('/customers'),
  
  create: (data: any) =>
    apiFetch<{ customer: any }>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// =============================================
// CATEGORIES & FEATURES API
// =============================================

export const categoriesAPI = {
  getAll: () =>
    apiFetch<{ categories: any[] }>('/categories'),
};

export const featuresAPI = {
  getAll: () =>
    apiFetch<{ features: any[] }>('/features'),
};

// =============================================
// SETTINGS API
// =============================================

export const settingsAPI = {
  getAll: () =>
    apiFetch<{ settings: any[] }>('/settings'),
  
  update: (category: string, key: string, value: string) =>
    apiFetch<{ setting: any }>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ setting_category: category, setting_key: key, setting_value: value }),
    }),
};

// =============================================
// ACTIVITY LOGS API
// =============================================

export const activityLogsAPI = {
  getAll: () =>
    apiFetch<{ logs: any[] }>('/activity-logs'),
  
  create: (data: any) =>
    apiFetch<{ log: any }>('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// =============================================
// CLOUDINARY API
// =============================================

export const cloudinaryAPI = {
  getSignature: () =>
    apiFetch<{ signature: string; timestamp: number; cloudName: string; apiKey: string }>('/cloudinary/signature', {
      method: 'POST',
    }),
};

// =============================================
// HEALTH CHECK
// =============================================

export const healthAPI = {
  check: () =>
    apiFetch<{ status: string; database: string; storage: string }>('/health'),
};

// =============================================
// EXPORT ALL
// =============================================

export default {
  auth: authAPI,
  properties: propertiesAPI,
  bookings: bookingsAPI,
  customers: customersAPI,
  categories: categoriesAPI,
  features: featuresAPI,
  settings: settingsAPI,
  activityLogs: activityLogsAPI,
  cloudinary: cloudinaryAPI,
  health: healthAPI,
};

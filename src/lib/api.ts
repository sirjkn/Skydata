/**
 * API Client for Neon Database via Vercel Serverless Functions
 * Replaces Supabase client
 */

const API_BASE_URL = 'https://skydata.vercel.app/api';

// Check if API is available (simple cache to avoid repeated checks)
let apiAvailabilityCache: { available: boolean; lastCheck: number } | null = null;
const API_CHECK_CACHE_DURATION = 30000; // 30 seconds

async function isApiAvailable(): Promise<boolean> {
  // Return cached result if recent
  if (apiAvailabilityCache && Date.now() - apiAvailabilityCache.lastCheck < API_CHECK_CACHE_DURATION) {
    return apiAvailabilityCache.available;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    const available = response.ok;
    apiAvailabilityCache = { available, lastCheck: Date.now() };
    return available;
  } catch (error) {
    apiAvailabilityCache = { available: false, lastCheck: Date.now() };
    return false;
  }
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  try {
    const auth = localStorage.getItem('skyway_auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.token;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
}

// Generic fetch wrapper
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Quick check if API is likely available
  if (apiAvailabilityCache && !apiAvailabilityCache.available) {
    throw new Error('API_UNAVAILABLE');
  }

  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }
    
    return response.json();
  } catch (error: any) {
    // Mark API as unavailable on network errors
    if (error.name === 'TypeError' || error.name === 'AbortError') {
      apiAvailabilityCache = { available: false, lastCheck: Date.now() };
    }
    throw error;
  }
}

// =============================================
// PROPERTIES
// =============================================

export async function fetchProperties() {
  const data = await apiFetch<{ properties: any[] }>('/properties');
  return { data: data.properties, error: null };
}

export async function fetchProperty(id: number) {
  const data = await apiFetch<{ property: any }>(`/properties/${id}`);
  return { data: data.property, error: null };
}

export async function createProperty(propertyData: any) {
  const data = await apiFetch<{ property: any }>('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
  return { data: data.property, error: null };
}

export async function updateProperty(id: number, propertyData: any) {
  const data = await apiFetch<{ property: any }>(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData),
  });
  return { data: data.property, error: null };
}

export async function deleteProperty(id: number) {
  await apiFetch(`/properties/${id}`, { method: 'DELETE' });
  return { data: null, error: null };
}

// =============================================
// CATEGORIES
// =============================================

export async function fetchCategories() {
  const data = await apiFetch<{ categories: any[] }>('/categories');
  return { data: data.categories, error: null };
}

// =============================================
// FEATURES
// =============================================

export async function fetchFeatures() {
  const data = await apiFetch<{ features: any[] }>('/features');
  return { data: data.features, error: null };
}

// =============================================
// BOOKINGS
// =============================================

export async function fetchBookings() {
  const data = await apiFetch<{ bookings: any[] }>('/bookings');
  return { data: data.bookings, error: null };
}

export async function createBooking(bookingData: any) {
  const data = await apiFetch<{ booking: any }>('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
  return { data: data.booking, error: null };
}

export async function updateBooking(id: number, bookingData: any) {
  const data = await apiFetch<{ booking: any }>(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookingData),
  });
  return { data: data.booking, error: null };
}

// =============================================
// CUSTOMERS
// =============================================

export async function fetchCustomers() {
  const data = await apiFetch<{ customers: any[] }>('/customers');
  return { data: data.customers, error: null };
}

export async function createCustomer(customerData: any) {
  const data = await apiFetch<{ customer: any }>('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
  return { data: data.customer, error: null };
}

// =============================================
// SETTINGS
// =============================================

export async function fetchSettings() {
  const data = await apiFetch<{ settings: any[] }>('/settings');
  return { data: data.settings, error: null };
}

export async function fetchSettingByKey(category: string, key: string) {
  try {
    const data = await apiFetch<{ setting: any }>(`/settings/${category}/${key}`);
    return { data: data.setting, error: null };
  } catch (error) {
    // Silently fail and return null - fallback will handle mock data
    return { data: null, error };
  }
}

export async function updateSetting(category: string, key: string, value: string) {
  const data = await apiFetch<{ setting: any }>('/settings', {
    method: 'PUT',
    body: JSON.stringify({
      setting_category: category,
      setting_key: key,
      setting_value: value,
    }),
  });
  return { data: data.setting, error: null };
}

// =============================================
// ACTIVITY LOGS
// =============================================

export async function fetchActivityLogs() {
  const data = await apiFetch<{ logs: any[] }>('/activity-logs');
  return { data: data.logs, error: null };
}

export async function createActivityLog(logData: any) {
  const data = await apiFetch<{ log: any }>('/activity-logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
  return { data: data.log, error: null };
}

// =============================================
// MENU PAGES
// =============================================

export async function fetchMenuPages() {
  try {
    const data = await apiFetch<{ pages: any[] }>('/menu-pages');
    return { data: data.pages, error: null };
  } catch (error) {
    // Silently fail and return empty array - fallback will handle mock data
    return { data: [], error };
  }
}

// =============================================
// AUTH USERS
// =============================================

export async function fetchAuthUsers() {
  try {
    const data = await apiFetch<{ users: any[] }>('/auth/users');
    return { data: data.users, error: null };
  } catch (error) {
    // Silently fail and return empty array - fallback will handle mock data
    return { data: [], error };
  }
}

// =============================================
// AUTH
// =============================================

export async function signUp(email: string, password: string, name: string, role: string = 'Customer') {
  const data = await apiFetch<{ user: any; token: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
  
  // Store auth data
  localStorage.setItem('skyway_auth', JSON.stringify({
    user: data.user,
    token: data.token,
  }));
  
  return { data: data.user, error: null };
}

export async function signIn(email: string, password: string) {
  const data = await apiFetch<{ user: any; token: string }>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store auth data
  localStorage.setItem('skyway_auth', JSON.stringify({
    user: data.user,
    token: data.token,
  }));
  
  return { data: data.user, error: null };
}

export async function signOut() {
  localStorage.removeItem('skyway_auth');
  return { data: null, error: null };
}

export async function resetPassword(email: string, newPassword: string) {
  await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
  return { data: null, error: null };
}

export function getCurrentUser() {
  try {
    const auth = localStorage.getItem('skyway_auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.user;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
}

// =============================================
// CLOUDINARY
// =============================================

export async function getCloudinarySignature() {
  const data = await apiFetch<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
  }>('/cloudinary/signature', {
    method: 'POST',
  });
  return data;
}

// Export default object for backward compatibility
const api = {
  fetchProperties,
  fetchProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  fetchCategories,
  fetchFeatures,
  fetchBookings,
  createBooking,
  updateBooking,
  fetchCustomers,
  createCustomer,
  fetchSettings,
  fetchSettingByKey,
  updateSetting,
  fetchActivityLogs,
  createActivityLog,
  fetchMenuPages,
  fetchAuthUsers,
  signUp,
  signIn,
  signOut,
  resetPassword,
  getCurrentUser,
  getCloudinarySignature,
};

export default api;
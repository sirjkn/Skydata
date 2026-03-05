import { projectId, publicAnonKey } from '/utils/supabase/info';

// Check if Supabase mode is enabled
export const isSupabaseEnabled = (): boolean => {
  const settings = JSON.parse(localStorage.getItem('skyway_settings') || '{}');
  return settings.useSupabase === true;
};

// Get auth token for Supabase requests
const getAuthToken = (): string | null => {
  const authData = JSON.parse(localStorage.getItem('skyway_auth') || '{}');
  return authData.token || null;
};

// Base API URL
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6a712830`;

// Generic fetch with auth
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    };
    
    // Increase timeout for sync operations which can take longer with large datasets
    const timeoutMs = endpoint.includes('/sync/') ? 180000 : 30000; // 3 minutes for sync, 30s for others
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    // If fetch fails completely (network error, timeout, etc), throw a clear error
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new Error('Request timeout - This usually happens with large amounts of data. Try syncing again.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to Supabase - check your internet connection or server deployment');
      }
      throw error;
    }
    throw new Error('Unknown network error');
  }
};

// ===== PROPERTIES =====

export const getProperties = async (): Promise<any[]> => {
  // ALWAYS read from localStorage (source of truth for UI)
  // Supabase is just a sync backup, not the primary data source
  return JSON.parse(localStorage.getItem('skyway_properties') || '[]');
};

export const saveProperty = async (property: any): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  const existingIndex = properties.findIndex((p: any) => p.id === property.id);
  
  if (existingIndex >= 0) {
    properties[existingIndex] = property;
  } else {
    properties.push(property);
  }
  
  localStorage.setItem('skyway_properties', JSON.stringify(properties));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    if (property.id && property.id !== '') {
      // Update existing
      await fetchWithAuth(`/properties/${property.id}`, {
        method: 'PUT',
        body: JSON.stringify(property),
      });
    } else {
      // Create new
      await fetchWithAuth('/properties', {
        method: 'POST',
        body: JSON.stringify(property),
      });
    }
  }
};

export const deleteProperty = async (id: string | number): Promise<void> => {
  // ALWAYS delete from localStorage first (source of truth for UI)
  const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  const filtered = properties.filter((p: any) => p.id !== id);
  localStorage.setItem('skyway_properties', JSON.stringify(filtered));
  
  // THEN delete from Supabase if enabled
  if (isSupabaseEnabled()) {
    await fetchWithAuth(`/properties/${id}`, {
      method: 'DELETE',
    });
  }
};

export const setProperties = async (properties: any[]): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  localStorage.setItem('skyway_properties', JSON.stringify(properties));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    // Batch save all properties
    for (const property of properties) {
      await saveProperty(property);
    }
  }
};

// ===== CUSTOMERS =====

export const getCustomers = async (): Promise<any[]> => {
  // ALWAYS read from localStorage (source of truth for UI)
  // Supabase is just a sync backup, not the primary data source
  return JSON.parse(localStorage.getItem('skyway_customers') || '[]');
};

export const saveCustomer = async (customer: any): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  const customers = JSON.parse(localStorage.getItem('skyway_customers') || '[]');
  const existingIndex = customers.findIndex((c: any) => c.id === customer.id);
  
  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers.push(customer);
  }
  
  localStorage.setItem('skyway_customers', JSON.stringify(customers));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    if (customer.id && customer.id !== '') {
      await fetchWithAuth(`/customers/${customer.id}`, {
        method: 'PUT',
        body: JSON.stringify(customer),
      });
    } else {
      await fetchWithAuth('/customers', {
        method: 'POST',
        body: JSON.stringify(customer),
      });
    }
  }
};

export const deleteCustomer = async (id: string | number): Promise<void> => {
  // ALWAYS delete from localStorage first (source of truth for UI)
  const customers = JSON.parse(localStorage.getItem('skyway_customers') || '[]');
  const filtered = customers.filter((c: any) => c.id !== id);
  localStorage.setItem('skyway_customers', JSON.stringify(filtered));
  
  // THEN delete from Supabase if enabled
  if (isSupabaseEnabled()) {
    await fetchWithAuth(`/customers/${id}`, {
      method: 'DELETE',
    });
  }
};

export const setCustomers = async (customers: any[]): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  localStorage.setItem('skyway_customers', JSON.stringify(customers));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    for (const customer of customers) {
      await saveCustomer(customer);
    }
  }
};

// ===== BOOKINGS =====

export const getBookings = async (): Promise<any[]> => {
  // ALWAYS read from localStorage (source of truth for UI)
  // Supabase is just a sync backup, not the primary data source
  return JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
};

export const saveBooking = async (booking: any): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  const existingIndex = bookings.findIndex((b: any) => b.id === booking.id);
  
  if (existingIndex >= 0) {
    bookings[existingIndex] = booking;
  } else {
    bookings.push(booking);
  }
  
  localStorage.setItem('skyway_bookings', JSON.stringify(bookings));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    if (booking.id && booking.id !== '') {
      await fetchWithAuth(`/bookings/${booking.id}`, {
        method: 'PUT',
        body: JSON.stringify(booking),
      });
    } else {
      await fetchWithAuth('/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
      });
    }
  }
};

export const deleteBooking = async (id: string | number): Promise<void> => {
  // ALWAYS delete from localStorage first (source of truth for UI)
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  const filtered = bookings.filter((b: any) => b.id !== id);
  localStorage.setItem('skyway_bookings', JSON.stringify(filtered));
  
  // THEN delete from Supabase if enabled
  if (isSupabaseEnabled()) {
    try {
      await fetchWithAuth(`/bookings/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // If DELETE endpoint not available, mark as cancelled instead
      console.warn('Booking DELETE endpoint not available, marking as cancelled');
      const booking = bookings.find((b: any) => b.id === id);
      if (booking) {
        await saveBooking({ ...booking, status: 'Cancelled' });
      }
    }
  }
};

export const setBookings = async (bookings: any[]): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  localStorage.setItem('skyway_bookings', JSON.stringify(bookings));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    for (const booking of bookings) {
      await saveBooking(booking);
    }
  }
};

// ===== PAYMENTS =====

export const getPayments = async (): Promise<any[]> => {
  // ALWAYS read from localStorage (source of truth for UI)
  // Supabase is just a sync backup, not the primary data source
  return JSON.parse(localStorage.getItem('skyway_payments') || '[]');
};

export const savePayment = async (payment: any): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
  const existingIndex = payments.findIndex((p: any) => p.id === payment.id);
  
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  
  localStorage.setItem('skyway_payments', JSON.stringify(payments));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    await fetchWithAuth('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }
};

export const deletePayment = async (id: string | number): Promise<void> => {
  // ALWAYS delete from localStorage first (source of truth for UI)
  const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
  const filtered = payments.filter((p: any) => p.id !== id);
  localStorage.setItem('skyway_payments', JSON.stringify(filtered));
  
  // THEN delete from Supabase if enabled
  if (isSupabaseEnabled()) {
    await fetchWithAuth(`/payments/${id}`, {
      method: 'DELETE',
    });
  }
};

export const setPayments = async (payments: any[]): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  localStorage.setItem('skyway_payments', JSON.stringify(payments));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    for (const payment of payments) {
      await savePayment(payment);
    }
  }
};

// ===== CATEGORIES =====

export const getCategories = async (): Promise<string[]> => {
  // ALWAYS read from localStorage (source of truth for UI)
  // Supabase is just a sync backup, not the primary data source
  return JSON.parse(localStorage.getItem('skyway_categories') || '[]');
};

export const setCategories = async (categories: string[]): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  localStorage.setItem('skyway_categories', JSON.stringify(categories));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    await fetchWithAuth('/categories', {
      method: 'PUT',
      body: JSON.stringify({ categories }),
    });
  }
};

// ===== FEATURES =====

export const getFeatures = async (): Promise<string[]> => {
  // ALWAYS read from localStorage (source of truth for UI)
  // Supabase is just a sync backup, not the primary data source
  return JSON.parse(localStorage.getItem('skyway_features') || '[]');
};

export const setFeatures = async (features: string[]): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  localStorage.setItem('skyway_features', JSON.stringify(features));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    await fetchWithAuth('/features', {
      method: 'PUT',
      body: JSON.stringify({ features }),
    });
  }
};

// ===== SETTINGS =====

export const getSettings = async (): Promise<any> => {
  // Always read from localStorage first to get the useSupabase flag
  const localSettings = JSON.parse(localStorage.getItem('skyway_settings') || '{}');
  
  if (localSettings.useSupabase) {
    try {
      const data = await fetchWithAuth('/settings');
      return data.settings || localSettings;
    } catch (error) {
      console.error('Error fetching settings from Supabase:', error);
      return localSettings;
    }
  } else {
    return localSettings;
  }
};

export const saveSettings = async (settings: any): Promise<void> => {
  // Always save to localStorage first
  localStorage.setItem('skyway_settings', JSON.stringify(settings));
  
  if (settings.useSupabase) {
    try {
      await fetchWithAuth('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      
      // Trigger full bidirectional sync after settings save
      window.dispatchEvent(new CustomEvent('triggerFullSync'));
    } catch (error) {
      console.error('Error saving settings to Supabase:', error);
    }
  }
  
  // Dispatch settings changed event
  window.dispatchEvent(new Event('settingsChanged'));
};

// ===== ACTIVITY LOGS =====

export const getActivityLogs = async (): Promise<any[]> => {
  // ALWAYS read from localStorage (source of truth for UI)
  // Supabase is just a sync backup, not the primary data source
  return JSON.parse(localStorage.getItem('skyway_activity_logs') || '[]');
};

export const saveActivityLog = async (log: any): Promise<void> => {
  // ALWAYS update localStorage first (source of truth for UI)
  const logs = JSON.parse(localStorage.getItem('skyway_activity_logs') || '[]');
  logs.push(log);
  localStorage.setItem('skyway_activity_logs', JSON.stringify(logs));
  
  // THEN sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    await fetchWithAuth('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }
};

// ===== SYNC FUNCTIONS =====

export const syncToSupabase = async (): Promise<any> => {
  try {
    const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
    const customers = JSON.parse(localStorage.getItem('skyway_customers') || '[]');
    const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
    const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
    const categories = JSON.parse(localStorage.getItem('skyway_categories') || '[]');
    const features = JSON.parse(localStorage.getItem('skyway_features') || '[]');
    const settings = JSON.parse(localStorage.getItem('skyway_settings') || '{}');
    const activityLogs = JSON.parse(localStorage.getItem('skyway_activity_logs') || '[]');
    
    const totalItems = properties.length + customers.length + bookings.length + payments.length + activityLogs.length;
    
    // Log data sizes for debugging
    console.log('🔄 Syncing data to Supabase:', {
      properties: properties.length,
      customers: customers.length,
      bookings: bookings.length,
      payments: payments.length,
      activityLogs: activityLogs.length,
      totalItems
    });
    
    // For very large datasets (>100 total items), warn user it may take time
    if (totalItems > 100) {
      console.log('⚠️ Large dataset detected. This may take 1-2 minutes...');
    }
    
    const result = await fetchWithAuth('/sync/upload', {
      method: 'POST',
      body: JSON.stringify({
        properties,
        customers,
        bookings,
        payments,
        categories,
        features,
        settings,
        activityLogs,
      }),
    });
    
    console.log('✅ Sync completed successfully');
    return result;
  } catch (error: any) {
    console.error('❌ Sync to Supabase failed:', error);
    throw new Error(`Failed to sync data: ${error.message || 'Unknown error'}`);
  }
};

export const syncFromSupabase = async (): Promise<void> => {
  const data = await fetchWithAuth('/sync/download');
  
  // Save all data to localStorage
  if (data.properties) localStorage.setItem('skyway_properties', JSON.stringify(data.properties));
  if (data.customers) localStorage.setItem('skyway_customers', JSON.stringify(data.customers));
  if (data.bookings) localStorage.setItem('skyway_bookings', JSON.stringify(data.bookings));
  if (data.payments) localStorage.setItem('skyway_payments', JSON.stringify(data.payments));
  if (data.categories) localStorage.setItem('skyway_categories', JSON.stringify(data.categories));
  if (data.features) localStorage.setItem('skyway_features', JSON.stringify(data.features));
  if (data.settings) localStorage.setItem('skyway_settings', JSON.stringify(data.settings));
  if (data.activityLogs) localStorage.setItem('skyway_activity_logs', JSON.stringify(data.activityLogs));
};

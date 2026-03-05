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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// ===== PROPERTIES =====

export const getProperties = async (): Promise<any[]> => {
  if (isSupabaseEnabled()) {
    const data = await fetchWithAuth('/properties');
    return data.properties || [];
  } else {
    return JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  }
};

export const saveProperty = async (property: any): Promise<void> => {
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
  } else {
    const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
    const existingIndex = properties.findIndex((p: any) => p.id === property.id);
    
    if (existingIndex >= 0) {
      properties[existingIndex] = property;
    } else {
      properties.push(property);
    }
    
    localStorage.setItem('skyway_properties', JSON.stringify(properties));
  }
};

export const deleteProperty = async (id: string | number): Promise<void> => {
  if (isSupabaseEnabled()) {
    await fetchWithAuth(`/properties/${id}`, {
      method: 'DELETE',
    });
  } else {
    const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
    const filtered = properties.filter((p: any) => p.id !== id);
    localStorage.setItem('skyway_properties', JSON.stringify(filtered));
  }
};

export const setProperties = async (properties: any[]): Promise<void> => {
  if (isSupabaseEnabled()) {
    // Batch save all properties
    for (const property of properties) {
      await saveProperty(property);
    }
  } else {
    localStorage.setItem('skyway_properties', JSON.stringify(properties));
  }
};

// ===== CUSTOMERS =====

export const getCustomers = async (): Promise<any[]> => {
  if (isSupabaseEnabled()) {
    const data = await fetchWithAuth('/customers');
    return data.customers || [];
  } else {
    return JSON.parse(localStorage.getItem('skyway_customers') || '[]');
  }
};

export const saveCustomer = async (customer: any): Promise<void> => {
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
  } else {
    const customers = JSON.parse(localStorage.getItem('skyway_customers') || '[]');
    const existingIndex = customers.findIndex((c: any) => c.id === customer.id);
    
    if (existingIndex >= 0) {
      customers[existingIndex] = customer;
    } else {
      customers.push(customer);
    }
    
    localStorage.setItem('skyway_customers', JSON.stringify(customers));
  }
};

export const deleteCustomer = async (id: string | number): Promise<void> => {
  if (isSupabaseEnabled()) {
    await fetchWithAuth(`/customers/${id}`, {
      method: 'DELETE',
    });
  } else {
    const customers = JSON.parse(localStorage.getItem('skyway_customers') || '[]');
    const filtered = customers.filter((c: any) => c.id !== id);
    localStorage.setItem('skyway_customers', JSON.stringify(filtered));
  }
};

export const setCustomers = async (customers: any[]): Promise<void> => {
  if (isSupabaseEnabled()) {
    for (const customer of customers) {
      await saveCustomer(customer);
    }
  } else {
    localStorage.setItem('skyway_customers', JSON.stringify(customers));
  }
};

// ===== BOOKINGS =====

export const getBookings = async (): Promise<any[]> => {
  if (isSupabaseEnabled()) {
    const data = await fetchWithAuth('/bookings');
    return data.bookings || [];
  } else {
    return JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  }
};

export const saveBooking = async (booking: any): Promise<void> => {
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
  } else {
    const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
    const existingIndex = bookings.findIndex((b: any) => b.id === booking.id);
    
    if (existingIndex >= 0) {
      bookings[existingIndex] = booking;
    } else {
      bookings.push(booking);
    }
    
    localStorage.setItem('skyway_bookings', JSON.stringify(bookings));
  }
};

export const deleteBooking = async (id: string | number): Promise<void> => {
  if (isSupabaseEnabled()) {
    // Note: Delete endpoint for bookings should be added to server
    // For now, we'll update the status
    const bookings = await getBookings();
    const booking = bookings.find((b: any) => b.id === id);
    if (booking) {
      await saveBooking({ ...booking, status: 'Cancelled' });
    }
  } else {
    const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
    const filtered = bookings.filter((b: any) => b.id !== id);
    localStorage.setItem('skyway_bookings', JSON.stringify(filtered));
  }
};

export const setBookings = async (bookings: any[]): Promise<void> => {
  if (isSupabaseEnabled()) {
    for (const booking of bookings) {
      await saveBooking(booking);
    }
  } else {
    localStorage.setItem('skyway_bookings', JSON.stringify(bookings));
  }
};

// ===== PAYMENTS =====

export const getPayments = async (): Promise<any[]> => {
  if (isSupabaseEnabled()) {
    const data = await fetchWithAuth('/payments');
    return data.payments || [];
  } else {
    return JSON.parse(localStorage.getItem('skyway_payments') || '[]');
  }
};

export const savePayment = async (payment: any): Promise<void> => {
  if (isSupabaseEnabled()) {
    await fetchWithAuth('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  } else {
    const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
    const existingIndex = payments.findIndex((p: any) => p.id === payment.id);
    
    if (existingIndex >= 0) {
      payments[existingIndex] = payment;
    } else {
      payments.push(payment);
    }
    
    localStorage.setItem('skyway_payments', JSON.stringify(payments));
  }
};

export const deletePayment = async (id: string | number): Promise<void> => {
  if (isSupabaseEnabled()) {
    await fetchWithAuth(`/payments/${id}`, {
      method: 'DELETE',
    });
  } else {
    const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
    const filtered = payments.filter((p: any) => p.id !== id);
    localStorage.setItem('skyway_payments', JSON.stringify(filtered));
  }
};

export const setPayments = async (payments: any[]): Promise<void> => {
  if (isSupabaseEnabled()) {
    for (const payment of payments) {
      await savePayment(payment);
    }
  } else {
    localStorage.setItem('skyway_payments', JSON.stringify(payments));
  }
};

// ===== CATEGORIES =====

export const getCategories = async (): Promise<string[]> => {
  if (isSupabaseEnabled()) {
    const data = await fetchWithAuth('/categories');
    return data.categories || [];
  } else {
    return JSON.parse(localStorage.getItem('skyway_categories') || '[]');
  }
};

export const setCategories = async (categories: string[]): Promise<void> => {
  if (isSupabaseEnabled()) {
    await fetchWithAuth('/categories', {
      method: 'PUT',
      body: JSON.stringify({ categories }),
    });
  } else {
    localStorage.setItem('skyway_categories', JSON.stringify(categories));
  }
};

// ===== FEATURES =====

export const getFeatures = async (): Promise<string[]> => {
  if (isSupabaseEnabled()) {
    const data = await fetchWithAuth('/features');
    return data.features || [];
  } else {
    return JSON.parse(localStorage.getItem('skyway_features') || '[]');
  }
};

export const setFeatures = async (features: string[]): Promise<void> => {
  if (isSupabaseEnabled()) {
    await fetchWithAuth('/features', {
      method: 'PUT',
      body: JSON.stringify({ features }),
    });
  } else {
    localStorage.setItem('skyway_features', JSON.stringify(features));
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
  if (isSupabaseEnabled()) {
    const data = await fetchWithAuth('/activity-logs');
    return data.logs || [];
  } else {
    return JSON.parse(localStorage.getItem('skyway_activity_logs') || '[]');
  }
};

export const saveActivityLog = async (log: any): Promise<void> => {
  if (isSupabaseEnabled()) {
    await fetchWithAuth('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  } else {
    const logs = JSON.parse(localStorage.getItem('skyway_activity_logs') || '[]');
    logs.push(log);
    localStorage.setItem('skyway_activity_logs', JSON.stringify(logs));
  }
};

// ===== SYNC FUNCTIONS =====

export const syncToSupabase = async (): Promise<any> => {
  const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  const customers = JSON.parse(localStorage.getItem('skyway_customers') || '[]');
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
  const categories = JSON.parse(localStorage.getItem('skyway_categories') || '[]');
  const features = JSON.parse(localStorage.getItem('skyway_features') || '[]');
  const settings = JSON.parse(localStorage.getItem('skyway_settings') || '{}');
  const activityLogs = JSON.parse(localStorage.getItem('skyway_activity_logs') || '[]');
  
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
  
  return result;
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

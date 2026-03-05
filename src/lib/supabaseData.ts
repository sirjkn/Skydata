/**
 * Supabase Data Service Layer for Skyway Suites
 * Replaces localStorage with cloud-based Supabase operations
 * Version 3.0 - Complete Cloud Integration
 */

import { getSupabaseClient } from './supabase';
import { checkConnection } from './connectionStatus';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Property {
  property_id?: number;
  property_name: string;
  category_id: number | null;
  location: string;
  no_of_beds: number;
  bathrooms: number;
  area_sqft: number | null;
  description: string | null;
  price_per_month: number;
  security_deposit: number | null;
  photos: string; // JSON string
  features: string; // JSON string
  is_available: boolean;
  is_featured: boolean;
  view_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  customer_id?: number;
  customer_name: string;
  phone: string;
  email: string;
  address: string | null;
  password: string | null;
  id_number: string | null;
  profile_photo: string | null;
  notes: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  booking_id?: number;
  customer_id: number;
  property_id: number;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  amount_paid: number;
  payment_status: 'Not Paid' | 'Partial Payment' | 'Paid in Full';
  booking_status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_by: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  category_id?: number;
  category_name: string;
  description: string | null;
  icon: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Feature {
  feature_id?: number;
  feature_name: string;
  description: string | null;
  icon: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  payment_id?: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  payment_reference: string | null;
  payment_date: string;
  notes: string | null;
  created_by: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLog {
  activity_id?: number;
  user_id: number | null;
  user_name: string | null;
  user_role: string | null;
  activity: string;
  activity_type: string | null;
  entity_type: string | null;
  entity_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at?: string;
}

export interface MenuPage {
  page_id?: number;
  page_name: string;
  page_slug: string;
  page_title: string | null;
  page_content: string | null;
  is_published: boolean;
  display_order: number;
  parent_page_id: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Setting {
  setting_id?: number;
  setting_category: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  user_id?: number;
  customer_name: string;
  email: string;
  phone: string | null;
  password: string;
  role: 'Admin' | 'Manager' | 'Customer';
  is_active: boolean;
  last_login: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// CONNECTION HELPER
// ============================================================================

function ensureConnection(): boolean {
  const isConnected = checkConnection();
  if (!isConnected) {
    console.error('No internet connection. Operation aborted.');
    throw new Error('NO_CONNECTION');
  }
  return true;
}

function getClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }
  return client;
}

// ============================================================================
// PROPERTIES
// ============================================================================

export async function fetchProperties(): Promise<Property[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_properties')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchPropertyById(propertyId: number): Promise<Property | null> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_properties')
    .select('*')
    .eq('property_id', propertyId)
    .single();
  
  if (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
  
  return data;
}

export async function createProperty(property: Omit<Property, 'property_id' | 'created_at' | 'updated_at'>): Promise<Property> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_properties')
    .insert([property])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating property:', error);
    throw error;
  }
  
  return data;
}

export async function updateProperty(propertyId: number, updates: Partial<Property>): Promise<Property> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_properties')
    .update(updates)
    .eq('property_id', propertyId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating property:', error);
    throw error;
  }
  
  return data;
}

export async function deleteProperty(propertyId: number): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_properties')
    .delete()
    .eq('property_id', propertyId);
  
  if (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

export async function incrementPropertyViews(propertyId: number): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase.rpc('increment_property_views', { p_property_id: propertyId });
  
  if (error) {
    // Fallback: fetch current count and increment
    const property = await fetchPropertyById(propertyId);
    if (property) {
      await updateProperty(propertyId, { view_count: property.view_count + 1 });
    }
  }
}

// ============================================================================
// CUSTOMERS
// ============================================================================

export async function fetchCustomers(): Promise<Customer[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_customers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchCustomerById(customerId: number): Promise<Customer | null> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_customers')
    .select('*')
    .eq('customer_id', customerId)
    .single();
  
  if (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
  
  return data;
}

export async function createCustomer(customer: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_customers')
    .insert([customer])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
  
  return data;
}

export async function updateCustomer(customerId: number, updates: Partial<Customer>): Promise<Customer> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_customers')
    .update(updates)
    .eq('customer_id', customerId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
  
  return data;
}

export async function deleteCustomer(customerId: number): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_customers')
    .delete()
    .eq('customer_id', customerId);
  
  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

// ============================================================================
// BOOKINGS
// ============================================================================

export async function fetchBookings(): Promise<Booking[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_bookings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchBookingById(bookingId: number): Promise<Booking | null> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_bookings')
    .select('*')
    .eq('booking_id', bookingId)
    .single();
  
  if (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
  
  return data;
}

export async function fetchBookingsByProperty(propertyId: number): Promise<Booking[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_bookings')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching property bookings:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchBookingsByCustomer(customerId: number): Promise<Booking[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_bookings')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching customer bookings:', error);
    throw error;
  }
  
  return data || [];
}

export async function createBooking(booking: Omit<Booking, 'booking_id' | 'created_at' | 'updated_at'>): Promise<Booking> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_bookings')
    .insert([booking])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
  
  return data;
}

export async function updateBooking(bookingId: number, updates: Partial<Booking>): Promise<Booking> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_bookings')
    .update(updates)
    .eq('booking_id', bookingId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
  
  return data;
}

export async function deleteBooking(bookingId: number): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_bookings')
    .delete()
    .eq('booking_id', bookingId);
  
  if (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function fetchCategories(): Promise<Category[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_categories')
    .select('*')
    .order('category_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data || [];
}

export async function createCategory(category: Omit<Category, 'category_id' | 'created_at' | 'updated_at'>): Promise<Category> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_categories')
    .insert([category])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }
  
  return data;
}

export async function deleteCategory(categoryId: number): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_categories')
    .delete()
    .eq('category_id', categoryId);
  
  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ============================================================================
// FEATURES
// ============================================================================

export async function fetchFeatures(): Promise<Feature[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_features')
    .select('*')
    .order('feature_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
  
  return data || [];
}

export async function createFeature(feature: Omit<Feature, 'feature_id' | 'created_at' | 'updated_at'>): Promise<Feature> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_features')
    .insert([feature])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating feature:', error);
    throw error;
  }
  
  return data;
}

export async function deleteFeature(featureId: number): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_features')
    .delete()
    .eq('feature_id', featureId);
  
  if (error) {
    console.error('Error deleting feature:', error);
    throw error;
  }
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function fetchPayments(): Promise<Payment[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_payments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchPaymentsByBooking(bookingId: number): Promise<Payment[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching booking payments:', error);
    throw error;
  }
  
  return data || [];
}

export async function createPayment(payment: Omit<Payment, 'payment_id' | 'created_at' | 'updated_at'>): Promise<Payment> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_payments')
    .insert([payment])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
  
  return data;
}

export async function deletePayment(paymentId: number): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_payments')
    .delete()
    .eq('payment_id', paymentId);
  
  if (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
}

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export async function fetchActivityLogs(limit?: number): Promise<ActivityLog[]> {
  ensureConnection();
  const supabase = getClient();
  
  let query = supabase
    .from('skyway_activity_logs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
  
  return data || [];
}

export async function createActivityLog(log: Omit<ActivityLog, 'activity_id' | 'created_at'>): Promise<ActivityLog> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_activity_logs')
    .insert([log])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
  
  return data;
}

// ============================================================================
// MENU PAGES
// ============================================================================

export async function fetchMenuPages(): Promise<MenuPage[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_menu_pages')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching menu pages:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchMenuPageBySlug(slug: string): Promise<MenuPage | null> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_menu_pages')
    .select('*')
    .eq('page_slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching menu page:', error);
    throw error;
  }
  
  return data;
}

export async function createMenuPage(page: Omit<MenuPage, 'page_id' | 'created_at' | 'updated_at'>): Promise<MenuPage> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_menu_pages')
    .insert([page])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating menu page:', error);
    throw error;
  }
  
  return data;
}

export async function updateMenuPage(pageId: number, updates: Partial<MenuPage>): Promise<MenuPage> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_menu_pages')
    .update(updates)
    .eq('page_id', pageId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating menu page:', error);
    throw error;
  }
  
  return data;
}

export async function deleteMenuPage(pageId: number): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_menu_pages')
    .delete()
    .eq('page_id', pageId);
  
  if (error) {
    console.error('Error deleting menu page:', error);
    throw error;
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

export async function fetchSettings(): Promise<Setting[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_settings')
    .select('*')
    .order('setting_category', { ascending: true });
  
  if (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchSettingByKey(category: string, key: string): Promise<Setting | null> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_settings')
    .select('*')
    .eq('setting_category', category)
    .eq('setting_key', key)
    .single();
  
  if (error) {
    console.error('Error fetching setting:', error);
    throw error;
  }
  
  return data;
}

export async function updateSetting(settingId: number, value: string): Promise<Setting> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_settings')
    .update({ setting_value: value })
    .eq('setting_id', settingId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating setting:', error);
    throw error;
  }
  
  return data;
}

export async function upsertSetting(category: string, key: string, value: string, type: string = 'json'): Promise<Setting> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error} = await supabase
    .from('skyway_settings')
    .upsert(
      { 
        setting_category: category, 
        setting_key: key, 
        setting_value: value,
        setting_type: type 
      },
      { onConflict: 'setting_category,setting_key' }
    )
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting setting:', error);
    throw error;
  }
  
  return data;
}

export async function fetchSettingsByCategory(category: string): Promise<Setting[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_settings')
    .select('*')
    .eq('setting_category', category);
  
  if (error) {
    console.error('Error fetching settings by category:', error);
    throw error;
  }
  
  return data || [];
}

export async function deleteSetting(category: string, key: string): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_settings')
    .delete()
    .eq('setting_category', category)
    .eq('setting_key', key);
  
  if (error) {
    console.error('Error deleting setting:', error);
    throw error;
  }
}

export async function deleteActivityLogs(): Promise<void> {
  ensureConnection();
  const supabase = getClient();
  
  const { error } = await supabase
    .from('skyway_activity_logs')
    .delete()
    .neq('activity_id', 0); // Delete all records
  
  if (error) {
    console.error('Error deleting activity logs:', error);
    throw error;
  }
}

// ============================================================================
// AUTH USERS
// ============================================================================

export async function fetchAuthUsers(): Promise<AuthUser[]> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_auth_user')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching auth users:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchAuthUserByEmail(email: string): Promise<AuthUser | null> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_auth_user')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching auth user:', error);
    return null;
  }
  
  return data;
}

export async function createAuthUser(user: Omit<AuthUser, 'user_id' | 'created_at' | 'updated_at'>): Promise<AuthUser> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_auth_user')
    .insert([user])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating auth user:', error);
    throw error;
  }
  
  return data;
}

export async function updateAuthUser(userId: number, updates: Partial<AuthUser>): Promise<AuthUser> {
  ensureConnection();
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('skyway_auth_user')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating auth user:', error);
    throw error;
  }
  
  return data;
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export function subscribeToProperties(callback: (payload: any) => void) {
  const supabase = getClient();
  
  const subscription = supabase
    .channel('properties_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'skyway_properties' }, 
      callback
    )
    .subscribe();
  
  return subscription;
}

export function subscribeToBookings(callback: (payload: any) => void) {
  const supabase = getClient();
  
  const subscription = supabase
    .channel('bookings_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'skyway_bookings' }, 
      callback
    )
    .subscribe();
  
  return subscription;
}

export function subscribeToCustomers(callback: (payload: any) => void) {
  const supabase = getClient();
  
  const subscription = supabase
    .channel('customers_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'skyway_customers' }, 
      callback
    )
    .subscribe();
  
  return subscription;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function getDashboardStats() {
  ensureConnection();
  const supabase = getClient();
  
  // Fetch from the view created in the schema
  const { data, error } = await supabase
    .from('vw_dashboard_stats')
    .select('*')
    .single();
  
  if (error) {
    console.error('Error fetching dashboard stats:', error);
    // Fallback: calculate manually
    const properties = await fetchProperties();
    const bookings = await fetchBookings();
    const customers = await fetchCustomers();
    
    return {
      available_properties: properties.filter(p => p.is_available).length,
      total_properties: properties.length,
      active_bookings: bookings.filter(b => b.booking_status === 'Confirmed').length,
      total_bookings: bookings.length,
      active_customers: customers.filter(c => c.is_active).length,
      total_customers: customers.length,
      monthly_revenue: bookings
        .filter(b => {
          if (!b.created_at) return false;
          const bookingDate = new Date(b.created_at);
          const now = new Date();
          return bookingDate.getMonth() === now.getMonth() && 
                 bookingDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, b) => sum + b.amount_paid, 0)
    };
  }
  
  return data;
}

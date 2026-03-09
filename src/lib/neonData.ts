/**
 * Neon Database Data Access Layer
 * Replaces supabaseData.ts with Neon PostgreSQL
 */

import { query } from './neon';

// =============================================
// CATEGORIES
// =============================================

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export async function getCategories(): Promise<Category[]> {
  const result = await query<Category>('SELECT * FROM skyway_categories ORDER BY category_name');
  return result.rows;
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const result = await query<Category>('SELECT * FROM skyway_categories WHERE category_id = $1', [id]);
  return result.rows[0] || null;
}

export async function createCategory(data: Omit<Category, 'category_id' | 'created_at' | 'updated_at'>): Promise<Category> {
  const result = await query<Category>(
    'INSERT INTO skyway_categories (category_name, description, icon) VALUES ($1, $2, $3) RETURNING *',
    [data.category_name, data.description, data.icon]
  );
  return result.rows[0];
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const result = await query<Category>(
    'UPDATE skyway_categories SET category_name = COALESCE($1, category_name), description = COALESCE($2, description), icon = COALESCE($3, icon) WHERE category_id = $4 RETURNING *',
    [data.category_name, data.description, data.icon, id]
  );
  return result.rows[0];
}

export async function deleteCategory(id: number): Promise<void> {
  await query('DELETE FROM skyway_categories WHERE category_id = $1', [id]);
}

// =============================================
// PROPERTIES
// =============================================

export interface Property {
  property_id: number;
  property_name: string;
  category_id?: number;
  location: string;
  no_of_beds: number;
  bathrooms: number;
  area_sqft?: number;
  description?: string;
  price_per_month: number;
  security_deposit?: number;
  photos?: string; // JSON string
  features?: string; // JSON string
  is_available: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export async function getProperties(): Promise<Property[]> {
  const result = await query<Property>('SELECT * FROM skyway_properties ORDER BY created_at DESC');
  return result.rows;
}

export async function getFeaturedProperties(limit: number = 6): Promise<Property[]> {
  const result = await query<Property>(
    'SELECT * FROM skyway_properties WHERE is_featured = TRUE AND is_available = TRUE ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows;
}

export async function getPropertyById(id: number): Promise<Property | null> {
  const result = await query<Property>('SELECT * FROM skyway_properties WHERE property_id = $1', [id]);
  return result.rows[0] || null;
}

export async function createProperty(data: Omit<Property, 'property_id' | 'view_count' | 'created_at' | 'updated_at'>): Promise<Property> {
  const result = await query<Property>(
    `INSERT INTO skyway_properties 
    (property_name, category_id, location, no_of_beds, bathrooms, area_sqft, description, 
     price_per_month, security_deposit, photos, features, is_available, is_featured) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
    RETURNING *`,
    [
      data.property_name,
      data.category_id,
      data.location,
      data.no_of_beds,
      data.bathrooms,
      data.area_sqft,
      data.description,
      data.price_per_month,
      data.security_deposit,
      data.photos,
      data.features,
      data.is_available,
      data.is_featured,
    ]
  );
  return result.rows[0];
}

export async function updateProperty(id: number, data: Partial<Property>): Promise<Property> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && !['property_id', 'created_at', 'updated_at'].includes(key)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  values.push(id);
  const result = await query<Property>(
    `UPDATE skyway_properties SET ${fields.join(', ')} WHERE property_id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteProperty(id: number): Promise<void> {
  await query('DELETE FROM skyway_properties WHERE property_id = $1', [id]);
}

export async function incrementPropertyViews(id: number): Promise<void> {
  await query('UPDATE skyway_properties SET view_count = view_count + 1 WHERE property_id = $1', [id]);
}

// =============================================
// CUSTOMERS
// =============================================

export interface Customer {
  customer_id: number;
  customer_name: string;
  phone: string;
  email: string;
  address?: string;
  password?: string;
  id_number?: string;
  profile_photo?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCustomers(): Promise<Customer[]> {
  const result = await query<Customer>('SELECT * FROM skyway_customers ORDER BY created_at DESC');
  return result.rows;
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const result = await query<Customer>('SELECT * FROM skyway_customers WHERE customer_id = $1', [id]);
  return result.rows[0] || null;
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const result = await query<Customer>('SELECT * FROM skyway_customers WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function createCustomer(data: Omit<Customer, 'customer_id' | 'is_active' | 'created_at' | 'updated_at'>): Promise<Customer> {
  const result = await query<Customer>(
    `INSERT INTO skyway_customers 
    (customer_name, phone, email, address, password, id_number, profile_photo, notes) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *`,
    [
      data.customer_name,
      data.phone,
      data.email,
      data.address,
      data.password,
      data.id_number,
      data.profile_photo,
      data.notes,
    ]
  );
  return result.rows[0];
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && !['customer_id', 'created_at', 'updated_at'].includes(key)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  values.push(id);
  const result = await query<Customer>(
    `UPDATE skyway_customers SET ${fields.join(', ')} WHERE customer_id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteCustomer(id: number): Promise<void> {
  await query('DELETE FROM skyway_customers WHERE customer_id = $1', [id]);
}

// =============================================
// BOOKINGS
// =============================================

export interface Booking {
  booking_id: number;
  customer_id: number;
  property_id: number;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  amount_paid: number;
  payment_status: 'Not Paid' | 'Partial Payment' | 'Paid in Full';
  booking_status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export async function getBookings(): Promise<Booking[]> {
  const result = await query<Booking>('SELECT * FROM skyway_bookings ORDER BY created_at DESC');
  return result.rows;
}

export async function getBookingById(id: number): Promise<Booking | null> {
  const result = await query<Booking>('SELECT * FROM skyway_bookings WHERE booking_id = $1', [id]);
  return result.rows[0] || null;
}

export async function createBooking(data: Omit<Booking, 'booking_id' | 'created_at' | 'updated_at'>): Promise<Booking> {
  const result = await query<Booking>(
    `INSERT INTO skyway_bookings 
    (customer_id, property_id, check_in_date, check_out_date, total_amount, amount_paid, 
     payment_status, booking_status, payment_method, payment_reference, notes, created_by) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
    RETURNING *`,
    [
      data.customer_id,
      data.property_id,
      data.check_in_date,
      data.check_out_date,
      data.total_amount,
      data.amount_paid,
      data.payment_status,
      data.booking_status,
      data.payment_method,
      data.payment_reference,
      data.notes,
      data.created_by,
    ]
  );
  return result.rows[0];
}

export async function updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && !['booking_id', 'created_at', 'updated_at'].includes(key)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  values.push(id);
  const result = await query<Booking>(
    `UPDATE skyway_bookings SET ${fields.join(', ')} WHERE booking_id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteBooking(id: number): Promise<void> {
  await query('DELETE FROM skyway_bookings WHERE booking_id = $1', [id]);
}

// =============================================
// SETTINGS
// =============================================

export interface Setting {
  setting_id: number;
  setting_category: string;
  setting_key: string;
  setting_value?: string;
  setting_type: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export async function getSettings(): Promise<Setting[]> {
  const result = await query<Setting>('SELECT * FROM skyway_settings ORDER BY setting_category, setting_key');
  return result.rows;
}

export async function getSettingsByCategory(category: string): Promise<Setting[]> {
  const result = await query<Setting>(
    'SELECT * FROM skyway_settings WHERE setting_category = $1 ORDER BY setting_key',
    [category]
  );
  return result.rows;
}

export async function getSettingValue(category: string, key: string): Promise<string | null> {
  const result = await query<Setting>(
    'SELECT setting_value FROM skyway_settings WHERE setting_category = $1 AND setting_key = $2',
    [category, key]
  );
  return result.rows[0]?.setting_value || null;
}

export async function updateSetting(category: string, key: string, value: string): Promise<Setting> {
  const result = await query<Setting>(
    `INSERT INTO skyway_settings (setting_category, setting_key, setting_value) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (setting_category, setting_key) 
     DO UPDATE SET setting_value = $3 
     RETURNING *`,
    [category, key, value]
  );
  return result.rows[0];
}

// =============================================
// AUTH USERS
// =============================================

export interface AuthUser {
  user_id: number;
  customer_name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'Admin' | 'Manager' | 'Customer';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const result = await query<AuthUser>('SELECT * FROM skyway_auth_user WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function getUserById(id: number): Promise<AuthUser | null> {
  const result = await query<AuthUser>('SELECT * FROM skyway_auth_user WHERE user_id = $1', [id]);
  return result.rows[0] || null;
}

export async function createUser(data: Omit<AuthUser, 'user_id' | 'is_active' | 'last_login' | 'created_at' | 'updated_at'>): Promise<AuthUser> {
  const result = await query<AuthUser>(
    'INSERT INTO skyway_auth_user (customer_name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.customer_name, data.email, data.phone, data.password, data.role]
  );
  return result.rows[0];
}

export async function updateUserLastLogin(id: number): Promise<void> {
  await query('UPDATE skyway_auth_user SET last_login = NOW() WHERE user_id = $1', [id]);
}

export async function updateUserPassword(id: number, hashedPassword: string): Promise<void> {
  await query('UPDATE skyway_auth_user SET password = $1 WHERE user_id = $2', [hashedPassword, id]);
}

// =============================================
// ACTIVITY LOGS
// =============================================

export interface ActivityLog {
  activity_id: number;
  user_id?: number;
  user_name?: string;
  user_role?: string;
  activity: string;
  activity_type?: string;
  entity_type?: string;
  entity_id?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export async function createActivityLog(data: Omit<ActivityLog, 'activity_id' | 'created_at'>): Promise<ActivityLog> {
  const result = await query<ActivityLog>(
    `INSERT INTO skyway_activity_logs 
    (user_id, user_name, user_role, activity, activity_type, entity_type, entity_id, ip_address, user_agent) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
    [
      data.user_id,
      data.user_name,
      data.user_role,
      data.activity,
      data.activity_type,
      data.entity_type,
      data.entity_id,
      data.ip_address,
      data.user_agent,
    ]
  );
  return result.rows[0];
}

export async function getActivityLogs(limit: number = 100): Promise<ActivityLog[]> {
  const result = await query<ActivityLog>(
    'SELECT * FROM skyway_activity_logs ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows;
}

// =============================================
// FEATURES
// =============================================

export interface Feature {
  feature_id: number;
  feature_name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export async function getFeatures(): Promise<Feature[]> {
  const result = await query<Feature>('SELECT * FROM skyway_features ORDER BY feature_name');
  return result.rows;
}

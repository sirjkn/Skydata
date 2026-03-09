/**
 * Direct Neon Database Data Service
 * Uses hardcoded Neon connection for direct database access
 */

import { executeNeonQuery } from './neonConfig';
import type { Customer, ActivityLog, Setting, AuthUser, Property, Booking, Category, Feature, Payment, MenuPage } from './supabaseData';

// ============================================================================
// CUSTOMERS
// ============================================================================

export async function fetchCustomersFromNeon(): Promise<Customer[]> {
  try {
    const result = await executeNeonQuery<Customer>(
      'SELECT * FROM skyway_customers ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching customers from Neon:', error);
    throw error;
  }
}

export async function fetchCustomerByIdFromNeon(customerId: number): Promise<Customer | null> {
  try {
    const result = await executeNeonQuery<Customer>(
      'SELECT * FROM skyway_customers WHERE customer_id = $1',
      [customerId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching customer from Neon:', error);
    throw error;
  }
}

export async function createCustomerInNeon(customer: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  try {
    const result = await executeNeonQuery<Customer>(
      `INSERT INTO skyway_customers 
       (customer_name, phone, email, address, password, id_number, profile_photo, notes, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        customer.customer_name,
        customer.phone,
        customer.email,
        customer.address,
        customer.password,
        customer.id_number,
        customer.profile_photo,
        customer.notes,
        customer.is_active
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating customer in Neon:', error);
    throw error;
  }
}

export async function updateCustomerInNeon(customerId: number, updates: Partial<Customer>): Promise<Customer> {
  try {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await executeNeonQuery<Customer>(
      `UPDATE skyway_customers SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1 RETURNING *`,
      [customerId, ...values]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating customer in Neon:', error);
    throw error;
  }
}

export async function deleteCustomerFromNeon(customerId: number): Promise<void> {
  try {
    await executeNeonQuery(
      'DELETE FROM skyway_customers WHERE customer_id = $1',
      [customerId]
    );
  } catch (error) {
    console.error('Error deleting customer from Neon:', error);
    throw error;
  }
}

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export async function fetchActivityLogsFromNeon(limit?: number): Promise<ActivityLog[]> {
  try {
    const sql = limit 
      ? 'SELECT * FROM skyway_activity_logs ORDER BY created_at DESC LIMIT $1'
      : 'SELECT * FROM skyway_activity_logs ORDER BY created_at DESC';
    
    const result = await executeNeonQuery<ActivityLog>(sql, limit ? [limit] : []);
    return result.rows;
  } catch (error) {
    console.error('Error fetching activity logs from Neon:', error);
    throw error;
  }
}

export async function createActivityLogInNeon(log: Omit<ActivityLog, 'activity_id' | 'created_at'>): Promise<ActivityLog> {
  try {
    const result = await executeNeonQuery<ActivityLog>(
      `INSERT INTO skyway_activity_logs 
       (user_id, user_name, user_role, activity, activity_type, entity_type, entity_id, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        log.user_id,
        log.user_name,
        log.user_role,
        log.activity,
        log.activity_type,
        log.entity_type,
        log.entity_id,
        log.ip_address,
        log.user_agent
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating activity log in Neon:', error);
    throw error;
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

export async function fetchSettingsFromNeon(): Promise<Setting[]> {
  try {
    const result = await executeNeonQuery<Setting>(
      'SELECT * FROM skyway_settings ORDER BY setting_category, setting_key'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching settings from Neon:', error);
    throw error;
  }
}

export async function fetchSettingByKeyFromNeon(category: string, key: string): Promise<Setting | null> {
  try {
    const result = await executeNeonQuery<Setting>(
      'SELECT * FROM skyway_settings WHERE setting_category = $1 AND setting_key = $2',
      [category, key]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching setting from Neon:', error);
    throw error;
  }
}

export async function updateSettingInNeon(settingId: number, value: string): Promise<Setting> {
  try {
    const result = await executeNeonQuery<Setting>(
      'UPDATE skyway_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_id = $2 RETURNING *',
      [value, settingId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating setting in Neon:', error);
    throw error;
  }
}

export async function upsertSettingInNeon(category: string, key: string, value: string, type: string = 'json'): Promise<Setting> {
  try {
    const result = await executeNeonQuery<Setting>(
      `INSERT INTO skyway_settings (setting_category, setting_key, setting_value, setting_type) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (setting_category, setting_key) 
       DO UPDATE SET setting_value = $3, updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [category, key, value, type]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error upserting setting in Neon:', error);
    throw error;
  }
}

// ============================================================================
// AUTH USERS
// ============================================================================

export async function fetchAuthUsersFromNeon(): Promise<AuthUser[]> {
  try {
    const result = await executeNeonQuery<AuthUser>(
      'SELECT * FROM skyway_auth_user ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching auth users from Neon:', error);
    throw error;
  }
}

export async function fetchAuthUserByEmailFromNeon(email: string): Promise<AuthUser | null> {
  try {
    const result = await executeNeonQuery<AuthUser>(
      'SELECT * FROM skyway_auth_user WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching auth user from Neon:', error);
    throw error;
  }
}

export async function createAuthUserInNeon(user: Omit<AuthUser, 'user_id' | 'created_at' | 'updated_at'>): Promise<AuthUser> {
  try {
    const result = await executeNeonQuery<AuthUser>(
      `INSERT INTO skyway_auth_user 
       (customer_name, email, phone, password, role, is_active, last_login) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        user.customer_name,
        user.email,
        user.phone,
        user.password,
        user.role,
        user.is_active,
        user.last_login
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating auth user in Neon:', error);
    throw error;
  }
}

export async function updateAuthUserInNeon(userId: number, updates: Partial<AuthUser>): Promise<AuthUser> {
  try {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await executeNeonQuery<AuthUser>(
      `UPDATE skyway_auth_user SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *`,
      [userId, ...values]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating auth user in Neon:', error);
    throw error;
  }
}

// ============================================================================
// PROPERTIES
// ============================================================================

export async function fetchPropertiesFromNeon(): Promise<Property[]> {
  try {
    const result = await executeNeonQuery<Property>(
      'SELECT * FROM skyway_properties ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching properties from Neon:', error);
    throw error;
  }
}

// ============================================================================
// BOOKINGS
// ============================================================================

export async function fetchBookingsFromNeon(): Promise<Booking[]> {
  try {
    const result = await executeNeonQuery<Booking>(
      'SELECT * FROM skyway_bookings ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching bookings from Neon:', error);
    throw error;
  }
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function fetchCategoriesFromNeon(): Promise<Category[]> {
  try {
    const result = await executeNeonQuery<Category>(
      'SELECT * FROM skyway_categories ORDER BY category_name'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching categories from Neon:', error);
    throw error;
  }
}

// ============================================================================
// FEATURES
// ============================================================================

export async function fetchFeaturesFromNeon(): Promise<Feature[]> {
  try {
    const result = await executeNeonQuery<Feature>(
      'SELECT * FROM skyway_features ORDER BY feature_name'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching features from Neon:', error);
    throw error;
  }
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function fetchPaymentsFromNeon(): Promise<Payment[]> {
  try {
    const result = await executeNeonQuery<Payment>(
      'SELECT * FROM skyway_payments ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching payments from Neon:', error);
    throw error;
  }
}

// ============================================================================
// MENU PAGES
// ============================================================================

export async function fetchMenuPagesFromNeon(): Promise<MenuPage[]> {
  try {
    const result = await executeNeonQuery<MenuPage>(
      'SELECT * FROM skyway_menu_pages ORDER BY display_order'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching menu pages from Neon:', error);
    throw error;
  }
}

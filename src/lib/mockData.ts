/**
 * Mock Data Service for Offline/Development Mode
 * Provides sample data when both Neon API and legacy database are unavailable
 */

import type { Customer, ActivityLog, Setting, AuthUser, MenuPage } from './supabaseData';

// ============================================================================
// MOCK CUSTOMERS
// ============================================================================

export const mockCustomers: Customer[] = [
  {
    customer_id: 1,
    customer_name: 'John Kamau',
    phone: '+254712345678',
    email: 'john.kamau@example.com',
    address: 'Westlands, Nairobi',
    password: null,
    id_number: '12345678',
    profile_photo: null,
    notes: 'Preferred customer',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    customer_id: 2,
    customer_name: 'Mary Wanjiru',
    phone: '+254723456789',
    email: 'mary.wanjiru@example.com',
    address: 'Kilimani, Nairobi',
    password: null,
    id_number: '23456789',
    profile_photo: null,
    notes: null,
    is_active: true,
    created_at: '2024-02-20T11:30:00Z',
    updated_at: '2024-02-20T11:30:00Z',
  },
  {
    customer_id: 3,
    customer_name: 'David Ochieng',
    phone: '+254734567890',
    email: 'david.ochieng@example.com',
    address: 'Karen, Nairobi',
    password: null,
    id_number: '34567890',
    profile_photo: null,
    notes: 'Corporate client',
    is_active: true,
    created_at: '2024-03-10T09:15:00Z',
    updated_at: '2024-03-10T09:15:00Z',
  },
];

// ============================================================================
// MOCK ACTIVITY LOGS
// ============================================================================

export const mockActivityLogs: ActivityLog[] = [
  {
    activity_id: 1,
    user_id: 1,
    user_name: 'Admin User',
    user_role: 'Admin',
    activity: 'Created new property: Luxury 3BR Apartment',
    activity_type: 'create',
    entity_type: 'property',
    entity_id: 1,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    activity_id: 2,
    user_id: 1,
    user_name: 'Admin User',
    user_role: 'Admin',
    activity: 'Updated booking status to Confirmed',
    activity_type: 'update',
    entity_type: 'booking',
    entity_id: 5,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    activity_id: 3,
    user_id: 2,
    user_name: 'Manager User',
    user_role: 'Manager',
    activity: 'Added new customer: John Kamau',
    activity_type: 'create',
    entity_type: 'customer',
    entity_id: 1,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
  },
  {
    activity_id: 4,
    user_id: 1,
    user_name: 'Admin User',
    user_role: 'Admin',
    activity: 'Processed payment of KES 50,000',
    activity_type: 'create',
    entity_type: 'payment',
    entity_id: 12,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
  },
  {
    activity_id: 5,
    user_id: 1,
    user_name: 'Admin User',
    user_role: 'Admin',
    activity: 'Updated system settings',
    activity_type: 'update',
    entity_type: 'setting',
    entity_id: null,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

// ============================================================================
// MOCK SETTINGS
// ============================================================================

export const mockSettings: Setting[] = [
  {
    setting_id: 1,
    setting_category: 'business',
    setting_key: 'business_name',
    setting_value: 'Skyway Suites',
    setting_type: 'text',
    description: 'Business name displayed across the platform',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    setting_id: 2,
    setting_category: 'business',
    setting_key: 'business_email',
    setting_value: 'info@skywaysuites.co.ke',
    setting_type: 'email',
    description: 'Primary business email address',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    setting_id: 3,
    setting_category: 'business',
    setting_key: 'business_phone',
    setting_value: '+254700123456',
    setting_type: 'tel',
    description: 'Primary business phone number',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    setting_id: 4,
    setting_category: 'business',
    setting_key: 'business_address',
    setting_value: 'Westlands, Nairobi, Kenya',
    setting_type: 'textarea',
    description: 'Business physical address',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    setting_id: 5,
    setting_category: 'notifications',
    setting_key: 'email_notifications',
    setting_value: JSON.stringify({
      new_booking: true,
      payment_received: true,
      booking_cancelled: false,
    }),
    setting_type: 'json',
    description: 'Email notification preferences',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    setting_id: 6,
    setting_category: 'notifications',
    setting_key: 'sms_notifications',
    setting_value: JSON.stringify({
      new_booking: true,
      payment_received: true,
    }),
    setting_type: 'json',
    description: 'SMS notification preferences',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    setting_id: 7,
    setting_category: 'integrations',
    setting_key: 'whatsapp_enabled',
    setting_value: 'true',
    setting_type: 'boolean',
    description: 'Enable WhatsApp integration',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    setting_id: 8,
    setting_category: 'integrations',
    setting_key: 'whatsapp_number',
    setting_value: '+254700123456',
    setting_type: 'tel',
    description: 'WhatsApp business number',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================================
// MOCK AUTH USERS
// ============================================================================

export const mockAuthUsers: AuthUser[] = [
  {
    user_id: 1,
    customer_name: 'Admin User',
    email: 'admin@skywaysuites.co.ke',
    phone: '+254700000001',
    password: 'admin123', // Default password for testing
    role: 'Admin',
    is_active: true,
    last_login: new Date(Date.now() - 3600000).toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    user_id: 2,
    customer_name: 'Manager User',
    email: 'manager@skywaysuites.co.ke',
    phone: '+254700000002',
    password: 'manager123', // Default password for testing
    role: 'Manager',
    is_active: true,
    last_login: new Date(Date.now() - 7200000).toISOString(),
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  },
  {
    user_id: 3,
    customer_name: 'Test Customer',
    email: 'customer@example.com',
    phone: '+254712345678',
    password: 'customer123', // Default password for testing
    role: 'Customer',
    is_active: true,
    last_login: null,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

// ============================================================================
// MOCK MENU PAGES
// ============================================================================

export const mockMenuPages: MenuPage[] = [
  {
    page_id: 1,
    page_name: 'About Us',
    page_slug: 'about',
    page_title: 'About Skyway Suites',
    page_content: '<p>Welcome to Skyway Suites, your premier property rental platform in Kenya.</p>',
    is_published: true,
    display_order: 1,
    parent_page_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    page_id: 2,
    page_name: 'Contact',
    page_slug: 'contact',
    page_title: 'Contact Us',
    page_content: '<p>Get in touch with our team today.</p>',
    is_published: true,
    display_order: 2,
    parent_page_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    page_id: 3,
    page_name: 'Terms & Conditions',
    page_slug: 'terms',
    page_title: 'Terms and Conditions',
    page_content: '<p>Please read our terms and conditions carefully.</p>',
    is_published: true,
    display_order: 3,
    parent_page_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

let offlineModeNotified = false;

export function notifyOfflineMode() {
  if (!offlineModeNotified) {
    console.warn('🔌 OFFLINE MODE: Using mock data for development');
    console.warn('📡 Both Neon API and legacy database are unavailable');
    console.warn('💡 Connect to your database or deploy the Neon API to use real data');
    offlineModeNotified = true;
  }
}

// Check if we're in offline mode
export function isOfflineMode(): boolean {
  return !navigator.onLine;
}
/**
 * Migration Script: Supabase → Neon
 * Copies all data from Supabase to Neon PostgreSQL
 * 
 * Run this script ONCE after setting up Neon database schema
 * 
 * Usage:
 * 1. Ensure Neon database schema is created (run skyway_suites_schema.sql)
 * 2. Run: ts-node scripts/migrate-supabase-to-neon.ts
 * 3. Verify data in Neon database
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;

// =============================================
// CONFIGURATION
// =============================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_BJ6A0OlwtZbk@ep-young-fog-a41mknt8-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// =============================================
// INITIALIZE CLIENTS
// =============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const neonPool = new Pool({
  connectionString: NEON_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

// =============================================
// HELPER FUNCTIONS
// =============================================

async function neonQuery(text: string, params?: any[]) {
  try {
    return await neonPool.query(text, params);
  } catch (error) {
    console.error('Neon query error:', error);
    throw error;
  }
}

// =============================================
// MIGRATION FUNCTIONS
// =============================================

/**
 * Migrate Categories
 */
async function migrateCategories() {
  console.log('\n📦 Migrating Categories...');
  
  const { data: categories, error } = await supabase
    .from('skyway_categories')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching categories from Supabase:', error);
    return;
  }
  
  if (!categories || categories.length === 0) {
    console.log('⚠️  No categories to migrate');
    return;
  }
  
  for (const category of categories) {
    try {
      await neonQuery(
        `INSERT INTO skyway_categories (category_id, category_name, description, icon, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (category_id) DO UPDATE SET
         category_name = $2, description = $3, icon = $4, updated_at = $6`,
        [
          category.category_id,
          category.category_name,
          category.description,
          category.icon,
          category.created_at,
          category.updated_at,
        ]
      );
      console.log(`  ✅ Migrated category: ${category.category_name}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate category ${category.category_name}:`, error);
    }
  }
  
  console.log(`✅ Categories migration complete: ${categories.length} records`);
}

/**
 * Migrate Features
 */
async function migrateFeatures() {
  console.log('\n🏷️  Migrating Features...');
  
  const { data: features, error } = await supabase
    .from('skyway_features')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching features from Supabase:', error);
    return;
  }
  
  if (!features || features.length === 0) {
    console.log('⚠️  No features to migrate');
    return;
  }
  
  for (const feature of features) {
    try {
      await neonQuery(
        `INSERT INTO skyway_features (feature_id, feature_name, description, icon, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (feature_id) DO UPDATE SET
         feature_name = $2, description = $3, icon = $4, updated_at = $6`,
        [
          feature.feature_id,
          feature.feature_name,
          feature.description,
          feature.icon,
          feature.created_at,
          feature.updated_at,
        ]
      );
      console.log(`  ✅ Migrated feature: ${feature.feature_name}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate feature ${feature.feature_name}:`, error);
    }
  }
  
  console.log(`✅ Features migration complete: ${features.length} records`);
}

/**
 * Migrate Customers
 */
async function migrateCustomers() {
  console.log('\n👥 Migrating Customers...');
  
  const { data: customers, error } = await supabase
    .from('skyway_customers')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching customers from Supabase:', error);
    return;
  }
  
  if (!customers || customers.length === 0) {
    console.log('⚠️  No customers to migrate');
    return;
  }
  
  for (const customer of customers) {
    try {
      await neonQuery(
        `INSERT INTO skyway_customers 
         (customer_id, customer_name, phone, email, address, password, id_number, profile_photo, notes, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (customer_id) DO UPDATE SET
         customer_name = $2, phone = $3, email = $4, address = $5, password = $6, 
         id_number = $7, profile_photo = $8, notes = $9, is_active = $10, updated_at = $12`,
        [
          customer.customer_id,
          customer.customer_name,
          customer.phone,
          customer.email,
          customer.address,
          customer.password,
          customer.id_number,
          customer.profile_photo,
          customer.notes,
          customer.is_active,
          customer.created_at,
          customer.updated_at,
        ]
      );
      console.log(`  ✅ Migrated customer: ${customer.customer_name}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate customer ${customer.customer_name}:`, error);
    }
  }
  
  console.log(`✅ Customers migration complete: ${customers.length} records`);
}

/**
 * Migrate Auth Users
 */
async function migrateAuthUsers() {
  console.log('\n🔐 Migrating Auth Users...');
  
  const { data: users, error } = await supabase
    .from('skyway_auth_user')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching users from Supabase:', error);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('⚠️  No auth users to migrate');
    return;
  }
  
  for (const user of users) {
    try {
      await neonQuery(
        `INSERT INTO skyway_auth_user 
         (user_id, customer_name, email, phone, password, role, is_active, last_login, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (user_id) DO UPDATE SET
         customer_name = $2, email = $3, phone = $4, password = $5, role = $6, 
         is_active = $7, last_login = $8, updated_at = $10`,
        [
          user.user_id,
          user.customer_name,
          user.email,
          user.phone,
          user.password,
          user.role,
          user.is_active,
          user.last_login,
          user.created_at,
          user.updated_at,
        ]
      );
      console.log(`  ✅ Migrated user: ${user.customer_name} (${user.role})`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate user ${user.customer_name}:`, error);
    }
  }
  
  console.log(`✅ Auth users migration complete: ${users.length} records`);
}

/**
 * Migrate Properties
 */
async function migrateProperties() {
  console.log('\n🏠 Migrating Properties...');
  
  const { data: properties, error } = await supabase
    .from('skyway_properties')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching properties from Supabase:', error);
    return;
  }
  
  if (!properties || properties.length === 0) {
    console.log('⚠️  No properties to migrate');
    return;
  }
  
  for (const property of properties) {
    try {
      await neonQuery(
        `INSERT INTO skyway_properties 
         (property_id, property_name, category_id, location, no_of_beds, bathrooms, area_sqft, 
          description, price_per_month, security_deposit, photos, features, is_available, 
          is_featured, view_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (property_id) DO UPDATE SET
         property_name = $2, category_id = $3, location = $4, no_of_beds = $5, bathrooms = $6,
         area_sqft = $7, description = $8, price_per_month = $9, security_deposit = $10,
         photos = $11, features = $12, is_available = $13, is_featured = $14, view_count = $15, updated_at = $17`,
        [
          property.property_id,
          property.property_name,
          property.category_id,
          property.location,
          property.no_of_beds,
          property.bathrooms,
          property.area_sqft,
          property.description,
          property.price_per_month,
          property.security_deposit,
          property.photos,
          property.features,
          property.is_available,
          property.is_featured,
          property.view_count,
          property.created_at,
          property.updated_at,
        ]
      );
      console.log(`  ✅ Migrated property: ${property.property_name}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate property ${property.property_name}:`, error);
    }
  }
  
  console.log(`✅ Properties migration complete: ${properties.length} records`);
}

/**
 * Migrate Bookings
 */
async function migrateBookings() {
  console.log('\n📅 Migrating Bookings...');
  
  const { data: bookings, error } = await supabase
    .from('skyway_bookings')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching bookings from Supabase:', error);
    return;
  }
  
  if (!bookings || bookings.length === 0) {
    console.log('⚠️  No bookings to migrate');
    return;
  }
  
  for (const booking of bookings) {
    try {
      await neonQuery(
        `INSERT INTO skyway_bookings 
         (booking_id, customer_id, property_id, check_in_date, check_out_date, total_amount, 
          amount_paid, payment_status, booking_status, payment_method, payment_reference, notes, 
          created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (booking_id) DO UPDATE SET
         customer_id = $2, property_id = $3, check_in_date = $4, check_out_date = $5,
         total_amount = $6, amount_paid = $7, payment_status = $8, booking_status = $9,
         payment_method = $10, payment_reference = $11, notes = $12, created_by = $13, updated_at = $15`,
        [
          booking.booking_id,
          booking.customer_id,
          booking.property_id,
          booking.check_in_date,
          booking.check_out_date,
          booking.total_amount,
          booking.amount_paid,
          booking.payment_status,
          booking.booking_status,
          booking.payment_method,
          booking.payment_reference,
          booking.notes,
          booking.created_by,
          booking.created_at,
          booking.updated_at,
        ]
      );
      console.log(`  ✅ Migrated booking: ${booking.booking_id}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate booking ${booking.booking_id}:`, error);
    }
  }
  
  console.log(`✅ Bookings migration complete: ${bookings.length} records`);
}

/**
 * Migrate Settings
 */
async function migrateSettings() {
  console.log('\n⚙️  Migrating Settings...');
  
  const { data: settings, error } = await supabase
    .from('skyway_settings')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching settings from Supabase:', error);
    return;
  }
  
  if (!settings || settings.length === 0) {
    console.log('⚠️  No settings to migrate');
    return;
  }
  
  for (const setting of settings) {
    try {
      await neonQuery(
        `INSERT INTO skyway_settings 
         (setting_id, setting_category, setting_key, setting_value, setting_type, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (setting_category, setting_key) DO UPDATE SET
         setting_value = $4, setting_type = $5, description = $6, updated_at = $8`,
        [
          setting.setting_id,
          setting.setting_category,
          setting.setting_key,
          setting.setting_value,
          setting.setting_type,
          setting.description,
          setting.created_at,
          setting.updated_at,
        ]
      );
      console.log(`  ✅ Migrated setting: ${setting.setting_category}.${setting.setting_key}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate setting ${setting.setting_category}.${setting.setting_key}:`, error);
    }
  }
  
  console.log(`✅ Settings migration complete: ${settings.length} records`);
}

/**
 * Migrate Activity Logs
 */
async function migrateActivityLogs() {
  console.log('\n📊 Migrating Activity Logs...');
  
  const { data: logs, error } = await supabase
    .from('skyway_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000); // Limit to last 1000 logs
  
  if (error) {
    console.error('❌ Error fetching activity logs from Supabase:', error);
    return;
  }
  
  if (!logs || logs.length === 0) {
    console.log('⚠️  No activity logs to migrate');
    return;
  }
  
  for (const log of logs) {
    try {
      await neonQuery(
        `INSERT INTO skyway_activity_logs 
         (activity_id, user_id, user_name, user_role, activity, activity_type, entity_type, 
          entity_id, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (activity_id) DO NOTHING`,
        [
          log.activity_id,
          log.user_id,
          log.user_name,
          log.user_role,
          log.activity,
          log.activity_type,
          log.entity_type,
          log.entity_id,
          log.ip_address,
          log.user_agent,
          log.created_at,
        ]
      );
    } catch (error) {
      console.error(`  ❌ Failed to migrate activity log ${log.activity_id}:`, error);
    }
  }
  
  console.log(`✅ Activity logs migration complete: ${logs.length} records`);
}

/**
 * Migrate Menu Pages
 */
async function migrateMenuPages() {
  console.log('\n📄 Migrating Menu Pages...');
  
  const { data: pages, error } = await supabase
    .from('skyway_menu_pages')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching menu pages from Supabase:', error);
    return;
  }
  
  if (!pages || pages.length === 0) {
    console.log('⚠️  No menu pages to migrate');
    return;
  }
  
  for (const page of pages) {
    try {
      await neonQuery(
        `INSERT INTO skyway_menu_pages 
         (page_id, page_name, page_slug, page_title, page_content, is_published, display_order, parent_page_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (page_id) DO UPDATE SET
         page_name = $2, page_slug = $3, page_title = $4, page_content = $5, 
         is_published = $6, display_order = $7, parent_page_id = $8, updated_at = $10`,
        [
          page.page_id,
          page.page_name,
          page.page_slug,
          page.page_title,
          page.page_content,
          page.is_published,
          page.display_order,
          page.parent_page_id,
          page.created_at,
          page.updated_at,
        ]
      );
      console.log(`  ✅ Migrated menu page: ${page.page_name}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate menu page ${page.page_name}:`, error);
    }
  }
  
  console.log(`✅ Menu pages migration complete: ${pages.length} records`);
}

// =============================================
// MAIN MIGRATION
// =============================================

async function main() {
  console.log('🚀 Starting Supabase → Neon Migration');
  console.log('=====================================\n');
  
  try {
    // Test connections
    console.log('🔌 Testing connections...');
    const neonTest = await neonQuery('SELECT NOW()');
    console.log('✅ Neon connection successful');
    
    // Run migrations in order (respecting foreign key dependencies)
    await migrateCategories();
    await migrateFeatures();
    await migrateAuthUsers();
    await migrateCustomers();
    await migrateProperties();
    await migrateBookings();
    await migrateSettings();
    await migrateActivityLogs();
    await migrateMenuPages();
    
    console.log('\n=====================================');
    console.log('🎉 Migration Complete!');
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await neonPool.end();
  }
}

// Run migration
main();

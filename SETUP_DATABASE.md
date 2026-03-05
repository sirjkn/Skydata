# Skyway Suites - Database Setup Instructions

## Overview
This guide will help you set up all required tables in your Supabase database for Skyway Suites to function properly.

## Prerequisites
- Supabase account and project created
- Access to SQL Editor in Supabase Dashboard

## Setup Steps

### Step 1: Access SQL Editor
1. Log in to your [Supabase Dashboard](https://supabase.com)
2. Select your Skyway Suites project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Main Schema
1. Copy the entire contents of `/database/skyway_suites_schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute
4. Wait for confirmation that all tables were created

### Step 3: Add the Payments Table
The payments table was missing from the original schema. Run this separately:

1. Copy the contents of `/database/create_payments_table.sql`
2. Paste it into a new SQL Editor query
3. Click **Run** to execute

Alternatively, you can run this SQL directly:

```sql
-- =============================================
-- PAYMENTS TABLE
-- Stores payment records for bookings
-- =============================================
CREATE TABLE IF NOT EXISTS skyway_payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES skyway_bookings(booking_id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES skyway_customers(customer_id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES skyway_properties(property_id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    paid_amount DECIMAL(12,2) NOT NULL CHECK (paid_amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    mpesa_code VARCHAR(50),
    receipt_number VARCHAR(50),
    notes TEXT,
    recorded_by INTEGER REFERENCES skyway_auth_user(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking ON skyway_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON skyway_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_property ON skyway_payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON skyway_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_method ON skyway_payments(payment_method);
```

### Step 4: Set Admin Password
The default admin user (`admin@skywaysuites.com`) is created without a real password. To set a password:

**Option A: Use the App's Reset Password Page**
1. Navigate to `/reset-password` in your Skyway Suites app
2. Enter email: `admin@skywaysuites.com`
3. Enter your desired password
4. Click "Reset Password"

**Option B: Use SQL Query**
```sql
-- Change 'your_password_here' to your desired password
UPDATE auth.users 
SET encrypted_password = crypt('your_password_here', gen_salt('bf'))
WHERE email = 'admin@skywaysuites.com';
```

**Option C: Use Supabase Dashboard**
1. Go to **Authentication** > **Users**
2. Find `admin@skywaysuites.com`
3. Click the menu (⋮) next to the user
4. Select "Reset Password" or "Edit User"
5. Set your desired password

### Step 5: Verify Tables Created
Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'skyway%'
ORDER BY table_name;
```

You should see:
- ✅ skyway_activity_logs
- ✅ skyway_auth_user
- ✅ skyway_bookings
- ✅ skyway_categories
- ✅ skyway_customers
- ✅ skyway_features
- ✅ skyway_menu_pages
- ✅ skyway_payments ← **Important!**
- ✅ skyway_properties
- ✅ skyway_settings

### Step 6: Enable Row Level Security (Optional but Recommended)
For production, enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE skyway_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE skyway_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE skyway_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skyway_payments ENABLE ROW LEVEL SECURITY;
-- Add more as needed

-- Create policies (example for properties - public read)
CREATE POLICY "Allow public read access" 
ON skyway_properties FOR SELECT 
USING (true);

-- Admin full access (replace with your auth logic)
CREATE POLICY "Allow admin full access" 
ON skyway_properties FOR ALL 
USING (auth.role() = 'authenticated');
```

## Testing Your Setup

### Test 1: Login with Admin Account
1. Go to your app login page
2. Use: `admin@skywaysuites.com` with the password you set
3. You should be able to access the admin dashboard

### Test 2: Verify Data Loading
1. Open browser console (F12)
2. Navigate to Admin Dashboard
3. You should see:
   ```
   📡 Loading Admin Dashboard data from Supabase...
   ✅ Categories loaded: 5
   ✅ Features loaded: 10
   ✅ Properties loaded: X
   ✅ Bookings loaded: X
   ✅ Customers loaded: X
   ✅ Payments loaded: X
   ✅ Activity logs loaded: X
   ```

## Demo Mode (No Database Required)

If you want to test the app without setting up the database:

**Demo Admin Account:**
- Email: `admin@skyway.com`
- Password: `admin123`
- Note: This works offline and doesn't require Supabase connection

**Demo Customer Account:**
- Email: `user@skyway.com`
- Password: `user123`

## Troubleshooting

### Error: "Could not find table 'skyway_payments'"
- ✅ **Solution**: Run Step 3 above to create the payments table

### Error: "User not found" or "Invalid password"
- ✅ **Solution**: Reset admin password using Step 4

### Error: "No internet connection"
- ✅ **Solution**: Check your internet connection or use demo accounts

### Error: "PGRST..." (Supabase errors)
- ✅ **Solution**: Verify Supabase URL and keys in Settings page
- ✅ Check that all tables are created (Step 5)

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all SQL queries ran successfully
3. Ensure Supabase credentials are correct in app settings
4. Try using demo mode to verify the app works locally

## Next Steps

After successful setup:
1. ✅ Add properties through Admin Dashboard
2. ✅ Configure company settings
3. ✅ Add customer records
4. ✅ Start creating bookings
5. ✅ Record payments

Your Skyway Suites platform is now ready to use! 🚀

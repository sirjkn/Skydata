# 🗄️ Neon Database Setup Instructions

## Step 1: Access Neon Console

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Select your project: **neondb**
3. Click on **SQL Editor**

## Step 2: Run Schema Creation Script

1. Copy the **entire contents** of `/database/skyway_suites_schema.sql`
2. Paste into the Neon SQL Editor
3. Click **Run** or press `Ctrl+Enter`

This will create:
- ✅ 9 tables
- ✅ 3 views
- ✅ 10 triggers
- ✅ Default data (categories, features, settings, sample properties)

## Step 3: Verify Tables Created

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
```
skyway_activity_logs
skyway_auth_user
skyway_bookings
skyway_categories
skyway_customers
skyway_features
skyway_menu_pages
skyway_properties
skyway_settings
```

## Step 4: Create Admin Account

Create your admin account with bcrypt-hashed password:

### Option A: Generate bcrypt hash locally

```javascript
// Run this in Node.js console or browser console
const bcrypt = require('bcryptjs'); // or use online bcrypt generator
const password = 'YourSecurePassword123!';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
// Copy the hash output
```

### Option B: Use online bcrypt generator
- Go to: https://bcrypt-generator.com/
- Enter your password
- Copy the generated hash

### Then run this SQL:

```sql
INSERT INTO skyway_auth_user (customer_name, email, phone, password, role) 
VALUES (
  'Admin User',
  'admin@skywaysuites.com',
  '+254700000000',
  '$2a$10$PASTE_YOUR_BCRYPT_HASH_HERE',  -- Replace with your bcrypt hash
  'Admin'
);
```

## Step 5: Verify Admin Account

```sql
SELECT user_id, customer_name, email, role 
FROM skyway_auth_user 
WHERE role = 'Admin';
```

## Step 6: Check Default Data

### Categories
```sql
SELECT * FROM skyway_categories;
```
Should show: Apartment, Villa, Townhouse, Studio, Penthouse

### Features
```sql
SELECT * FROM skyway_features;
```
Should show: WiFi, Parking, Pool, Gym, Security, Generator, Garden, Balcony, Air Conditioning, Elevator

### Settings
```sql
SELECT * FROM skyway_settings;
```
Should show various settings organized by category (general, homepage, user_management, sms_integration)

## Step 7: Test Sample Queries

### Get all available properties
```sql
SELECT * FROM skyway_properties WHERE is_available = TRUE;
```

### Get dashboard statistics
```sql
SELECT * FROM vw_dashboard_stats;
```

### Get property listings with category info
```sql
SELECT * FROM vw_property_listings;
```

## 🔧 Optional: Insert Sample Data

If you want more test data:

### Sample Customer
```sql
INSERT INTO skyway_customers (customer_name, phone, email, address, id_number) 
VALUES (
  'Test Customer',
  '+254712345678',
  'test@example.com',
  'Nairobi, Kenya',
  '12345678'
);
```

### Sample Property
```sql
INSERT INTO skyway_properties 
  (property_name, category_id, location, no_of_beds, bathrooms, area_sqft, 
   description, price_per_month, security_deposit, photos, features, is_available, is_featured)
VALUES (
  'Test Apartment',
  1,  -- Apartment category
  'Westlands, Nairobi',
  2,
  2,
  1200,
  'Modern 2-bedroom apartment with city views',
  75000.00,
  75000.00,
  '[]',
  '[1,2,3,4,5]',  -- Feature IDs
  TRUE,
  TRUE
);
```

### Sample Booking
```sql
-- First, get a customer_id and property_id from previous inserts
INSERT INTO skyway_bookings 
  (customer_id, property_id, check_in_date, check_out_date, total_amount, 
   amount_paid, payment_status, booking_status)
VALUES (
  1,  -- Replace with actual customer_id
  1,  -- Replace with actual property_id
  '2026-04-01',
  '2026-05-01',
  75000.00,
  25000.00,
  'Partial Payment',
  'Pending'
);
```

## ✅ Setup Complete!

Your Neon database is now ready. Next steps:

1. ✅ Deploy backend to Vercel (see `/NEON_MIGRATION_GUIDE.md`)
2. ✅ Update frontend API URL
3. ✅ Test login with admin account
4. ✅ Start using the platform!

---

## 🚨 Troubleshooting

### Error: "relation already exists"
**Solution**: Tables are already created. You can skip this step or run:
```sql
DROP TABLE IF EXISTS skyway_bookings, skyway_properties, skyway_customers, 
  skyway_auth_user, skyway_features, skyway_categories, skyway_settings, 
  skyway_activity_logs, skyway_menu_pages CASCADE;
```
Then re-run the schema script.

### Error: "permission denied"
**Solution**: Ensure you're using the database owner account in Neon console.

### Error: "syntax error"
**Solution**: Make sure you copied the entire SQL file content, including all comments.

---

## 📞 Need Help?

Check Neon documentation: https://neon.tech/docs/introduction

Or contact support: support@neon.tech

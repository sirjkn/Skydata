# Skyway Suites - Migration to Cloud-Only Supabase Architecture

## 🎯 Overview

Skyway Suites has been upgraded to **Version 3.0** with a complete migration from localStorage to **strictly cloud-based Supabase infrastructure**. The application now requires an active internet connection and Supabase database connection to function.

---

## 🚀 What's New in Version 3.0

### ✅ Cloud-Only Architecture
- **No localStorage**: All data saving to localStorage has been disabled
- **Strictly Online**: Application requires internet connection to operate
- **Real-time Sync**: All data synchronized across devices in real-time
- **Supabase Integration**: Complete PostgreSQL database backend

### ✅ Connection Monitoring System
- **Live Status Tracking**: Monitors internet and database connectivity
- **Automatic Retries**: Connection checks every 30 seconds
- **Visual Indicators**: Connection status displayed throughout the app
- **Operation Blocking**: All actions disabled when offline

### ✅ User Experience Enhancements
- **No Internet Banner**: Prominent warning when connection is lost
- **Overlay Protection**: Prevents data corruption from offline operations
- **Clear Messaging**: Users informed why operations are blocked
- **Smooth Reconnection**: Automatic resume when connection restored

---

## 📋 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project details:
   - **Name**: Skyway Suites
   - **Database Password**: (secure password)
   - **Region**: Choose closest to Kenya (e.g., AWS ap-south-1 Mumbai)
4. Wait for project to be created (2-3 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `/database/skyway_suites_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the schema
6. Verify success message: "Database Schema Created Successfully"

**What This Creates:**
- ✅ 9 Tables (properties, bookings, customers, etc.)
- ✅ 3 Views (property listings, booking details, dashboard stats)
- ✅ 10 Triggers (auto-timestamps, payment status, double-booking prevention)
- ✅ Foreign key relationships and constraints
- ✅ Indexes for performance optimization
- ✅ Sample data for testing

### Step 3: Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (public - safe for frontend)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (secret - backend only)

### Step 4: Configure Skyway Suites

1. Open Skyway Suites application
2. Navigate to **Settings** → **Database Settings** tab
3. Enter your credentials:
   - **Supabase Project URL**: Paste from Step 3
   - **Supabase Anon Key**: Paste from Step 3
   - **Service Role Key**: (Optional) Paste from Step 3
4. Click **"Test Connection"**
5. Wait for success message: "Successfully connected to Supabase database!"
6. Click **"Save Settings"**

### Step 5: Verify Connection

✅ **Check Connection Status:**
- Top banner should NOT show "No Internet Connection"
- Settings page should show "Database: Connected ✓"
- Green "Connected" badge in Database Settings tab

✅ **Test Operations:**
- Create a new property
- Add a customer
- Make a booking
- Verify data appears in Supabase dashboard → Table Editor

---

## 🏗️ Database Schema Overview

### Core Tables

| Table Name | Description | Key Fields |
|------------|-------------|------------|
| `skyway_categories` | Property categories | category_id, category_name |
| `skyway_features` | Property amenities | feature_id, feature_name |
| `skyway_auth_user` | Authenticated users (RBAC) | user_id, email, role |
| `skyway_customers` | Customer information | customer_id, name, phone, email |
| `skyway_properties` | Property listings | property_id, name, location, price |
| `skyway_bookings` | Booking records | booking_id, customer_id, property_id, dates |
| `skyway_activity_logs` | Audit trail | activity_id, user_id, activity |
| `skyway_menu_pages` | Custom pages | page_id, page_name, content |
| `skyway_settings` | App settings | setting_id, category, key, value |

### Smart Features

#### 1. Auto-Payment Status Updates
```sql
-- Automatically updates payment_status based on amount_paid:
- Not Paid: amount_paid = 0
- Partial Payment: 0 < amount_paid < total_amount
- Paid in Full: amount_paid >= total_amount
```

#### 2. Auto-Confirmation on Full Payment
```sql
-- Booking status changes to 'Confirmed' when fully paid
IF payment_status = 'Paid in Full' THEN
  booking_status = 'Confirmed'
```

#### 3. Double Booking Prevention
```sql
-- Prevents overlapping bookings for same property
-- Checks date ranges and blocks if conflict exists
```

#### 4. Auto-Timestamps
```sql
-- All tables have:
- created_at (set on INSERT)
- updated_at (auto-updates on every UPDATE)
```

---

## 🔧 Technical Implementation

### New Files Created

1. **`/src/lib/connectionStatus.ts`**
   - Connection monitoring system
   - Internet connectivity checks
   - Supabase health checks
   - Event-based subscription system
   - 30-second polling interval

2. **`/src/app/components/ConnectionBanner.tsx`**
   - Visual connection status indicator
   - Full-screen overlay when offline
   - User-friendly error messages
   - Automatic retry indication

3. **`/database/skyway_suites_schema.sql`**
   - Complete PostgreSQL schema
   - 1,200+ lines of SQL
   - Production-ready with indexes
   - Comprehensive data types and constraints

### Updated Files

1. **`/src/app/App.tsx`**
   - Integrated ConnectionBanner component
   - Added connection monitoring lifecycle
   - Starts monitoring on app mount
   - Cleans up on unmount

2. **`/src/app/pages/settings.tsx`**
   - Added Database Settings tab
   - Connection status display
   - Test connection functionality
   - Supabase configuration UI
   - Updated to Version 3.0

### Connection Monitoring Flow

```
App Mounts
    ↓
startConnectionMonitoring()
    ↓
[Every 30 seconds]
    ↓
Check: navigator.onLine (Internet)
    ↓
Check: Supabase Query (Database)
    ↓
Update Global Status
    ↓
Notify All Subscribers
    ↓
Update UI (Banner, Overlays, Status Badges)
```

---

## 🎨 UI/UX Features

### Connection Status Indicators

#### 1. Top Banner (Appears When Offline)
```
┌─────────────────────────────────────────────────────┐
│ 🚫 No Internet Connection                           │
│ Please check your internet connection to continue   │
│ using Skyway Suites                    [Retrying...] │
└─────────────────────────────────────────────────────┘
```

#### 2. Full-Screen Overlay
```
┌──────────────────────────────────────────────┐
│                                              │
│            🚫 Connection Required            │
│                                              │
│  Skyway Suites requires an active internet  │
│  connection and database access to function │
│                                              │
│  ❌ No Internet Connection                   │
│                                              │
└──────────────────────────────────────────────┘
```

#### 3. Settings Page Status
```
Database Settings Tab
─────────────────────
[●] Connected        ← Green badge
[○] Disconnected     ← Gray badge
[⟳] Connecting...    ← Yellow badge with spinner
[✖] Error            ← Red badge
```

### Color-Coded Status

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| Connected | 🟢 Green | ✓ Wifi | Fully operational |
| Connecting | 🟡 Yellow | ⟳ Loader | Testing connection |
| Disconnected | ⚫ Gray | ✖ WifiOff | No connection configured |
| Error | 🔴 Red | ⚠ Alert | Connection failed |

---

## 🔐 Security Considerations

### API Key Safety

1. **Anon/Public Key** (Safe for Frontend)
   - ✅ Can be exposed in frontend code
   - ✅ Limited by Row Level Security (RLS)
   - ✅ Only allows permitted operations

2. **Service Role Key** (Backend Only)
   - ⚠️ NEVER expose in frontend
   - ⚠️ Bypasses RLS policies
   - ⚠️ Full database access
   - ✅ Store in environment variables only

### Recommended RLS Policies

```sql
-- Example: Users can only see their own bookings
CREATE POLICY "Users can view own bookings"
ON skyway_bookings FOR SELECT
USING (auth.uid() = customer_id);

-- Example: Only admins can delete properties
CREATE POLICY "Only admins can delete properties"
ON skyway_properties FOR DELETE
USING (auth.jwt() ->> 'role' = 'Admin');
```

---

## 📊 Performance Optimization

### Indexes Created

All critical queries are optimized with indexes:

```sql
-- Customer lookups
CREATE INDEX idx_customers_email ON skyway_customers(email);
CREATE INDEX idx_customers_phone ON skyway_customers(phone);

-- Property searches
CREATE INDEX idx_properties_location ON skyway_properties(location);
CREATE INDEX idx_properties_available ON skyway_properties(is_available);
CREATE INDEX idx_properties_price ON skyway_properties(price_per_month);

-- Booking queries
CREATE INDEX idx_bookings_dates ON skyway_bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON skyway_bookings(booking_status);
```

### Connection Pooling

Supabase automatically provides:
- ✅ Connection pooling (Supavisor)
- ✅ Query caching
- ✅ Load balancing
- ✅ Auto-scaling

---

## 🐛 Troubleshooting

### Issue: "No Internet Connection" Banner Won't Go Away

**Causes:**
1. Actually no internet connection
2. Firewall blocking Supabase domains
3. Corporate proxy/VPN issues

**Solutions:**
```bash
# Test internet connection
ping google.com

# Test Supabase access
curl https://your-project.supabase.co/rest/v1/

# Check browser console for errors
# Open DevTools → Console
```

---

### Issue: "Database Connection Failed"

**Causes:**
1. Wrong Supabase URL or API keys
2. Project paused (free tier inactivity)
3. Database not initialized (schema not run)

**Solutions:**
1. Verify credentials in Settings → Database Settings
2. Check Supabase dashboard - project may be paused
3. Re-run `/database/skyway_suites_schema.sql`
4. Check Supabase project health status

---

### Issue: "Operations Not Working" Despite Connected Status

**Causes:**
1. Table doesn't exist (schema not run)
2. RLS policies blocking operations
3. API key permissions insufficient

**Solutions:**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Disable RLS temporarily for testing (NOT for production)
ALTER TABLE skyway_properties DISABLE ROW LEVEL SECURITY;

-- Check API key permissions in Supabase dashboard
```

---

### Issue: Slow Performance

**Causes:**
1. No indexes on frequently queried columns
2. Large result sets without pagination
3. N+1 query problems

**Solutions:**
```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);

-- Use pagination
SELECT * FROM table LIMIT 50 OFFSET 0;

-- Use joins instead of multiple queries
SELECT p.*, c.category_name 
FROM skyway_properties p
LEFT JOIN skyway_categories c ON p.category_id = c.category_id;
```

---

## 📈 Monitoring & Analytics

### Supabase Dashboard Metrics

Access in **Settings** → **Usage**:
- 📊 Database size
- 🔢 API requests count
- ⚡ Query performance
- 💾 Storage usage
- 📡 Bandwidth consumption

### Activity Logs

Monitor user actions in `skyway_activity_logs` table:
```sql
SELECT 
  user_name,
  activity,
  activity_type,
  created_at
FROM skyway_activity_logs
ORDER BY created_at DESC
LIMIT 100;
```

---

## 🔄 Migration from localStorage (If Needed)

### Export Existing localStorage Data

```javascript
// Run in browser console on old version
const data = {
  properties: JSON.parse(localStorage.getItem('skyway_properties') || '[]'),
  bookings: JSON.parse(localStorage.getItem('skyway_bookings') || '[]'),
  customers: JSON.parse(localStorage.getItem('skyway_customers') || '[]'),
};
console.log(JSON.stringify(data, null, 2));
// Copy output
```

### Import to Supabase

```javascript
// Insert data via Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Insert customers
for (const customer of data.customers) {
  await supabase.from('skyway_customers').insert({
    customer_name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address
  });
}

// Repeat for properties, bookings, etc.
```

---

## 🎓 Best Practices

### 1. Always Check Connection Before Operations
```javascript
import { canPerformOperations } from '../lib/connectionStatus';

function handleSaveProperty() {
  if (!canPerformOperations()) {
    toast.error('No connection available');
    return;
  }
  // Proceed with save
}
```

### 2. Handle Errors Gracefully
```javascript
try {
  const { data, error } = await supabase
    .from('skyway_properties')
    .insert(propertyData);
  
  if (error) throw error;
  toast.success('Property saved!');
} catch (error) {
  console.error('Save failed:', error);
  toast.error('Failed to save property');
}
```

### 3. Use Real-Time Subscriptions
```javascript
// Listen to changes in bookings table
const subscription = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'skyway_bookings'
  }, (payload) => {
    console.log('Booking changed:', payload);
    // Update UI
  })
  .subscribe();
```

### 4. Optimize Queries with Select
```javascript
// ❌ Bad: Fetches all columns
const { data } = await supabase.from('properties').select('*');

// ✅ Good: Only fetch needed columns
const { data } = await supabase
  .from('properties')
  .select('property_id, property_name, price_per_month');
```

---

## 📞 Support Resources

### Skyway Suites Support
- 📧 Email: info@skywaysuites.co.ke
- 📱 Phone: +254 700 123 456
- 🌐 Website: https://skywaysuites.co.ke

### Supabase Resources
- 📖 Documentation: https://supabase.com/docs
- 💬 Discord Community: https://discord.supabase.com
- 🐛 GitHub Issues: https://github.com/supabase/supabase/issues

---

## ✅ Post-Setup Checklist

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] API credentials copied and saved securely
- [ ] Database settings configured in Skyway Suites
- [ ] Connection test passed (green "Connected" badge)
- [ ] Test property created and visible in Supabase
- [ ] Test customer added successfully
- [ ] Test booking created without errors
- [ ] Activity logs recording properly
- [ ] Settings saved and persisting
- [ ] No "Connection Required" overlay showing
- [ ] All team members have access to Supabase project

---

## 🎉 Conclusion

Skyway Suites Version 3.0 is now a fully cloud-based, production-ready property management platform powered by Supabase PostgreSQL. Enjoy real-time synchronization, automatic backups, and enterprise-grade reliability!

**Welcome to the cloud!** ☁️🚀

---

*Last Updated: March 5, 2026*
*Version: 3.0*

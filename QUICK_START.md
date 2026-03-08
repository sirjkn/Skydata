# Skyway Suites 3.0 - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Create Supabase Project (2 minutes)
```
1. Go to https://supabase.com → Sign In/Sign Up
2. Click "New Project"
3. Fill in:
   - Name: Skyway Suites
   - Database Password: [your-secure-password]
   - Region: Mumbai (closest to Kenya)
4. Click "Create new project"
5. Wait 2-3 minutes for deployment
```

### 2. Run Database Schema (1 minute)
```
1. In Supabase → Click "SQL Editor" (left sidebar)
2. Click "New query"
3. Open /database/skyway_suites_schema.sql
4. Copy ALL contents (Ctrl+A, Ctrl+C)
5. Paste into SQL Editor (Ctrl+V)
6. Click "Run" (or F5)
7. ✅ See success message
```

### 3. Get API Credentials (30 seconds)
```
1. In Supabase → Settings → API
2. Copy these 3 values:
   
   📋 Project URL:
   https://xxxxxxxxxxxxx.supabase.co
   
   📋 anon/public key:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   📋 service_role key: (optional for now)
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Configure Skyway Suites (1 minute)
```
1. Open Skyway Suites app
2. Go to Settings (⚙️ icon)
3. Click "Database Settings" tab
4. Paste:
   - Project URL → Supabase Project URL field
   - anon key → Supabase Anon Key field
5. Click "Test Connection"
6. Wait for ✅ "Connection Successful"
7. Click "Save Settings"
```

### 5. Verify Everything Works (30 seconds)
```
✅ Check these:
- No red "No Internet Connection" banner at top
- Settings shows "Database: Connected ✓"
- Green badge says "Connected" in Database Settings

🧪 Test:
- Add a test property
- Check Supabase → Table Editor → skyway_properties
- Should see your property there!
```

---

## 🆘 Quick Troubleshooting

### ❌ "Connection Failed" Error
**Fix:**
1. Check Project URL format: `https://xxxxx.supabase.co` (no extra paths)
2. Check API key is the **anon/public** key (not service_role)
3. Verify project isn't paused (Supabase dashboard should show "Active")

### ❌ "Table does not exist" Error
**Fix:**
1. Go back to Supabase SQL Editor
2. Re-run the schema file `/database/skyway_suites_schema.sql`
3. Check Supabase → Table Editor → Should see 9 tables

### ❌ "No Internet Connection" Won't Go Away
**Fix:**
1. Check your actual internet connection (open google.com)
2. Disable VPN if using one
3. Try different network (mobile hotspot)
4. Check browser console for errors (F12)

---

## 📊 What You Get

### 9 Database Tables Created:
1. ✅ **skyway_categories** - Property types (Apartment, Villa, etc.)
2. ✅ **skyway_features** - Amenities (WiFi, Pool, etc.)
3. ✅ **skyway_auth_user** - User accounts (Admin, Manager, Customer)
4. ✅ **skyway_customers** - Customer information
5. ✅ **skyway_properties** - Property listings
6. ✅ **skyway_bookings** - Booking records
7. ✅ **skyway_activity_logs** - Audit trail
8. ✅ **skyway_menu_pages** - Custom pages
9. ✅ **skyway_settings** - App configuration

### Smart Features:
- ⚡ Auto-payment status updates
- 🔄 Real-time synchronization
- 🚫 Double booking prevention
- ✅ Auto-confirmation on full payment
- 📝 Complete activity logging
- 🔒 Row Level Security ready

---

## 🎯 Next Steps

1. **Add Test Data**
   - Create 2-3 sample properties
   - Add a few customers
   - Make a test booking

2. **Configure Settings**
   - Update company information (General Settings tab)
   - Set up SMS provider (SMS Integration tab)
   - Customize homepage (Home Page tab)

3. **Invite Team Members**
   - Go to User Management tab
   - Add Admin/Manager accounts
   - Assign appropriate roles

4. **Go Live!**
   - Add real properties
   - Start taking bookings
   - Monitor activity logs

---

## 📞 Need Help?

📖 **Full Documentation**: See `/MIGRATION_TO_SUPABASE.md`

🌐 **Supabase Docs**: https://supabase.com/docs

💬 **Support**:
- Email: info@skywaysuites.co.ke
- Phone: +254 700 123 456

---

**That's it! You're ready to go! 🎉**

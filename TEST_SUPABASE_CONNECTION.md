# Testing Supabase Connection - Quick Guide

## ✅ Fixed Issues

1. Added `checkConnection()` export to `/src/lib/connectionStatus.ts`
   - Was: Only `canPerformOperations()` was exported
   - Now: Both functions available

## 🧪 Quick Test

Open browser console and run:

```javascript
// Test 1: Check if Supabase is loaded
import { getSupabaseClient } from '/src/lib/supabase.ts';
const client = getSupabaseClient();
console.log('Supabase client:', client ? '✅ Loaded' : '❌ Failed');

// Test 2: Check connection status
import { checkConnection, getConnectionStatus } from '/src/lib/connectionStatus.ts';
console.log('Is connected:', checkConnection());
console.log('Status:', getConnectionStatus());

// Test 3: Try fetching categories (simple query)
import { fetchCategories } from '/src/lib/supabaseData.ts';
const categories = await fetchCategories();
console.log('Categories:', categories);
```

## 🔍 Expected Results

### If Working ✅
```
Supabase client: ✅ Loaded
Is connected: true
Status: {isOnline: true, isSupabaseConnected: true, lastChecked: Date}
Categories: [{category_id: 1, category_name: 'Apartment', ...}, ...]
```

### If No Internet ❌
```
Supabase client: ✅ Loaded
Is connected: false
Status: {isOnline: false, isSupabaseConnected: false, lastChecked: Date}
Error: NO_CONNECTION
```

### If Database Empty 📦
```
Supabase client: ✅ Loaded
Is connected: true
Status: {isOnline: true, isSupabaseConnected: true, lastChecked: Date}
Categories: []
```

## 🗄️ Database Setup Required

If your categories array is empty, you need to run the schema setup:

1. **Go to Supabase Dashboard**: https://zqnvycenohyyyxnnelbc.supabase.co
2. **SQL Editor** → New Query
3. **Copy & Paste** the entire content from `/database/skyway_suites_schema.sql`
4. **Run** the query
5. **Refresh** your app

This will create:
- 9 tables (properties, customers, bookings, etc.)
- 3 views (for optimized queries)
- 10 triggers (for automation)
- Default categories, features, and settings

## 🐛 Troubleshooting

### Error: Module not found
- **Cause**: Browser cache
- **Fix**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Error: checkConnection is not a function
- **Cause**: Old version loaded
- **Fix**: Clear cache, restart dev server

### Error: Cannot read properties of null
- **Cause**: Supabase credentials incorrect
- **Fix**: Verify `/utils/supabase/info.tsx` has correct credentials

### Error: relation "skyway_categories" does not exist
- **Cause**: Database schema not set up
- **Fix**: Run the SQL schema (see Database Setup above)

### Error: No internet connection
- **Cause**: Actually offline OR Supabase server down
- **Fix**: Check internet, check https://status.supabase.com

## 📝 Next Steps After Fixing

Once connection works, you can:

1. **View Data in Supabase**
   - Table Editor → See all tables
   - Should see default categories: Apartment, Villa, Townhouse, Studio, Penthouse

2. **Test CRUD Operations**
   ```javascript
   // Create a test category
   import { createCategory } from '/src/lib/supabaseData.ts';
   const newCat = await createCategory({
     category_name: 'Test Category',
     description: 'Testing',
     icon: 'Home'
   });
   console.log('Created:', newCat);
   
   // Delete it
   import { deleteCategory } from '/src/lib/supabaseData.ts';
   await deleteCategory(newCat.category_id);
   console.log('Deleted!');
   ```

3. **Ready for Migration**
   - Once tests pass, proceed to update the pages
   - Start with simple ones (header, activity-log)
   - Then tackle complex ones (admin-dashboard)

## 🎯 Current Status

✅ Supabase client configured with hard-coded credentials  
✅ Connection monitoring system working  
✅ Data service layer complete with all CRUD operations  
✅ checkConnection() export fixed  
⏳ Pages still using localStorage (need migration)  

---

**Run the tests above and let me know the results!**

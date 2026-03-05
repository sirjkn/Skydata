# Skyway Suites V3.0 - Complete Supabase Integration Guide

## 🎯 Overview

Version 3.0 marks the complete transition from localStorage to Supabase cloud storage. All data operations now use real-time cloud database synchronization.

## 📋 What Changed

### Before (V2.x) - localStorage
```typescript
// Old way - localStorage
const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
localStorage.setItem('skyway_properties', JSON.stringify(updatedProperties));
```

### After (V3.0) - Supabase
```typescript
// New way - Supabase
import { fetchProperties, createProperty, updateProperty } from '../../lib/supabaseData';

// Fetch data
const properties = await fetchProperties();

// Create data
const newProperty = await createProperty(propertyData);

// Update data
const updated = await updateProperty(propertyId, updates);
```

## 🗂️ File Structure

```
/src/lib/supabaseData.ts          ← Main data service (NEW)
/src/lib/supabase.ts              ← Supabase client singleton
/src/lib/connectionStatus.ts      ← Connection monitoring
/src/app/lib/auth.ts              ← Updated for Supabase auth
/src/app/lib/storage.ts           ← DEPRECATED (only for temp data)
/utils/supabase/info.tsx          ← Hard-coded credentials
/database/skyway_suites_schema.sql ← Complete DB schema
```

## 🔑 Key Features

### 1. **Real-Time Data Sync**
All data automatically syncs with Supabase cloud database in real-time.

### 2. **Connection-Aware Operations**
Every operation checks internet connection before executing:
```typescript
ensureConnection(); // Throws error if offline
```

### 3. **TypeScript Type Safety**
All entities have proper TypeScript interfaces:
- `Property`
- `Customer`
- `Booking`
- `Category`
- `Feature`
- `ActivityLog`
- `MenuPage`
- `Setting`
- `AuthUser`

### 4. **Error Handling**
Comprehensive error handling with console logging for debugging.

## 📊 Available Data Operations

### Properties
```typescript
import {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  incrementPropertyViews
} from '../../lib/supabaseData';

// Fetch all properties
const properties = await fetchProperties();

// Fetch single property
const property = await fetchPropertyById(propertyId);

// Create new property
const newProperty = await createProperty({
  property_name: "Luxury Apartment",
  category_id: 1,
  location: "Nairobi",
  no_of_beds: 3,
  bathrooms: 2,
  area_sqft: 1500,
  description: "Beautiful apartment",
  price_per_month: 85000,
  security_deposit: 85000,
  photos: JSON.stringify([]),
  features: JSON.stringify([1, 2, 3]),
  is_available: true,
  is_featured: false,
  view_count: 0
});

// Update property
const updated = await updateProperty(propertyId, {
  is_available: false
});

// Delete property
await deleteProperty(propertyId);

// Increment views
await incrementPropertyViews(propertyId);
```

### Customers
```typescript
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../../lib/supabaseData';

const customers = await fetchCustomers();
const customer = await fetchCustomerById(customerId);
const newCustomer = await createCustomer(customerData);
const updated = await updateCustomer(customerId, updates);
await deleteCustomer(customerId);
```

### Bookings
```typescript
import {
  fetchBookings,
  fetchBookingById,
  fetchBookingsByProperty,
  fetchBookingsByCustomer,
  createBooking,
  updateBooking,
  deleteBooking
} from '../../lib/supabaseData';

const bookings = await fetchBookings();
const booking = await fetchBookingById(bookingId);
const propertyBookings = await fetchBookingsByProperty(propertyId);
const customerBookings = await fetchBookingsByCustomer(customerId);
const newBooking = await createBooking(bookingData);
const updated = await updateBooking(bookingId, updates);
await deleteBooking(bookingId);
```

### Categories & Features
```typescript
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchFeatures,
  createFeature,
  deleteFeature
} from '../../lib/supabaseData';

const categories = await fetchCategories();
await createCategory({ category_name: "Penthouse", description: null, icon: null });
await deleteCategory(categoryId);

const features = await fetchFeatures();
await createFeature({ feature_name: "WiFi", description: null, icon: null });
await deleteFeature(featureId);
```

### Activity Logs
```typescript
import {
  fetchActivityLogs,
  createActivityLog
} from '../../lib/supabaseData';

const logs = await fetchActivityLogs(100); // Limit to 100

await createActivityLog({
  user_id: 1,
  user_name: "Admin User",
  user_role: "Admin",
  activity: "Created new property",
  activity_type: "create",
  entity_type: "property",
  entity_id: 123,
  ip_address: null,
  user_agent: null
});
```

### Menu Pages
```typescript
import {
  fetchMenuPages,
  fetchMenuPageBySlug,
  createMenuPage,
  updateMenuPage,
  deleteMenuPage
} from '../../lib/supabaseData';

const pages = await fetchMenuPages();
const page = await fetchMenuPageBySlug('about');
const newPage = await createMenuPage(pageData);
const updated = await updateMenuPage(pageId, updates);
await deleteMenuPage(pageId);
```

### Settings
```typescript
import {
  fetchSettings,
  fetchSettingByKey,
  updateSetting
} from '../../lib/supabaseData';

const settings = await fetchSettings();
const setting = await fetchSettingByKey('general', 'company_name');
const updated = await updateSetting(settingId, 'New Value');
```

### Auth Users
```typescript
import {
  fetchAuthUsers,
  fetchAuthUserByEmail,
  createAuthUser,
  updateAuthUser
} from '../../lib/supabaseData';

const users = await fetchAuthUsers();
const user = await fetchAuthUserByEmail('admin@skyway.com');
const newUser = await createAuthUser(userData);
const updated = await updateAuthUser(userId, updates);
```

### Dashboard Stats
```typescript
import { getDashboardStats } from '../../lib/supabaseData';

const stats = await getDashboardStats();
// Returns:
// {
//   available_properties: number,
//   total_properties: number,
//   active_bookings: number,
//   total_bookings: number,
//   active_customers: number,
//   total_customers: number,
//   monthly_revenue: number
// }
```

## 🔄 Real-Time Subscriptions

Subscribe to real-time changes:

```typescript
import {
  subscribeToProperties,
  subscribeToBookings,
  subscribeToCustomers
} from '../../lib/supabaseData';

// Subscribe to property changes
const subscription = subscribeToProperties((payload) => {
  console.log('Property changed:', payload);
  // Refresh your data here
  loadProperties();
});

// Unsubscribe when component unmounts
useEffect(() => {
  const sub = subscribeToProperties(handleChange);
  return () => {
    sub.unsubscribe();
  };
}, []);
```

## 🔐 Authentication

Updated authentication flow:

```typescript
import { login, logout, getCurrentUser, isAdmin } from '../lib/auth';

// Login (async now)
const handleLogin = async () => {
  try {
    const user = await login(email, password);
    if (user) {
      navigate('/admin');
    }
  } catch (error) {
    if (error.message === 'NO_CONNECTION') {
      showError('No internet connection');
    }
  }
};

// Get current user
const user = getCurrentUser();

// Check role
if (isAdmin(user)) {
  // Show admin features
}

// Logout
logout();
```

## 🌐 Connection Status

All operations require internet connection:

```typescript
import { checkConnection, startConnectionMonitoring } from '../../lib/connectionStatus';

// Check if connected
if (!checkConnection()) {
  console.log('Offline - operations disabled');
}

// Start monitoring (already done in App.tsx)
startConnectionMonitoring();
```

## ⚠️ Important Notes

### 1. **No More localStorage**
- `localStorage` is DEPRECATED for data storage
- Only use for temporary UI state (form drafts, etc.)
- All important data MUST go to Supabase

### 2. **Always Use async/await**
```typescript
// ❌ WRONG
const properties = fetchProperties(); // Returns Promise

// ✅ CORRECT
const properties = await fetchProperties();
```

### 3. **Handle Errors**
```typescript
try {
  const properties = await fetchProperties();
  setProperties(properties);
} catch (error) {
  console.error('Error loading properties:', error);
  showErrorMessage('Failed to load properties');
}
```

### 4. **Check Connection First**
```typescript
if (!checkConnection()) {
  showError('No internet connection');
  return;
}
await saveData();
```

### 5. **JSON Fields**
Some fields store JSON as strings:
```typescript
// ✅ CORRECT
property.photos = JSON.stringify(photoArray);
property.features = JSON.stringify(featureIds);

// When reading:
const photos = JSON.parse(property.photos || '[]');
const features = JSON.parse(property.features || '[]');
```

## 🔧 Migration from V2.x

If you have code using localStorage, follow this pattern:

### Before:
```typescript
useEffect(() => {
  const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  setProperties(properties);
}, []);

const handleCreate = () => {
  const existing = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  existing.push(newProperty);
  localStorage.setItem('skyway_properties', JSON.stringify(existing));
  setProperties(existing);
};
```

### After:
```typescript
useEffect(() => {
  loadProperties();
}, []);

const loadProperties = async () => {
  try {
    const properties = await fetchProperties();
    setProperties(properties);
  } catch (error) {
    console.error('Error loading properties:', error);
  }
};

const handleCreate = async () => {
  try {
    const newProperty = await createProperty(propertyData);
    // Refresh list
    loadProperties();
  } catch (error) {
    console.error('Error creating property:', error);
  }
};
```

## 📝 Database Schema

All tables are prefixed with `skyway_`:

- `skyway_properties` - Property listings
- `skyway_customers` - Customer records
- `skyway_bookings` - Booking records
- `skyway_categories` - Property categories
- `skyway_features` - Property features/amenities
- `skyway_activity_logs` - Activity audit trail
- `skyway_menu_pages` - Custom CMS pages
- `skyway_settings` - App-wide settings
- `skyway_auth_user` - Authenticated users

See `/database/skyway_suites_schema.sql` for complete schema.

## 🎨 ID Mapping

### Old (localStorage) → New (Supabase)
- `id` → `property_id`, `customer_id`, `booking_id`, etc.
- Auto-incrementing primary keys
- All IDs are numbers (not strings)

### Converting IDs:
```typescript
// Old
const id = String(Date.now());

// New
// Don't generate IDs - let Supabase handle it
const created = await createProperty(data);
const propertyId = created.property_id; // Auto-generated
```

## 🐛 Debugging

Enable verbose logging:
```typescript
// All Supabase operations log to console
// Check browser console for:
// ✅ "Fetching properties..."
// ✅ "Created booking successfully"
// ❌ "Error fetching customers: ..."
```

## 🚀 Next Steps

1. ✅ Update remaining pages to use Supabase
2. ✅ Remove all localStorage.getItem() calls
3. ✅ Remove all localStorage.setItem() calls
4. ✅ Add loading states for async operations
5. ✅ Add error handling for all operations
6. ✅ Test offline behavior

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify internet connection
3. Check Supabase dashboard for data
4. Review this documentation

---

**Version:** 3.0  
**Last Updated:** March 5, 2026  
**Status:** ✅ Complete Integration

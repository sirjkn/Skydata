# Skyway Suites v3.0 - Quick Reference Guide

## 🚀 Quick Start

### Environment Setup
```typescript
// /src/lib/supabase.ts
export const DEFAULT_SUPABASE_URL = 'your_project_url';
export const DEFAULT_SUPABASE_ANON_KEY = 'your_anon_key';
```

### Installation
```bash
npm install
npm run dev
```

---

## 🗄️ Database Tables Reference

All tables use suffix `_6a712830`:

| Table | Primary Key | Foreign Keys |
|-------|-------------|--------------|
| `properties_6a712830` | property_id | category_id → categories |
| `customers_6a712830` | customer_id | - |
| `bookings_6a712830` | booking_id | customer_id, property_id |
| `payments_6a712830` | payment_id | booking_id |
| `categories_6a712830` | category_id | - |
| `features_6a712830` | feature_id | - |
| `activity_logs_6a712830` | activity_id | user_id |
| `settings_6a712830` | setting_id | - |
| `kv_store_6a712830` | id | - |

---

## 📚 Import Cheat Sheet

### Core Supabase Operations
```typescript
import {
  // Properties
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  
  // Customers
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Bookings
  fetchBookings,
  fetchBookingsByProperty,
  fetchBookingsByCustomer,
  createBooking,
  updateBooking,
  deleteBooking,
  
  // Payments
  fetchPaymentsByBooking,
  createPayment,
  deletePayment,
  
  // Categories & Features
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchFeatures,
  createFeature,
  deleteFeature,
  
  // Activity Logs
  fetchActivityLogs,
  createActivityLog,
  deleteActivityLogs,
  
  // Settings
  fetchSettingByKey,
  upsertSetting
} from '../../lib/supabaseData';
```

### Admin Helpers
```typescript
import {
  // Properties
  addProperty,
  modifyProperty,
  removeProperty,
  
  // Customers
  addCustomer,
  modifyCustomer,
  removeCustomer,
  
  // Bookings
  addBooking,
  modifyBooking,
  removeBooking,
  checkDoubleBooking,
  
  // Payments
  addPayment,
  removePayment,
  
  // Categories & Features
  addCategory,
  removeCategory,
  addFeature,
  removeFeature
} from '../lib/adminHelpers';
```

### Settings Helpers
```typescript
import {
  getGeneralSettings,
  saveGeneralSettings,
  getHomePageSettings,
  saveHomePageSettings,
  getSmsSettings,
  saveSmsSettings
} from '../lib/settingsHelpers';
```

### Connection Status
```typescript
import { checkConnection } from '../../lib/connectionStatus';
```

---

## 🔧 Common Patterns

### 1. Fetch Data with Connection Check
```typescript
const loadData = async () => {
  if (!checkConnection()) {
    console.warn('Cannot load data - no connection');
    return;
  }
  
  try {
    const data = await fetchProperties();
    setProperties(data);
  } catch (error) {
    console.error('Error loading properties:', error);
    showModal('error', 'Error', 'Failed to load data');
  }
};
```

### 2. Create Data with Activity Logging
```typescript
const handleCreate = async () => {
  if (!checkConnection()) {
    showModal('error', 'No Connection', 'Operation requires internet');
    return;
  }
  
  try {
    const newItem = await createProperty(propertyData);
    
    await createActivityLog({
      action: 'Property Created',
      details: `Property "${propertyData.property_name}" added`,
      entity_type: 'Property',
      entity_id: newItem.property_id.toString(),
      user_id: currentUser.id
    });
    
    showModal('success', 'Success', 'Property created successfully!');
  } catch (error) {
    console.error('Error creating property:', error);
    showModal('error', 'Error', 'Failed to create property');
  }
};
```

### 3. Update Data
```typescript
const handleUpdate = async (id: number, updates: any) => {
  if (!checkConnection()) {
    showModal('error', 'No Connection', 'Operation requires internet');
    return;
  }
  
  try {
    await updateProperty(id, updates);
    
    await createActivityLog({
      action: 'Property Updated',
      details: `Property ID ${id} updated`,
      entity_type: 'Property',
      entity_id: id.toString(),
      user_id: currentUser.id
    });
    
    showModal('success', 'Updated', 'Property updated successfully!');
  } catch (error) {
    console.error('Error updating property:', error);
    showModal('error', 'Error', 'Failed to update property');
  }
};
```

### 4. Delete Data with Confirmation
```typescript
const handleDelete = async (id: number, name: string) => {
  showModal(
    'confirm',
    'Confirm Delete',
    `Are you sure you want to delete "${name}"?`,
    async () => {
      if (!checkConnection()) {
        showModal('error', 'No Connection', 'Operation requires internet');
        return;
      }
      
      try {
        await deleteProperty(id);
        
        await createActivityLog({
          action: 'Property Deleted',
          details: `Property "${name}" removed`,
          entity_type: 'Property',
          entity_id: id.toString(),
          user_id: currentUser.id
        });
        
        showModal('success', 'Deleted', 'Property deleted successfully!');
      } catch (error) {
        console.error('Error deleting property:', error);
        showModal('error', 'Error', 'Failed to delete property');
      }
    }
  );
};
```

### 5. Load Settings
```typescript
useEffect(() => {
  const loadSettings = async () => {
    if (!checkConnection()) {
      console.warn('Cannot load settings - no connection');
      return;
    }
    
    try {
      const general = await getGeneralSettings();
      const homepage = await getHomePageSettings();
      const sms = await getSmsSettings();
      
      setGeneralSettings(general);
      setHomePageSettings(homepage);
      setSmsSettings(sms);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  loadSettings();
}, []);
```

### 6. Save Settings
```typescript
const handleSaveSettings = async () => {
  if (!checkConnection()) {
    showModal('error', 'No Connection', 'Cannot save settings offline');
    return;
  }
  
  try {
    await saveGeneralSettings(generalSettings);
    
    await createActivityLog({
      action: 'Settings Updated',
      details: 'General settings saved',
      entity_type: 'Settings',
      entity_id: 'general',
      user_id: currentUser.id
    });
    
    showModal('success', 'Saved', 'Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    showModal('error', 'Error', 'Failed to save settings');
  }
};
```

---

## 🎨 Modal System

### Modal Types
```typescript
showModal('success', 'Title', 'Message');
showModal('error', 'Title', 'Message');
showModal('info', 'Title', 'Message');
showModal('confirm', 'Title', 'Message', onConfirm, confirmText, cancelText);
```

### Examples
```typescript
// Success
showModal('success', 'Saved', 'Property saved successfully!');

// Error
showModal('error', 'Error', 'Failed to load data. Please try again.');

// Info
showModal('info', 'Note', 'This is an informational message.');

// Confirmation
showModal(
  'confirm',
  'Delete Property',
  'Are you sure you want to delete this property?',
  () => {
    // Confirmed action
    handleDelete();
  },
  'Delete',
  'Cancel'
);
```

---

## 📊 Status Values Reference

### Payment Status
- `'Not Paid'` - No payment received
- `'Partial Payment'` - Some payment received
- `'Paid in Full'` - Fully paid

### Booking Status
- `'Pending'` - Awaiting approval
- `'Confirmed'` - Approved and confirmed
- `'Cancelled'` - Booking cancelled
- `'Completed'` - Booking completed

### Payment Methods
- `'mpesa'` - M-Pesa
- `'cash'` - Cash
- `'bank'` - Bank Transfer
- `'card'` - Card Payment

---

## 🎯 Common Tasks

### Add a New Property
```typescript
import { addProperty } from '../lib/adminHelpers';

const propertyForm = {
  name: 'Luxury Apartment',
  category: 'Apartment',
  location: 'Nairobi',
  beds: 3,
  baths: 2,
  area: 1200,
  description: 'Modern apartment...',
  price: 50000,
  selectedFeatures: ['WiFi', 'Parking']
};

const photos = ['base64image1', 'base64image2'];

try {
  const newProperty = await addProperty(propertyForm, photos);
  console.log('Property created:', newProperty);
} catch (error) {
  console.error('Error:', error);
}
```

### Create a Booking
```typescript
import { addBooking } from '../lib/adminHelpers';

const bookingData = {
  customerId: 5,
  propertyId: 10,
  checkIn: '2026-03-10',
  checkOut: '2026-03-15',
  totalAmount: 250000,
  amountPaid: 100000,
  paymentMethod: 'mpesa',
  paymentReference: 'ABC123XYZ',
  notes: 'Early check-in requested'
};

try {
  const newBooking = await addBooking(bookingData, currentUser);
  console.log('Booking created:', newBooking);
} catch (error) {
  console.error('Error:', error);
}
```

### Add a Payment
```typescript
import { addPayment } from '../lib/adminHelpers';

try {
  const result = await addPayment(
    bookingId,      // 123
    50000,          // amount
    'mpesa',        // method
    'REF456',       // reference
    currentUser     // user object
  );
  
  console.log('Payment added:', result.payment);
  console.log('Updated booking:', result.booking);
} catch (error) {
  console.error('Error:', error);
}
```

### Check for Double Booking
```typescript
import { checkDoubleBooking } from '../lib/adminHelpers';

try {
  const hasConflict = await checkDoubleBooking(
    propertyId,
    checkInDate,
    checkOutDate,
    excludeBookingId  // optional, for updates
  );
  
  if (hasConflict) {
    showModal('error', 'Conflict', 'Property already booked for these dates');
    return;
  }
  
  // Proceed with booking
} catch (error) {
  console.error('Error checking availability:', error);
}
```

---

## 🔍 Debugging Tips

### Check Connection Status
```typescript
console.log('Connected:', checkConnection());
```

### View Database Data
```typescript
// In browser console
const { fetchProperties } = await import('./lib/supabaseData');
const properties = await fetchProperties();
console.table(properties);
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "supabase"
4. Watch for failed requests (red)

### Check Activity Logs
```typescript
const { fetchActivityLogs } = await import('./lib/supabaseData');
const logs = await fetchActivityLogs();
console.table(logs);
```

---

## ⚡ Performance Tips

### Use Promise.all() for Parallel Operations
```typescript
// ❌ Slow - Sequential
const properties = await fetchProperties();
const customers = await fetchCustomers();
const bookings = await fetchBookings();

// ✅ Fast - Parallel
const [properties, customers, bookings] = await Promise.all([
  fetchProperties(),
  fetchCustomers(),
  fetchBookings()
]);
```

### Cache Static Data
```typescript
let categoriesCache: Category[] | null = null;

const getCategories = async () => {
  if (categoriesCache) {
    return categoriesCache;
  }
  
  categoriesCache = await fetchCategories();
  return categoriesCache;
};
```

---

## 🚨 Error Codes

### Common Supabase Errors
- `PGRST116` - No rows returned
- `23505` - Unique constraint violation
- `23503` - Foreign key constraint violation
- `42P01` - Table doesn't exist
- `401` - Authentication error

### Connection Errors
- `Failed to fetch` - No internet connection
- `NetworkError` - Network issue
- `CORS error` - CORS configuration issue

---

## 📱 Color Codes

### Status Colors
```typescript
// Payment Status
'Not Paid' → 'bg-red-100 text-red-800'
'Partial Payment' → 'bg-purple-100 text-purple-800'
'Paid in Full' → 'bg-green-100 text-green-800'

// Booking Status
'Pending' → 'bg-yellow-100 text-yellow-800'
'Confirmed' → 'bg-green-100 text-green-800'
'Cancelled' → 'bg-red-100 text-red-800'
'Completed' → 'bg-blue-100 text-blue-800'

// Availability
Available → 'bg-green-100 text-green-800'
Booked → 'bg-red-100 text-red-800'
```

### Theme Colors
```css
--charcoal-grey: #36454F
--olive-green: #6B7F39
--warm-beige: #FAF4EC
```

---

## 🔗 Useful Links

- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com
- **Shadcn/ui**: https://ui.shadcn.com

---

## 📞 Support

For issues or questions:
- Check CHANGELOG.md for recent changes
- Review MIGRATION_SUMMARY.md for architecture
- Check browser console for errors
- Review Network tab for failed requests

---

**Version**: 3.0.0
**Last Updated**: March 5, 2026

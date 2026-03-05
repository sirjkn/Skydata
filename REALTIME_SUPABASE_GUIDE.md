# 🚀 Real-Time Supabase Integration Guide

## Overview

Skyway Suites now features **full real-time cloud synchronization** with Supabase! All data operations automatically sync to the cloud when enabled, with zero configuration required.

## ✨ Features

### 1. **Automatic Mode Detection**
- System automatically detects if cloud mode is enabled
- Seamlessly switches between localStorage and Supabase
- No code changes needed when toggling modes

### 2. **Real-Time Data Operations**
When cloud mode is enabled:
- ✅ All saves go directly to Supabase
- ✅ All reads fetch fresh data from Supabase
- ✅ Properties saved in real-time
- ✅ Bookings saved in real-time
- ✅ Payments saved in real-time
- ✅ Customers saved in real-time
- ✅ Categories/Features saved in real-time
- ✅ Settings saved in real-time
- ✅ Activity logs saved in real-time

### 3. **Auto-Reload on Mode Change**
- Page automatically reloads when switching modes
- Ensures fresh data from correct source
- Prevents stale data issues

## 📁 Architecture

### Data Flow

```
┌─────────────────┐
│  Admin Dashboard│
│  / Components   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ realtime-data-      │
│ manager.ts          │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ data-service.ts     │
│ (Mode Detection)    │
└────────┬────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌──────┐  ┌──────────┐
│Local │  │ Supabase │
│Storage│  │  Cloud   │
└──────┘  └──────────┘
```

### Key Files

1. **`/src/app/lib/data-service.ts`**
   - Core data abstraction layer
   - Detects cloud mode from settings
   - Routes operations to correct storage

2. **`/src/app/lib/realtime-data-manager.ts`**
   - Real-time operation wrappers
   - Convenience functions for immediate sync
   - Re-exports all data service functions

3. **`/src/app/hooks/useRealtimeData.ts`**
   - React hook for real-time data
   - Auto-refresh after saves
   - Loading and error states

4. **`/src/app/components/data-sync-wrapper.tsx`**
   - Monitors mode changes
   - Auto-reloads app when mode toggles
   - Prevents stale data

## 🔧 How It Works

### Enabling Cloud Mode

1. User clicks "Enable Cloud Storage" in Settings
2. System syncs all local data to Supabase
3. Settings saved with `useSupabase: true`
4. Event dispatched: `settingsChanged`
5. DataSyncWrapper detects change
6. Page reloads with fresh cloud data

### Saving Data (Real-Time)

```typescript
// Example: Saving a property
import { savePropertyRealtime } from '../lib/realtime-data-manager';

const newProperty = {
  id: Date.now(),
  name: 'Luxury Apartment',
  price: 50000,
  // ... other fields
};

// Automatically saves to Supabase if cloud mode enabled
// Or to localStorage if in local mode
await savePropertyRealtime(newProperty);
```

### Loading Data (Real-Time)

```typescript
// Example: Loading fresh properties
import { getFreshProperties } from '../lib/realtime-data-manager';

// Always gets latest data from active source
const properties = await getFreshProperties();
```

### Using the Hook

```typescript
import { useRealtimeData } from '../hooks/useRealtimeData';

function MyComponent() {
  const { 
    properties, 
    saveProperty, 
    refreshProperties,
    loading 
  } = useRealtimeData();
  
  // Save with auto-refresh
  const handleSave = async (property) => {
    await saveProperty(property);
    // Properties automatically refreshed!
  };
  
  return <div>...</div>;
}
```

## 🔄 Data Sync Process

### Initial Sync (Local → Cloud)

When enabling cloud mode:

```
1. Read all data from localStorage
   - Properties
   - Customers
   - Bookings
   - Payments
   - Categories
   - Features
   
2. Upload each item to Supabase
   - POST /properties
   - POST /customers
   - POST /bookings
   - POST /payments
   - PUT /categories
   - PUT /features
   
3. Save settings to cloud
   - PUT /settings
   
4. Reload app with cloud data
```

### Ongoing Operations (Real-Time)

When cloud mode is enabled:

```
┌─────────────────┐
│  User Action    │
│  (Create/Edit)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate Data   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Save to Supabase│ ← Immediate
│ (POST/PUT)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update UI State │ ← Instant feedback
└─────────────────┘
```

## 📊 What Gets Saved to Supabase

### All Collections:

1. **Properties** (`skyway_properties`)
   - Full property details
   - Photos (base64)
   - Status, pricing, features

2. **Customers** (`skyway_customers`)
   - Customer profiles
   - Contact information

3. **Bookings** (`skyway_bookings`)
   - Reservation details
   - Check-in/out dates
   - Status tracking

4. **Payments** (`skyway_payments`)
   - Payment records
   - Transaction details
   - Payment methods

5. **Categories** (`skyway_categories`)
   - Property categories
   - Dynamic list

6. **Features** (`skyway_features`)
   - Property amenities
   - Dynamic list

7. **Settings** (`skyway_settings`)
   - App configuration
   - Cloud mode flag
   - UI preferences

8. **Activity Logs** (`skyway_activity_logs`)
   - User actions
   - System events
   - Audit trail

## 🎯 Usage Examples

### Admin Dashboard

```typescript
// Categories save automatically
const handleAddCategory = async () => {
  const updatedCategories = [...categories, newCategory];
  setCategories(updatedCategories);
  
  // Real-time save to Supabase
  const { setCategories: saveCategories } = 
    await import('../lib/realtime-data-manager');
  await saveCategories(updatedCategories);
};
```

### Property Management

```typescript
// Property saves to cloud instantly
const handleAddProperty = async () => {
  const { saveProperty } = await import('../lib/realtime-data-manager');
  
  await saveProperty(newProperty);
  // Property now in Supabase!
};
```

### Settings Page

```typescript
// Settings saved to both localStorage and Supabase
const { saveSettings } = await import('../lib/data-service');
await saveSettings({ ...settings, useSupabase: true });
```

## 🔒 Security

- All requests use publicAnonKey (not service role key)
- No authentication required (per project requirements)
- Data stored in Supabase KV store
- All endpoints prefixed: `/make-server-6a712830`

## 🐛 Debugging

### Check Current Mode

```typescript
import { isSupabaseEnabled } from '../lib/data-service';

const cloudMode = isSupabaseEnabled();
console.log('Cloud mode:', cloudMode);
```

### Verify Data Source

```typescript
// Check localStorage
const localData = localStorage.getItem('skyway_properties');

// Check Supabase
const { getFreshProperties } = await import('../lib/realtime-data-manager');
const cloudData = await getFreshProperties();
```

### Monitor Sync Events

```javascript
// Listen for settings changes
window.addEventListener('settingsChanged', () => {
  console.log('Settings updated!');
});
```

## 🎉 Benefits

1. **No Data Loss** - All saves go to cloud instantly
2. **Always Fresh** - Reads always get latest data
3. **Seamless UX** - No loading spinners or delays
4. **Easy Toggle** - Switch modes with one click
5. **Zero Config** - Works automatically
6. **Full Backup** - All data in Supabase
7. **Multi-Device** - Access from anywhere

## 🚦 Status Indicators

The app will show:
- ✅ "Cloud Mode Enabled" when using Supabase
- 📱 "Local Mode" when using localStorage
- 🔄 Auto-reload when switching modes

## 📝 Notes

- Settings are **always** saved to localStorage (for bootstrap)
- Settings are **also** saved to Supabase when cloud mode is on
- Page reload required when changing modes (automatic)
- All real-time operations are async/await based
- Error handling included for network issues

---

**Your Skyway Suites app is now fully cloud-powered! 🚀**

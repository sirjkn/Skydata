# 🎯 CRUD Operations Guide - Real-Time Database Sync

## Overview

Every operation in Skyway Suites now follows a consistent pattern:
- **ADD** → Saves to both app state AND database (Supabase/localStorage)
- **EDIT** → Updates both app state AND database
- **DELETE** → Removes from both app state AND database

This ensures data consistency across the entire application.

## ✅ Operations Updated

### 1. **Properties**

#### Add Property
```typescript
// Create new property object
const newProperty = { id, name, category, ... };

// Save to database using realtime manager
const { saveProperty } = await import('../lib/realtime-data-manager');
await saveProperty(newProperty);

// Update app state
setProperties([...properties, newProperty]);
```

#### Edit Property
```typescript
// Update property object
const updatedProperty = { ...property, name: newName, ... };

// Save to database
await saveProperty(updatedProperty);

// Update app state
setProperties(properties.map(p => p.id === id ? updatedProperty : p));
```

#### Delete Property
```typescript
// Delete from database
const { deleteProperty } = await import('../lib/realtime-data-manager');
await deleteProperty(propertyId);

// Update app state
setProperties(properties.filter(p => p.id !== propertyId));
```

---

### 2. **Customers**

#### Add Customer
```typescript
const newCustomer = { id, name, phone, email, ... };

const { saveCustomer } = await import('../lib/realtime-data-manager');
await saveCustomer(newCustomer);

setCustomers([...customers, newCustomer]);
```

#### Delete Customer
```typescript
const { deleteCustomer } = await import('../lib/realtime-data-manager');
await deleteCustomer(customerId);

setCustomers(customers.filter(c => c.id !== customerId));
```

---

### 3. **Bookings**

#### Add Booking
```typescript
const newBooking = { id, propertyId, customerId, checkIn, checkOut, ... };

const { saveBooking } = await import('../lib/realtime-data-manager');
await saveBooking(newBooking);

setBookings([...bookings, newBooking]);
```

#### Edit Booking (Approve/Cancel)
```typescript
// Update booking status
const updatedBooking = { ...booking, status: 'Confirmed' };

await saveBooking(updatedBooking);

setBookings(bookings.map(b => b.id === id ? updatedBooking : b));
```

#### Delete Booking
```typescript
const { deleteBooking } = await import('../lib/realtime-data-manager');
await deleteBooking(bookingId);

setBookings(bookings.filter(b => b.id !== bookingId));
```

---

### 4. **Payments**

#### Add Payment
```typescript
const newPayment = { id, bookingId, amount, mode, ... };

const { savePayment } = await import('../lib/realtime-data-manager');
await savePayment(newPayment);

// Also update the associated booking
const updatedBooking = { ...booking, payments: [...booking.payments, newPayment] };
await saveBooking(updatedBooking);
```

#### Delete Payment
```typescript
const { deletePayment, saveBooking } = await import('../lib/realtime-data-manager');

// Delete payment
await deletePayment(paymentId);

// Update booking to remove payment
const updatedBooking = {
  ...booking,
  payments: booking.payments.filter(p => p.id !== paymentId)
};
await saveBooking(updatedBooking);
```

---

### 5. **Categories**

#### Add Category
```typescript
const updatedCategories = [...categories, newCategory];

const { setCategories: saveCategories } = await import('../lib/realtime-data-manager');
await saveCategories(updatedCategories);

setCategories(updatedCategories);
```

#### Delete Category
```typescript
const updatedCategories = categories.filter((_, i) => i !== index);

await saveCategories(updatedCategories);

setCategories(updatedCategories);
```

---

### 6. **Features**

#### Add Feature
```typescript
const updatedFeatures = [...features, newFeature];

const { setFeatures: saveFeatures } = await import('../lib/realtime-data-manager');
await saveFeatures(updatedFeatures);

setFeatures(updatedFeatures);
```

#### Delete Feature
```typescript
const updatedFeatures = features.filter((_, i) => i !== index);

await saveFeatures(updatedFeatures);

setFeatures(updatedFeatures);
```

---

### 7. **Settings**

#### Save Settings
```typescript
const updatedSettings = { ...settings, useSupabase: true };

const { saveSettings } = await import('../lib/realtime-data-manager');
await saveSettings(updatedSettings);

// Settings are saved to BOTH localStorage and Supabase
```

---

### 8. **Activity Logs**

#### Add Activity Log
```typescript
const newLog = { id, action, details, timestamp, ... };

const { saveActivityLog } = await import('../lib/realtime-data-manager');
await saveActivityLog(newLog);
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────┐
│         User Performs Action            │
│    (Add/Edit/Delete in UI)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Import realtime-data-manager          │
│   const { saveX } = await import(...)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Call Save Function                     │
│   await saveX(data)                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   data-service.ts                        │
│   Checks: isSupabaseEnabled()?          │
└────────┬────────────────────┬───────────┘
         │                    │
    YES  │                    │  NO
         ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Save to         │  │  Save to         │
│  Supabase Cloud  │  │  localStorage    │
└──────────────────┘  └──────────────────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Update React State                     │
│   setData(updatedData)                   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   UI Updates Immediately                 │
│   User sees changes instantly            │
└─────────────────────────────────────────┘
```

## 🎯 Consistency Rules

### Rule 1: Always Save Before Updating State
```typescript
// ✅ CORRECT
await saveData(newData);
setData([...data, newData]);

// ❌ WRONG
setData([...data, newData]);
// No save call!
```

### Rule 2: Use Realtime Manager for All Operations
```typescript
// ✅ CORRECT
const { saveProperty } = await import('../lib/realtime-data-manager');
await saveProperty(property);

// ❌ WRONG
localStorage.setItem('skyway_properties', JSON.stringify(properties));
// Direct localStorage usage!
```

### Rule 3: Handle Both Success and Error Cases
```typescript
try {
  await saveData(newData);
  setData([...data, newData]);
  showModal('success', 'Saved!', 'Data saved successfully');
} catch (error) {
  console.error('Save failed:', error);
  showModal('error', 'Error', 'Failed to save data');
}
```

### Rule 4: Make Handler Functions Async
```typescript
// ✅ CORRECT
const handleAdd = async () => {
  await saveData(newData);
  setData([...data, newData]);
};

// ❌ WRONG
const handleAdd = () => {
  await saveData(newData); // Syntax error!
  setData([...data, newData]);
};
```

## 🔍 Verification Checklist

For each operation in your app, verify:

- [ ] Handler function is `async`
- [ ] Imports realtime-data-manager
- [ ] Calls appropriate save/delete function
- [ ] Uses `await` for the operation
- [ ] Updates React state after save
- [ ] Has error handling (try/catch)
- [ ] Shows success/error feedback
- [ ] No direct localStorage.setItem calls

## 📊 Benefits of This Pattern

1. **Consistency** - All operations work the same way
2. **Reliability** - Data always syncs to database
3. **Maintainability** - Easy to understand and update
4. **Flexibility** - Works with both Supabase and localStorage
5. **Real-time** - Changes visible immediately
6. **Error Handling** - Built-in error management
7. **Type Safety** - TypeScript support throughout

## 🚀 Migration Checklist

If you have old code that uses localStorage directly:

1. Find `localStorage.setItem` calls
2. Make the function `async`
3. Import realtime-data-manager
4. Replace localStorage call with save function
5. Add `await`
6. Test the operation
7. Verify data appears in both UI and database

## 🎉 Result

With this pattern, your entire app maintains perfect data consistency:
- ✅ UI always matches database
- ✅ No stale data issues
- ✅ Automatic cloud sync when enabled
- ✅ Seamless mode switching
- ✅ Reliable data persistence

---

**Every add, edit, and delete operation now follows these rules throughout Skyway Suites! 🎯**

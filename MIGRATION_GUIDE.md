# Skyway Suites - localStorage to Supabase Migration Guide

## Overview
This document tracks the migration of all localStorage operations to Supabase in the Admin Dashboard.

**Status:** In Progress (Helper functions created ✅, Implementation in progress ⏳)

---

## ✅ Completed Migrations

### Data Loading (Lines 478-600)
- ✅ `fetchProperties()` - Loads properties from Supabase
- ✅ `fetchBookings()` - Loads bookings from Supabase
- ✅ `fetchCustomers()` - Loads customers from Supabase
- ✅ `fetchPayments()` - Loads payments from Supabase
- ✅ `fetchCategories()` - Loads categories from Supabase
- ✅ `fetchFeatures()` - Loads features from Supabase
- ✅ `fetchActivityLogs()` - Loads activity logs from Supabase

### Helper Functions Created (`/src/app/lib/adminHelpers.ts`) ✅
All wrapper functions for Supabase operations have been created.

---

## ⏳ Pending Migrations

### 1. Property Management (7 operations)

#### ❌ Create Property (Line 1231-1302)
**Function:** `handleAddPropertySubmit()`
**Current:** Uses `localStorage.setItem('skyway_properties', ...)`
**Migration:** Replace with `adminHelpers.addProperty(propertyForm, photos)`

```typescript
// BEFORE:
const handleAddPropertySubmit = () => {
  const existingProperties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  const newProperty = { id: Date.now(), ... };
  localStorage.setItem('skyway_properties', JSON.stringify([...existingProperties, newProperty]));
}

// AFTER:
const handleAddPropertySubmit = async () => {
  const newProperty = await adminHelpers.addProperty(propertyForm, photos);
  setProperties([...properties, newProperty]);
}
```

#### ❌ Update Property (Line 1305-1360)
**Function:** `handleEditPropertySubmit()`
**Current:** Uses `localStorage.setItem('skyway_properties', ...)`
**Migration:** Replace with `adminHelpers.modifyProperty(property.id, propertyForm, photos)`

#### ❌ Delete Property (Implicit in delete confirm modal)
**Location:** Property delete confirmation modal
**Migration:** Replace with `adminHelpers.removeProperty(propertyId)`

---

### 2. Customer Management (2 operations)

#### ❌ Create Customer (Line 1396)
**Current:** `localStorage.setItem('skyway_customers', ...)`
**Migration:** Replace with `adminHelpers.addCustomer(customerForm)`

```typescript
// BEFORE:
const updatedCustomers = [...customers, newCustomer];
localStorage.setItem('skyway_customers', JSON.stringify(updatedCustomers));

// AFTER:
const newCustomer = await adminHelpers.addCustomer(customerForm);
setCustomers([...customers, newCustomer]);
```

#### ❌ Delete Customer (Line 1417)
**Current:** `localStorage.setItem('skyway_customers', ...)`
**Migration:** Replace with `adminHelpers.removeCustomer(customerId)`

---

### 3. Booking Management (7 operations)

#### ❌ Create Booking (Line 1526)
**Current:** `localStorage.setItem('skyway_bookings', ...)`
**Migration:** Replace with `adminHelpers.addBooking(bookingData)`

#### ❌ Approve Booking (Line 2259)
**Current:** `localStorage.setItem('skyway_bookings', ...)`
**Migration:** Replace with `adminHelpers.modifyBooking(bookingId, { booking_status: 'Confirmed' })`

#### ❌ Disapprove Booking (Line 2294)
**Current:** `localStorage.setItem('skyway_bookings', ...)`
**Migration:** Replace with `adminHelpers.modifyBooking(bookingId, { booking_status: 'Cancelled' })`

#### ❌ Update Booking with Payment (Line 3754)
**Current:** `localStorage.setItem('skyway_bookings', ...)`
**Migration:** Replace with `adminHelpers.modifyBooking(bookingId, updates)`

#### ❌ Cancel Booking (Line 3872)
**Current:** `localStorage.setItem('skyway_bookings', ...)`
**Migration:** Replace with `adminHelpers.modifyBooking(bookingId, { booking_status: 'Cancelled' })`

#### ❌ Delete Booking (Line 4049)
**Current:** `localStorage.setItem('skyway_bookings', ...)`
**Migration:** Replace with `adminHelpers.removeBooking(bookingId)`

#### ❌ Update Booking After Payment Delete (Line 5312)
**Current:** `localStorage.setItem('skyway_bookings', ...)`
**Migration:** Replace with `adminHelpers.modifyBooking(bookingId, updates)`

---

### 4. Payment Management (8 operations)

#### ❌ Create Payment (Line 3773-3774)
**Current:** `localStorage.setItem('skyway_payments', ...)`
**Migration:** Replace with `adminHelpers.addPayment(paymentData)`

```typescript
// BEFORE:
const existingPayments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
localStorage.setItem('skyway_payments', JSON.stringify([...existingPayments, legacyPayment]));

// AFTER:
const newPayment = await adminHelpers.addPayment(paymentData);
setPayments([...payments, newPayment]);
```

#### ❌ View Payments (Lines 2436, 2537, 3537, 3570, 3903)
**Current:** `JSON.parse(localStorage.getItem('skyway_payments') || '[]')`
**Migration:** Replace with `adminHelpers.getBookingPayments(bookingId)` or use existing `payments` state

#### ❌ Delete Payment (Line 5294-5296)
**Current:** `localStorage.setItem('skyway_payments', ...)`
**Migration:** Replace with `adminHelpers.removePayment(paymentId)`

---

### 5. Category & Feature Management (2 operations)

#### ❌ Delete Category (Line 2851)
**Current:** `localStorage.setItem('skyway_categories', ...)`
**Migration:** Replace with `adminHelpers.removeCategory(categoryName)`

```typescript
// BEFORE:
const updatedCategories = categories.filter((_, i) => i !== index);
localStorage.setItem('skyway_categories', JSON.stringify(updatedCategories));

// AFTER:
await adminHelpers.removeCategory(categories[index]);
const updatedCategories = categories.filter((_, i) => i !== index);
setCategories(updatedCategories);
```

#### ❌ Delete Feature (Line 2925)
**Current:** `localStorage.setItem('skyway_features', ...)`
**Migration:** Replace with `adminHelpers.removeFeature(featureName)`

---

### 6. Settings Management (2 operations)

#### ⚠️ SMS Settings (Line 2262)
**Current:** `localStorage.getItem('skyway_sms_settings')`
**Migration:** Needs Settings CRUD functions in supabaseData.ts first
**Status:** Pending - Settings table exists but CRUD functions not yet created

#### ⚠️ General Settings (Line 2263)
**Current:** `localStorage.getItem('skyway_general_settings')`
**Migration:** Needs Settings CRUD functions in supabaseData.ts first
**Status:** Pending - Settings table exists but CRUD functions not yet created

---

## Migration Checklist

### Phase 1: Property Management ⏳
- [ ] Create Property (`handleAddPropertySubmit`)
- [ ] Update Property (`handleEditPropertySubmit`)
- [ ] Delete Property (confirmation modal)

### Phase 2: Customer Management
- [ ] Create Customer
- [ ] Delete Customer

### Phase 3: Booking Management
- [ ] Create Booking
- [ ] Approve Booking
- [ ] Disapprove Booking
- [ ] Update Booking (payment)
- [ ] Cancel Booking
- [ ] Delete Booking

### Phase 4: Payment Management
- [ ] Create Payment
- [ ] View Payments (5 locations)
- [ ] Delete Payment

### Phase 5: Category & Feature Management
- [ ] Delete Category
- [ ] Delete Feature

### Phase 6: Settings Management (Requires new functions)
- [ ] Create Settings CRUD functions in supabaseData.ts
- [ ] Migrate SMS Settings
- [ ] Migrate General Settings

---

## Testing Strategy

After each migration phase:

1. **Test Create Operations**
   - Create new entity
   - Verify in Supabase Dashboard
   - Verify in app UI

2. **Test Read Operations**
   - Reload page
   - Verify data loads correctly
   - Check console for errors

3. **Test Update Operations**
   - Edit existing entity
   - Verify changes in Supabase
   - Verify changes in app

4. **Test Delete Operations**
   - Delete entity
   - Verify removed from Supabase
   - Verify removed from app UI

---

## Common Patterns

### Pattern 1: Create Operation
```typescript
// OLD:
const existingItems = JSON.parse(localStorage.getItem('skyway_items') || '[]');
const newItem = { id: Date.now(), ...data };
localStorage.setItem('skyway_items', JSON.stringify([...existingItems, newItem]));
setItems([...existingItems, newItem]);

// NEW:
const newItem = await adminHelpers.addItem(formData);
setItems([...items, newItem]);
```

### Pattern 2: Update Operation
```typescript
// OLD:
const updatedItems = items.map(item => item.id === selectedItem.id ? {...item, ...updates} : item);
localStorage.setItem('skyway_items', JSON.stringify(updatedItems));
setItems(updatedItems);

// NEW:
const updatedItem = await adminHelpers.modifyItem(selectedItem.id, updates);
const updatedItems = items.map(item => item.id === selectedItem.id ? updatedItem : item);
setItems(updatedItems);
```

### Pattern 3: Delete Operation
```typescript
// OLD:
const updatedItems = items.filter(item => item.id !== selectedItem.id);
localStorage.setItem('skyway_items', JSON.stringify(updatedItems));
setItems(updatedItems);

// NEW:
await adminHelpers.removeItem(selectedItem.id);
setItems(items.filter(item => item.id !== selectedItem.id));
```

---

## Notes

- All helper functions handle Supabase connection errors
- Demo mode (admin@skyway.com) bypasses Supabase and uses local state only
- Migration must be done carefully to avoid breaking existing functionality
- Each function should be tested individually before moving to the next

---

## Next Steps

1. ✅ Create helper functions - **DONE**
2. ⏳ Migrate property management functions - **IN PROGRESS**
3. Migrate customer management functions
4. Migrate booking management functions
5. Migrate payment management functions
6. Migrate category/feature management
7. Create settings CRUD functions
8. Migrate settings management
9. Final testing and cleanup

---

Last Updated: 2026-03-05

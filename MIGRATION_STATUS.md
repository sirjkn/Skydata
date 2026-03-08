# Migration Status - Skyway Suites Admin Dashboard

## ✅ Completed Migrations (Phase 1 & 2)

### Phase 1: Property Management
- ✅ **Create Property** (Line ~1232) - `handleAddPropertySubmit`
  - Changed to async function
  - Added connection check
  - Using `adminHelpers.addProperty()`
  - Added activity logging
  - Cleaned up localStorage code

- ⚠️ **Update Property** (Line ~1308) - `handleEditPropertySubmit`
  - Changed to async function
  - Added connection check
  - Using `adminHelpers.modifyProperty()`
  - Added activity logging
  - Old localStorage code partially wrapped in `if (false)`
  - **Needs cleanup:** Remove dead code

### Phase 2: Customer Management
- ✅ **Create Customer** (Line ~1416) - `handleAddCustomer`
  - Changed to async function
  - Added connection check
  - Using `adminHelpers.addCustomer()`
  - Added error handling

- ✅ **Delete Customer** (Line ~1443) - `handleDeleteCustomer`
  - Changed to async function
  - Added connection check
  - Using `adminHelpers.removeCustomer()`
  - Added error handling

---

## ⏳ Remaining Migrations (Phases 3-6)

### Phase 3: Booking Management (7 operations)

#### 1. Create Booking (Line ~1570)
**Location:** After `const newBooking = { ... }`
**Current code:**
```typescript
const updatedBookings = [...bookings, newBooking];
localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
setBookings(updatedBookings);
```

**Replace with:**
```typescript
try {
  const bookingData = {
    customerId: parseInt(newBooking.customerId),
    propertyId: parseInt(newBooking.propertyId),
    checkIn: newBooking.checkIn,
    checkOut: newBooking.checkOut,
    totalAmount: newBooking.totalAmount,
    amountPaid: 0,
    paymentStatus: 'Not Paid',
    status: newBooking.status,
    paymentMode: '',
    transactionId: '',
    notes: ''
  };
  const createdBooking = await adminHelpers.addBooking(bookingData);
  const updatedBookings = [...bookings, {...newBooking, id: createdBooking.id}];
  setBookings(updatedBookings);
} catch (error) {
  console.error('Error creating booking:', error);
  showModal('error', 'Error', 'Failed to create booking. Please try again.');
  return;
}
```

#### 2. Approve Booking (Line ~2303)
**Current code:**
```typescript
const updatedBookings = bookings.map(b => 
  b.id === booking.id 
    ? { ...b, status: 'Confirmed' }
    : b
);
setBookings(updatedBookings);
localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
```

**Replace with:**
```typescript
await adminHelpers.modifyBooking(booking.id, { booking_status: 'Confirmed' });
const updatedBookings = bookings.map(b => 
  b.id === booking.id 
    ? { ...b, status: 'Confirmed' }
    : b
);
setBookings(updatedBookings);
```

#### 3. Disapprove Booking (Line ~2338)
**Current code:**
```typescript
const updatedBookings = bookings.map(b => 
  b.id === booking.id 
    ? { ...b, status: 'Cancelled' }
    : b
);
setBookings(updatedBookings);
localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
```

**Replace with:**
```typescript
await adminHelpers.modifyBooking(booking.id, { booking_status: 'Cancelled' });
const updatedBookings = bookings.map(b => 
  b.id === booking.id 
    ? { ...b, status: 'Cancelled' }
    : b
);
setBookings(updatedBookings);
```

#### 4. Update Booking with Payment (Line ~3798)
**Current code:**
```typescript
setBookings(updatedBookings);
localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
```

**Replace with:**
```typescript
const bookingToUpdate = updatedBookings.find(b => b.id === selectedBooking.id);
if (bookingToUpdate) {
  await adminHelpers.modifyBooking(bookingToUpdate.id, {
    amount_paid: bookingToUpdate.amountPaid,
    payment_status: bookingToUpdate.paymentStatus
  });
}
setBookings(updatedBookings);
```

#### 5. Cancel Booking (Line ~3916)
**Current code:**
```typescript
const updatedBookings = bookings.map(b =>
  b.id === selectedBooking.id
    ? { ...b, status: 'Cancelled' }
    : b
);

localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
setBookings(updatedBookings);
```

**Replace with:**
```typescript
await adminHelpers.modifyBooking(selectedBooking.id, { booking_status: 'Cancelled' });
const updatedBookings = bookings.map(b =>
  b.id === selectedBooking.id
    ? { ...b, status: 'Cancelled' }
    : b
);
setBookings(updatedBookings);
```

#### 6. Delete Booking (Line ~4093)
**Current code:**
```typescript
const updatedBookings = bookings.filter(b => b.id !== selectedBooking.id);
localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
setBookings(updatedBookings);
```

**Replace with:**
```typescript
await adminHelpers.removeBooking(selectedBooking.id);
const updatedBookings = bookings.filter(b => b.id !== selectedBooking.id);
setBookings(updatedBookings);
```

#### 7. Update Booking After Payment Delete (Line ~5356)
**Current code:**
```typescript
setBookings(updatedBookings);
localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
```

**Replace with:**
```typescript
const bookingToUpdate = updatedBookings.find(b => b.id === selectedPayment.bookingId);
if (bookingToUpdate) {
  await adminHelpers.modifyBooking(bookingToUpdate.id, {
    amount_paid: bookingToUpdate.amountPaid,
    payment_status: bookingToUpdate.paymentStatus
  });
}
setBookings(updatedBookings);
```

---

### Phase 4: Payment Management (8 operations)

#### 1. Create Payment (Line ~3817)
**Find:** `const legacyPayment = { ... }`
**Current code:**
```typescript
const existingPayments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
localStorage.setItem('skyway_payments', JSON.stringify([...existingPayments, legacyPayment]));
```

**Replace with:**
```typescript
const paymentData = {
  bookingId: selectedBooking.id,
  customerId: selectedBooking.customerId,
  propertyId: selectedBooking.propertyId,
  paidAmount: payment.paidAmount,
  paymentMode: payment.paymentMode,
  transactionId: paymentForm.transactionId,
  date: payment.date,
  mpesaCode: paymentForm.mpesaCode || '',
  notes: ''
};
const createdPayment = await adminHelpers.addPayment(paymentData);
setPayments([...payments, createdPayment]);
```

#### 2. Delete Payment (Line ~5338)
**Current code:**
```typescript
const existingPayments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
const updatedPayments = existingPayments.filter((p: any) => p.id !== selectedPayment.id);
localStorage.setItem('skyway_payments', JSON.stringify(updatedPayments));
```

**Replace with:**
```typescript
await adminHelpers.removePayment(selectedPayment.id);
const updatedPayments = payments.filter(p => p.id !== selectedPayment.id);
setPayments(updatedPayments);
```

#### 3-8. View Payments (Lines 2480, 2581, 3581, 3614, 3947, etc.)
**Current code (pattern):**
```typescript
const existingPayments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
const bookingPayments = existingPayments.filter((p: any) => p.bookingId === booking.id);
```

**Replace with:**
```typescript
const bookingPayments = payments.filter(p => p.bookingId === booking.id);
```

Note: Since `payments` state is already loaded from Supabase, just use the state directly.

---

### Phase 5: Category & Feature Management (2 operations)

#### 1. Delete Category (Line ~2895)
**Current code:**
```typescript
onClick={() => {
  const updatedCategories = categories.filter((_, i) => i !== index);
  setCategories(updatedCategories);
  localStorage.setItem('skyway_categories', JSON.stringify(updatedCategories));
}}
```

**Replace with:**
```typescript
onClick={async () => {
  if (!checkConnection()) {
    showModal('error', 'No Connection', 'Cannot delete category. Please check your internet connection.');
    return;
  }
  try {
    await adminHelpers.removeCategory(categories[index]);
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
  } catch (error) {
    console.error('Error deleting category:', error);
    showModal('error', 'Error', 'Failed to delete category. Please try again.');
  }
}}
```

#### 2. Delete Feature (Line ~2969)
**Current code:**
```typescript
onClick={() => {
  const updatedFeatures = features.filter((_, i) => i !== index);
  setFeatures(updatedFeatures);
  localStorage.setItem('skyway_features', JSON.stringify(updatedFeatures));
}}
```

**Replace with:**
```typescript
onClick={async () => {
  if (!checkConnection()) {
    showModal('error', 'No Connection', 'Cannot delete feature. Please check your internet connection.');
    return;
  }
  try {
    await adminHelpers.removeFeature(features[index]);
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  } catch (error) {
    console.error('Error deleting feature:', error);
    showModal('error', 'Error', 'Failed to delete feature. Please try again.');
  }
}}
```

---

### Phase 6: Settings Management (Requires new CRUD functions)

#### Lines 2306, 2307 - SMS and General Settings
**Current code:**
```typescript
const smsSettings = JSON.parse(localStorage.getItem('skyway_sms_settings') || '{}');
const generalSettings = JSON.parse(localStorage.getItem('skyway_general_settings') || '{}');
```

**Action Required:**
1. Create Settings CRUD functions in `/src/lib/supabaseData.ts`
2. Add to `/src/app/lib/adminHelpers.ts`
3. Replace localStorage calls

**Status:** Postponed until settings CRUD functions are created

---

## 🔧 Cleanup Required

### File: `/src/app/pages/admin-dashboard.tsx`

1. **Line ~1270-1276** - Remove dead code wrapped in `if (false)`
2. **Line ~1345-1380** - Remove duplicate property update localStorage code

---

## 📊 Progress Summary

| Phase | Component | Operations | Completed | Remaining |
|-------|-----------|------------|-----------|-----------|
| 1 | Property Management | 2 | 2 (needs cleanup) | 0 |
| 2 | Customer Management | 2 | 2 ✅ | 0 |
| 3 | Booking Management | 7 | 0 | 7 |
| 4 | Payment Management | 8 | 0 | 8 |
| 5 | Category/Feature | 2 | 0 | 2 |
| 6 | Settings | 2 | 0 | 2 (blocked) |
| **TOTAL** | | **23** | **4** | **19** |

**Completion:** 17% (4/23 operations)

---

## Next Steps

1. Continue with Booking Management (Phase 3)
2. Complete Payment Management (Phase 4)
3. Complete Category/Feature Management (Phase 5)
4. Clean up dead code from Property Management
5. Create Settings CRUD functions
6. Complete Settings Migration (Phase 6)

---

Last Updated: 2026-03-05

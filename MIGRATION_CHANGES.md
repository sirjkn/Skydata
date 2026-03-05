# Exact Changes Needed for Sup abase Migration

## Summary
- **Total localStorage operations:** 28
- **Helper functions created:** ✅ All done
- **Import added:** ✅ `import * as adminHelpers from '../lib/adminHelpers';`
- **Demo mode handling:** ✅ Already implemented (lines 478-496)

---

## 🔧 Required Changes

### Change 1: Property Create (Line ~1231)

**Location:** `handleAddPropertySubmit()` function

**Find this:**
```typescript
const handleAddPropertySubmit = () => {
```

**Replace with:**
```typescript
const handleAddPropertySubmit = async () => {
  if (!checkConnection()) {
    showModal('error', 'No Connection', 'Cannot create property. Please check your internet connection.');
    return;
  }
```

**Then find this block (lines ~1238-1273):**
```typescript
try {
  // Get existing properties
  const existingProperties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  
  // Create new property
  const newProperty = {
    id: Date.now(),
    name: propertyForm.name,
    category: propertyForm.category,
    features: propertyForm.selectedFeatures,
    location: propertyForm.location,
    price: parseInt(propertyForm.price),
    description: propertyForm.description,
    beds: parseInt(propertyForm.beds) || 0,
    baths: parseInt(propertyForm.baths) || 0,
    area: parseInt(propertyForm.area) || 0,
    photos: photos,
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage with error handling
  const updatedProperties = [...existingProperties, newProperty];
  
  try {
    localStorage.setItem('skyway_properties', JSON.stringify(updatedProperties));
  } catch (storageError: any) {
    if (storageError.name === 'QuotaExceededError') {
      showModal('error', 'Storage Quota Exceeded', ...);
      return;
    }
    throw storageError;
  }
  
  // Update state to show new property immediately
  setProperties(updatedProperties);
```

**Replace with:**
```typescript
try {
  // Create new property via Supabase
  const newProperty = await adminHelpers.addProperty(propertyForm, photos);
  
  // Update state to show new property immediately
  setProperties([...properties, newProperty]);
  
  // Log activity
  const currentUser = getCurrentUser();
  if (currentUser) {
    await adminHelpers.logActivity(
      parseInt(currentUser.id),
      currentUser.name,
      currentUser.role,
      `Created property: ${propertyForm.name}`,
      'create',
      'property',
      newProperty.id
    );
  }
```

---

### Change 2: Property Update (Line ~1305)

**Location:** `handleEditPropertySubmit()` function

**Find this:**
```typescript
const handleEditPropertySubmit = () => {
```

**Replace with:**
```typescript
const handleEditPropertySubmit = async () => {
  if (!checkConnection()) {
    showModal('error', 'No Connection', 'Cannot update property. Please check your internet connection.');
    return;
  }
```

**Then find this block (lines ~1314-1339):**
```typescript
try {
  // Get existing properties
  const existingProperties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  
  // Update the property
  const updatedProperties = existingProperties.map((prop: any) => {
    if (prop.id === editingProperty.id) {
      return {
        ...prop,
        name: propertyForm.name,
        category: propertyForm.category,
        features: propertyForm.selectedFeatures,
        location: propertyForm.location,
        price: parseInt(propertyForm.price),
        description: propertyForm.description,
        beds: parseInt(propertyForm.beds) || 0,
        baths: parseInt(propertyForm.baths) || 0,
        area: parseInt(propertyForm.area) || 0,
        photos: photos
      };
    }
    return prop;
  });

  // Save to localStorage with error handling
  try {
    localStorage.setItem('skyway_properties', JSON.stringify(updatedProperties));
  } catch (storageError: any) {
    if (storageError.name === 'QuotaExceededError') {
      showModal('error', 'Storage Quota Exceeded', ...);
      return;
    }
    throw storageError;
  }
  
  setProperties(updatedProperties);
```

**Replace with:**
```typescript
try {
  // Update property via Supabase
  const updatedProperty = await adminHelpers.modifyProperty(editingProperty.id, propertyForm, photos);
  
  // Update state
  const updatedProperties = properties.map(prop => 
    prop.id === editingProperty.id ? updatedProperty : prop
  );
  setProperties(updatedProperties);
  
  // Log activity
  const currentUser = getCurrentUser();
  if (currentUser) {
    await adminHelpers.logActivity(
      parseInt(currentUser.id),
      currentUser.name,
      currentUser.role,
      `Updated property: ${propertyForm.name}`,
      'update',
      'property',
      editingProperty.id
    );
  }
```

---

### Change 3: Customer Create (Line ~1396)

**Find this:**
```typescript
const updatedCustomers = [...customers, newCustomer];
setCustomers(updatedCustomers);
localStorage.setItem('skyway_customers', JSON.stringify(updatedCustomers));
```

**Replace with:**
```typescript
const createdCustomer = await adminHelpers.addCustomer(customerForm);
const updatedCustomers = [...customers, createdCustomer];
setCustomers(updatedCustomers);
```

---

### Change 4: Customer Delete (Line ~1417)

**Find this:**
```typescript
const updatedCustomers = customers.filter(c => c.id !== selectedCustomer.id);
setCustomers(updatedCustomers);
localStorage.setItem('skyway_customers', JSON.stringify(updatedCustomers));
```

**Replace with:**
```typescript
await adminHelpers.removeCustomer(selectedCustomer.id);
const updatedCustomers = customers.filter(c => c.id !== selectedCustomer.id);
setCustomers(updatedCustomers);
```

---

### Change 5: Booking Create (Line ~1526)

**Find this:**
```typescript
const updatedBookings = [...bookings, newBooking];
localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
setBookings(updatedBookings);
```

**Replace with:**
```typescript
const createdBooking = await adminHelpers.addBooking(newBooking);
const updatedBookings = [...bookings, createdBooking];
setBookings(updatedBookings);
```

---

### Change 6: Booking Approve (Line ~2259)

**Find this:**
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

---

### Change 7: Booking Disapprove (Line ~2294)

**Find this:**
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

---

### Change 8: Payment Create (Line ~3773-3774)

**Find this:**
```typescript
const legacyPayment = {
  id: Date.now(),
  bookingId: selectedBooking.id,
  paidAmount: payment.paidAmount,
  paymentMode: payment.paymentMode,
  transactionId: paymentForm.transactionId,
  createdAt: payment.date
};
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
  date: payment.date
};
const createdPayment = await adminHelpers.addPayment(paymentData);
setPayments([...payments, createdPayment]);
```

---

### Change 9: Payment Delete (Line ~5294-5296)

**Find this:**
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

---

### Change 10: View Payments (Lines 2436, 2537, 3537, 3570, 3903)

**Find this pattern:**
```typescript
const existingPayments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
const bookingPayments = existingPayments.filter((p: any) => p.bookingId === booking.id);
```

**Replace with:**
```typescript
const bookingPayments = payments.filter(p => p.bookingId === booking.id);
// OR if you need fresh data:
// const bookingPayments = await adminHelpers.getBookingPayments(booking.id);
```

---

### Change 11: Category Delete (Line ~2851)

**Find this:**
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
  await adminHelpers.removeCategory(categories[index]);
  const updatedCategories = categories.filter((_, i) => i !== index);
  setCategories(updatedCategories);
}}
```

---

### Change 12: Feature Delete (Line ~2925)

**Find this:**
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
  await adminHelpers.removeFeature(features[index]);
  const updatedFeatures = features.filter((_, i) => i !== index);
  setFeatures(updatedFeatures);
}}
```

---

### Change 13: Booking Cancel (Line ~3872)

**Find this:**
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

---

### Change 14: Booking Delete (Line ~4049)

**Find this:**
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

---

### Change 15: Update Booking with Payment (Line ~3754)

**Find this:**
```typescript
setBookings(updatedBookings);
localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
```

**Replace with:**
```typescript
await adminHelpers.modifyBooking(selectedBooking.id, {
  amount_paid: updatedBooking.amountPaid,
  payment_status: updatedBooking.paymentStatus
});
setBookings(updatedBookings);
```

---

### Change 16: Update Booking After Payment Delete (Line ~5312)

**Find this:**
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

## ⚠️ Settings Migration (Pending)

Lines 2262-2263 use SMS and general settings from localStorage:
```typescript
const smsSettings = JSON.parse(localStorage.getItem('skyway_sms_settings') || '{}');
const generalSettings = JSON.parse(localStorage.getItem('skyway_general_settings') || '{}');
```

**Action Required:**
1. Create Settings CRUD functions in `/src/lib/supabaseData.ts`
2. Add helper functions to `/src/app/lib/adminHelpers.ts`
3. Replace localStorage calls with Supabase functions

**For now:** These can remain as localStorage since the `skyway_settings` table structure uses key-value pairs that need specific query functions.

---

## 🧪 Testing Each Change

After making each change:

1. Save the file
2. Check for TypeScript errors
3. Test the specific function:
   - Create operation → Create new item
   - Update operation → Edit existing item
   - Delete operation → Delete item
4. Verify in Supabase Dashboard
5. Check browser console for errors

---

## 📝 Notes

- All changes assume `checkConnection()` has been imported and is available
- Demo mode users (`admin@skyway.com`) won't reach these functions (early return in loadData)
- Error handling is included in helper functions
- Activity logging should be added for audit trail (shown in examples)

---

## Next Action

Start with **Change 1** (Property Create), test it thoroughly, then proceed to **Change 2**, and so on.

Would you like me to make these changes for you, or would you prefer to do them manually using this guide?

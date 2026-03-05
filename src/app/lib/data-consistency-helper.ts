/**
 * Data Consistency Helper
 * 
 * This module ensures referential integrity and data consistency
 * when performing operations that affect related data.
 * 
 * For example:
 * - When a property is deleted, all related bookings are also deleted
 * - When a customer is deleted, their bookings are reassigned or handled
 * - When data is updated, all related records are updated accordingly
 */

/**
 * Clean up orphaned bookings (bookings for properties that no longer exist)
 */
export const cleanupOrphanedBookings = (): void => {
  const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  
  const propertyIds = new Set(properties.map((p: any) => p.id));
  
  const validBookings = bookings.filter((booking: any) => 
    propertyIds.has(booking.propertyId)
  );
  
  if (validBookings.length !== bookings.length) {
    console.log(`🧹 Cleaned up ${bookings.length - validBookings.length} orphaned bookings`);
    localStorage.setItem('skyway_bookings', JSON.stringify(validBookings));
  }
};

/**
 * Clean up orphaned payments (payments for bookings that no longer exist)
 */
export const cleanupOrphanedPayments = (): void => {
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
  
  const bookingIds = new Set(bookings.map((b: any) => b.id));
  
  const validPayments = payments.filter((payment: any) => 
    bookingIds.has(payment.bookingId)
  );
  
  if (validPayments.length !== payments.length) {
    console.log(`🧹 Cleaned up ${payments.length - validPayments.length} orphaned payments`);
    localStorage.setItem('skyway_payments', JSON.stringify(validPayments));
  }
};

/**
 * Delete a property and all its related data (bookings and payments)
 */
export const deletePropertyWithRelatedData = async (propertyId: string | number): Promise<void> => {
  // Get all data
  const properties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
  
  // Find bookings for this property
  const relatedBookingIds = bookings
    .filter((b: any) => b.propertyId === propertyId)
    .map((b: any) => b.id);
  
  // Delete property
  const updatedProperties = properties.filter((p: any) => p.id !== propertyId);
  localStorage.setItem('skyway_properties', JSON.stringify(updatedProperties));
  
  // Delete related bookings
  const updatedBookings = bookings.filter((b: any) => b.propertyId !== propertyId);
  localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
  
  // Delete related payments
  const updatedPayments = payments.filter((p: any) => !relatedBookingIds.includes(p.bookingId));
  localStorage.setItem('skyway_payments', JSON.stringify(updatedPayments));
  
  console.log(`✅ Deleted property ${propertyId} and ${relatedBookingIds.length} related bookings with their payments`);
  
  // Trigger UI update
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dataUpdated'));
};

/**
 * Delete a booking and all its related payments
 */
export const deleteBookingWithRelatedData = async (bookingId: string | number): Promise<void> => {
  // Get all data
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
  
  // Delete booking
  const updatedBookings = bookings.filter((b: any) => b.id !== bookingId);
  localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
  
  // Delete related payments
  const relatedPayments = payments.filter((p: any) => p.bookingId === bookingId);
  const updatedPayments = payments.filter((p: any) => p.bookingId !== bookingId);
  localStorage.setItem('skyway_payments', JSON.stringify(updatedPayments));
  
  console.log(`✅ Deleted booking ${bookingId} and ${relatedPayments.length} related payments`);
  
  // Trigger UI update
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dataUpdated'));
};

/**
 * Delete a customer and handle their bookings
 * Options: 
 * - 'delete': Delete all customer bookings and payments
 * - 'anonymize': Keep bookings but anonymize customer info
 */
export const deleteCustomerWithOptions = async (
  customerId: string | number, 
  option: 'delete' | 'anonymize' = 'anonymize'
): Promise<void> => {
  const customers = JSON.parse(localStorage.getItem('skyway_customers') || '[]');
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  const payments = JSON.parse(localStorage.getItem('skyway_payments') || '[]');
  
  // Delete customer
  const updatedCustomers = customers.filter((c: any) => c.id !== customerId);
  localStorage.setItem('skyway_customers', JSON.stringify(updatedCustomers));
  
  if (option === 'delete') {
    // Find bookings for this customer
    const customerBookingIds = bookings
      .filter((b: any) => b.customerId === customerId)
      .map((b: any) => b.id);
    
    // Delete customer bookings
    const updatedBookings = bookings.filter((b: any) => b.customerId !== customerId);
    localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
    
    // Delete related payments
    const updatedPayments = payments.filter((p: any) => !customerBookingIds.includes(p.bookingId));
    localStorage.setItem('skyway_payments', JSON.stringify(updatedPayments));
    
    console.log(`✅ Deleted customer ${customerId} and ${customerBookingIds.length} bookings with payments`);
  } else {
    // Anonymize bookings - keep them but mark as deleted customer
    const updatedBookings = bookings.map((b: any) => {
      if (b.customerId === customerId) {
        return {
          ...b,
          customerName: 'Deleted Customer',
          customerEmail: 'deleted@example.com',
          customerPhone: 'N/A'
        };
      }
      return b;
    });
    localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
    
    console.log(`✅ Deleted customer ${customerId} and anonymized their bookings`);
  }
  
  // Trigger UI update
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dataUpdated'));
};

/**
 * Update property ID across all related bookings
 * Useful when property IDs change or need to be normalized
 */
export const updatePropertyIdInRelatedData = (oldId: string | number, newId: string | number): void => {
  const bookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
  
  const updatedBookings = bookings.map((b: any) => {
    if (b.propertyId === oldId) {
      return { ...b, propertyId: newId };
    }
    return b;
  });
  
  localStorage.setItem('skyway_bookings', JSON.stringify(updatedBookings));
  
  console.log(`✅ Updated property ID from ${oldId} to ${newId} in related bookings`);
  
  // Trigger UI update
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dataUpdated'));
};

/**
 * Run all consistency checks and cleanup orphaned data
 */
export const runDataConsistencyCheck = (): void => {
  console.log('🔍 Running data consistency check...');
  
  cleanupOrphanedBookings();
  cleanupOrphanedPayments();
  
  console.log('✅ Data consistency check complete');
  
  // Trigger UI update
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dataUpdated'));
};

/**
 * Initialize data consistency checking on app load
 */
export const initializeDataConsistency = (): void => {
  // Run consistency check on load
  runDataConsistencyCheck();
  
  // Set up periodic consistency checks (every 5 minutes)
  setInterval(() => {
    runDataConsistencyCheck();
  }, 300000); // 5 minutes
};

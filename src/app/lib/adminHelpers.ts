/**
 * Admin Dashboard Helper Functions
 * Wraps Supabase operations for the admin dashboard
 * Version 1.0
 */

import {
  fetchCategories,
  fetchFeatures,
  createProperty,
  updateProperty,
  deleteProperty,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createBooking,
  updateBooking,
  deleteBooking,
  createPayment,
  deletePayment,
  fetchPaymentsByBooking,
  createCategory,
  deleteCategory,
  createFeature,
  deleteFeature,
  createActivityLog
} from '../../lib/supabaseData';

// ============================================================================
// PROPERTY HELPERS
// ============================================================================

export async function addProperty(propertyForm: any, photos: any) {
  // Find category ID by name
  const categoriesData = await fetchCategories();
  const categoryObj = categoriesData.find((c: any) => c.category_name === propertyForm.category);
  
  if (!categoryObj) {
    throw new Error('Invalid category selected');
  }

  // Create new property in Supabase
  const newPropertyData = {
    property_name: propertyForm.name,
    category_id: categoryObj.category_id,
    location: propertyForm.location,
    no_of_beds: parseInt(propertyForm.beds) || 0,
    bathrooms: parseFloat(propertyForm.baths) || 0,
    area_sqft: parseInt(propertyForm.area) || 0,
    description: propertyForm.description,
    price_per_month: parseFloat(propertyForm.price),
    photos: JSON.stringify(photos),
    features: JSON.stringify(propertyForm.selectedFeatures),
    is_available: true,
    is_featured: false
  };

  const createdProperty = await createProperty(newPropertyData);
  
  // Map to local format
  return {
    id: createdProperty.property_id,
    name: createdProperty.property_name,
    category: propertyForm.category,
    features: propertyForm.selectedFeatures,
    location: createdProperty.location,
    price: createdProperty.price_per_month,
    description: createdProperty.description || '',
    beds: createdProperty.no_of_beds,
    baths: createdProperty.bathrooms,
    area: createdProperty.area_sqft,
    photos: photos,
    viewCount: createdProperty.view_count,
    isFeatured: createdProperty.is_featured,
    isAvailable: createdProperty.is_available
  };
}

export async function modifyProperty(propertyId: number, propertyForm: any, photos: any) {
  // Find category ID by name
  const categoriesData = await fetchCategories();
  const categoryObj = categoriesData.find((c: any) => c.category_name === propertyForm.category);
  
  if (!categoryObj) {
    throw new Error('Invalid category selected');
  }

  // Update property in Supabase
  const updateData = {
    property_name: propertyForm.name,
    category_id: categoryObj.category_id,
    location: propertyForm.location,
    no_of_beds: parseInt(propertyForm.beds) || 0,
    bathrooms: parseFloat(propertyForm.baths) || 0,
    area_sqft: parseInt(propertyForm.area) || 0,
    description: propertyForm.description,
    price_per_month: parseFloat(propertyForm.price),
    photos: JSON.stringify(photos),
    features: JSON.stringify(propertyForm.selectedFeatures)
  };

  const updatedProperty = await updateProperty(propertyId, updateData);
  
  // Map to local format
  return {
    id: updatedProperty.property_id,
    name: updatedProperty.property_name,
    category: propertyForm.category,
    features: propertyForm.selectedFeatures,
    location: updatedProperty.location,
    price: updatedProperty.price_per_month,
    description: updatedProperty.description || '',
    beds: updatedProperty.no_of_beds,
    baths: updatedProperty.bathrooms,
    area: updatedProperty.area_sqft,
    photos: photos,
    viewCount: updatedProperty.view_count,
    isFeatured: updatedProperty.is_featured,
    isAvailable: updatedProperty.is_available
  };
}

export async function removeProperty(propertyId: number) {
  await deleteProperty(propertyId);
}

// ============================================================================
// CUSTOMER HELPERS
// ============================================================================

export async function addCustomer(customerForm: any) {
  const newCustomerData = {
    customer_name: customerForm.name,
    phone: customerForm.phone,
    email: customerForm.email,
    address: customerForm.address || '',
    password: customerForm.password || '',
    id_number: '',
    is_active: true
  };

  const createdCustomer = await createCustomer(newCustomerData);
  
  return {
    id: createdCustomer.customer_id,
    name: createdCustomer.customer_name,
    phone: createdCustomer.phone,
    email: createdCustomer.email,
    address: createdCustomer.address,
    password: createdCustomer.password
  };
}

export async function removeCustomer(customerId: number) {
  await deleteCustomer(customerId);
}

// ============================================================================
// BOOKING HELPERS
// ============================================================================

export async function addBooking(bookingData: any) {
  const newBookingData = {
    customer_id: bookingData.customerId,
    property_id: bookingData.propertyId,
    check_in_date: bookingData.checkIn,
    check_out_date: bookingData.checkOut,
    total_amount: bookingData.totalAmount,
    amount_paid: bookingData.amountPaid || 0,
    payment_status: bookingData.paymentStatus || 'Not Paid',
    booking_status: bookingData.status || 'Pending',
    payment_method: bookingData.paymentMode || '',
    payment_reference: bookingData.transactionId || '',
    notes: bookingData.notes || ''
  };

  const createdBooking = await createBooking(newBookingData);
  
  return {
    id: createdBooking.booking_id,
    propertyId: createdBooking.property_id,
    customerId: createdBooking.customer_id,
    checkIn: createdBooking.check_in_date,
    checkOut: createdBooking.check_out_date,
    status: createdBooking.booking_status,
    totalAmount: createdBooking.total_amount,
    amountPaid: createdBooking.amount_paid,
    paymentStatus: createdBooking.payment_status,
    paymentMode: createdBooking.payment_method,
    transactionId: createdBooking.payment_reference,
    notes: createdBooking.notes,
    payments: []
  };
}

export async function modifyBooking(bookingId: number, updates: any) {
  const updatedBooking = await updateBooking(bookingId, updates);
  
  return {
    id: updatedBooking.booking_id,
    propertyId: updatedBooking.property_id,
    customerId: updatedBooking.customer_id,
    checkIn: updatedBooking.check_in_date,
    checkOut: updatedBooking.check_out_date,
    status: updatedBooking.booking_status,
    totalAmount: updatedBooking.total_amount,
    amountPaid: updatedBooking.amount_paid,
    paymentStatus: updatedBooking.payment_status,
    paymentMode: updatedBooking.payment_method,
    transactionId: updatedBooking.payment_reference,
    notes: updatedBooking.notes,
    payments: []
  };
}

export async function removeBooking(bookingId: number) {
  await deleteBooking(bookingId);
}

// ============================================================================
// PAYMENT HELPERS
// ============================================================================

export async function addPayment(paymentData: any) {
  const newPaymentData = {
    booking_id: paymentData.bookingId,
    customer_id: paymentData.customerId,
    property_id: paymentData.propertyId,
    payment_date: paymentData.date,
    amount: paymentData.paidAmount,
    payment_method: paymentData.paymentMode,
    payment_reference: paymentData.transactionId,
    mpesa_code: paymentData.mpesaCode || '',
    notes: paymentData.notes || ''
  };

  const createdPayment = await createPayment(newPaymentData);
  
  return {
    id: createdPayment.payment_id,
    bookingId: createdPayment.booking_id,
    paidAmount: createdPayment.amount,
    paymentMode: createdPayment.payment_method,
    transactionId: createdPayment.payment_reference,
    date: createdPayment.payment_date
  };
}

export async function removePayment(paymentId: number) {
  await deletePayment(paymentId);
}

export async function getBookingPayments(bookingId: number) {
  const payments = await fetchPaymentsByBooking(bookingId);
  
  return payments.map((p: any) => ({
    id: p.payment_id,
    bookingId: p.booking_id,
    paidAmount: p.amount,
    paymentMode: p.payment_method,
    transactionId: p.payment_reference,
    date: p.payment_date
  }));
}

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

export async function addCategory(categoryName: string) {
  await createCategory({
    category_name: categoryName,
    description: '',
    icon: 'Building2'
  });
}

export async function removeCategory(categoryName: string) {
  const categoriesData = await fetchCategories();
  const categoryObj = categoriesData.find((c: any) => c.category_name === categoryName);
  
  if (categoryObj) {
    await deleteCategory(categoryObj.category_id);
  }
}

// ============================================================================
// FEATURE HELPERS
// ============================================================================

export async function addFeature(featureName: string) {
  await createFeature({
    feature_name: featureName,
    description: '',
    icon: 'Star'
  });
}

export async function removeFeature(featureName: string) {
  const featuresData = await fetchFeatures();
  const featureObj = featuresData.find((f: any) => f.feature_name === featureName);
  
  if (featureObj) {
    await deleteFeature(featureObj.feature_id);
  }
}

// ============================================================================
// ACTIVITY LOG HELPER
// ============================================================================

export async function logActivity(userId: number, userName: string, userRole: string, activity: string, activityType: string, entityType: string, entityId?: number) {
  await createActivityLog({
    user_id: userId,
    user_name: userName,
    user_role: userRole,
    activity: activity,
    activity_type: activityType,
    entity_type: entityType,
    entity_id: entityId
  });
}

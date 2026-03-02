// Database query functions for Skyway Suites
// Uses real Supabase tables instead of KV store

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// ============================================
// PROPERTIES
// ============================================

export async function getAllProperties() {
  const { data, error } = await supabase
    .from('properties_full')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties_full')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAvailableProperties() {
  const { data, error } = await supabase
    .from('properties_full')
    .select('*')
    .eq('status', 'available')
    .not('published_at', 'is', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createProperty(property: any) {
  const { data, error } = await supabase
    .from('properties')
    .insert({
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      type: property.type,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      area: property.area || 0,
      status: 'available',
      published_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;

  // Add images if provided
  if (property.images && property.images.length > 0) {
    const images = property.images.map((img: any, index: number) => ({
      property_id: data.id,
      url: img.url || img,
      category: img.category || 'general',
      is_primary: index === 0,
      display_order: index,
    }));

    await supabase.from('property_images').insert(images);
  }

  // Add features if provided
  if (property.amenities && property.amenities.length > 0) {
    // Get feature IDs from names
    const { data: features } = await supabase
      .from('features')
      .select('id, name')
      .in('name', property.amenities);

    if (features && features.length > 0) {
      const propertyFeatures = features.map((f: any) => ({
        property_id: data.id,
        feature_id: f.id,
      }));

      await supabase.from('property_features').insert(propertyFeatures);
    }
  }

  return data;
}

export async function updateProperty(id: string, updates: any) {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;

  // Update images if provided
  if (updates.images) {
    // Delete existing images
    await supabase.from('property_images').delete().eq('property_id', id);

    // Insert new images
    const images = updates.images.map((img: any, index: number) => ({
      property_id: id,
      url: img.url || img,
      category: img.category || 'general',
      is_primary: index === 0,
      display_order: index,
    }));

    await supabase.from('property_images').insert(images);
  }

  // Update features if provided
  if (updates.amenities) {
    // Delete existing features
    await supabase.from('property_features').delete().eq('property_id', id);

    // Get feature IDs from names
    const { data: features } = await supabase
      .from('features')
      .select('id, name')
      .in('name', updates.amenities);

    if (features && features.length > 0) {
      const propertyFeatures = features.map((f: any) => ({
        property_id: id,
        feature_id: f.id,
      }));

      await supabase.from('property_features').insert(propertyFeatures);
    }
  }

  return data;
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// CATEGORIES
// ============================================

export async function getAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createCategory(category: any) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: category.name, description: category.description })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: any) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// FEATURES
// ============================================

export async function getAllFeatures() {
  const { data, error } = await supabase
    .from('features')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createFeature(feature: any) {
  const { data, error } = await supabase
    .from('features')
    .insert({ name: feature.name, category: feature.category })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateFeature(id: string, updates: any) {
  const { data, error } = await supabase
    .from('features')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteFeature(id: string) {
  const { error } = await supabase
    .from('features')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// BOOKINGS
// ============================================

export async function getAllBookings() {
  const { data, error } = await supabase
    .from('bookings_full')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from('bookings_full')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCustomerBookings(customerId: string) {
  const { data, error } = await supabase
    .from('bookings_full')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createBooking(booking: any) {
  // Generate booking number
  const bookingNumber = `BK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_number: bookingNumber,
      property_id: booking.propertyId,
      customer_id: booking.customerId,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      price_per_period: booking.pricePerNight,
      number_of_periods: booking.nights,
      subtotal: booking.totalPrice,
      total_price: booking.totalPrice,
      number_of_guests: booking.guests || 1,
      contact_name: booking.customerName,
      contact_phone: booking.customerPhone,
      contact_email: booking.customerEmail,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBooking(id: string, updates: any) {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteBooking(id: string) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// CUSTOMERS
// ============================================

export async function getAllCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCustomerByUserId(userId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function getCustomerByEmail(email: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createCustomer(customer: any) {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: customer.userId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      role: customer.role || 'customer',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCustomer(id: string, updates: any) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// PAYMENTS
// ============================================

export async function getAllPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      booking:bookings(booking_number, property_id),
      customer:customers(name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getPaymentsByBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createPayment(payment: any) {
  const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { data, error } = await supabase
    .from('payments')
    .insert({
      payment_reference: paymentReference,
      booking_id: payment.bookingId,
      customer_id: payment.customerId,
      amount: payment.amount,
      payment_method: payment.method,
      mpesa_receipt_number: payment.mpesaReceiptNumber,
      phone_number: payment.phoneNumber,
      status: payment.status || 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePayment(id: string, updates: any) {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// REVIEWS
// ============================================

export async function getPropertyReviews(propertyId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:customers(name, avatar_url)
    `)
    .eq('property_id', propertyId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createReview(review: any) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      property_id: review.propertyId,
      customer_id: review.customerId,
      booking_id: review.bookingId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      is_visible: true,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// FAVORITES
// ============================================

export async function getCustomerFavorites(customerId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      property:properties_full(*)
    `)
    .eq('customer_id', customerId);
  
  if (error) throw error;
  return data || [];
}

export async function addFavorite(customerId: string, propertyId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      customer_id: customerId,
      property_id: propertyId,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeFavorite(customerId: string, propertyId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('customer_id', customerId)
    .eq('property_id', propertyId);
  
  if (error) throw error;
}

// ============================================
// SYSTEM SETTINGS
// ============================================

export async function getSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*');
  
  if (error) throw error;
  
  // Convert to object
  const settings: any = {};
  data?.forEach((item: any) => {
    settings[item.key] = item.value;
  });
  
  return settings;
}

export async function updateSetting(key: string, value: any) {
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// ACTIVITY LOGS
// ============================================

export async function createActivityLog(log: any) {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: log.userId,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      details: log.details,
      ip_address: log.ipAddress,
      user_agent: log.userAgent,
    });
  
  if (error) console.error('Activity log error:', error);
}

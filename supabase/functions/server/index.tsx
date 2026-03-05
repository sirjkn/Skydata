import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client for auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Health check endpoint
app.get("/make-server-6a712830/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth middleware for protected routes
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized: No access token provided' }, 401);
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return c.json({ error: 'Unauthorized: Invalid access token' }, 401);
  }
  
  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// ===== AUTH ROUTES =====

// Sign up
app.post("/make-server-6a712830/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Failed to sign up user' }, 500);
  }
});

// ===== PROPERTY ROUTES =====

// Get all properties
app.get("/make-server-6a712830/properties", async (c) => {
  try {
    const properties = await kv.getByPrefix('property:');
    return c.json({ properties });
  } catch (error) {
    console.log('Error fetching properties:', error);
    return c.json({ error: 'Failed to fetch properties' }, 500);
  }
});

// Get single property
app.get("/make-server-6a712830/properties/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const property = await kv.get(`property:${id}`);
    
    if (!property) {
      return c.json({ error: 'Property not found' }, 404);
    }
    
    return c.json({ property });
  } catch (error) {
    console.log('Error fetching property:', error);
    return c.json({ error: 'Failed to fetch property' }, 500);
  }
});

// Create property (admin only)
app.post("/make-server-6a712830/properties", requireAuth, async (c) => {
  try {
    const propertyData = await c.req.json();
    const propertyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const property = {
      id: propertyId,
      ...propertyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`property:${propertyId}`, property);
    
    return c.json({ property });
  } catch (error) {
    console.log('Error creating property:', error);
    return c.json({ error: 'Failed to create property' }, 500);
  }
});

// Update property (admin only)
app.put("/make-server-6a712830/properties/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existingProperty = await kv.get(`property:${id}`);
    if (!existingProperty) {
      return c.json({ error: 'Property not found' }, 404);
    }
    
    const updatedProperty = {
      ...existingProperty,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`property:${id}`, updatedProperty);
    
    return c.json({ property: updatedProperty });
  } catch (error) {
    console.log('Error updating property:', error);
    return c.json({ error: 'Failed to update property' }, 500);
  }
});

// Delete property (admin only)
app.delete("/make-server-6a712830/properties/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`property:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting property:', error);
    return c.json({ error: 'Failed to delete property' }, 500);
  }
});

// ===== BOOKING ROUTES =====

// Get all bookings (admin only)
app.get("/make-server-6a712830/bookings", requireAuth, async (c) => {
  try {
    const bookings = await kv.getByPrefix('booking:');
    return c.json({ bookings });
  } catch (error) {
    console.log('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Get user bookings
app.get("/make-server-6a712830/my-bookings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const allBookings = await kv.getByPrefix('booking:');
    const userBookings = allBookings.filter((booking: any) => booking.userId === userId);
    
    return c.json({ bookings: userBookings });
  } catch (error) {
    console.log('Error fetching user bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Create booking
app.post("/make-server-6a712830/bookings", requireAuth, async (c) => {
  try {
    const bookingData = await c.req.json();
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const bookingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const booking = {
      id: bookingId,
      userId,
      userEmail,
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`booking:${bookingId}`, booking);
    
    return c.json({ booking });
  } catch (error) {
    console.log('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Update booking status (admin only)
app.put("/make-server-6a712830/bookings/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const existingBooking = await kv.get(`booking:${id}`);
    if (!existingBooking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    const updatedBooking = {
      ...existingBooking,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`booking:${id}`, updatedBooking);
    
    return c.json({ booking: updatedBooking });
  } catch (error) {
    console.log('Error updating booking:', error);
    return c.json({ error: 'Failed to update booking' }, 500);
  }
});

// ===== CUSTOMER ROUTES (Admin) =====

// Get all customers (admin only)
app.get("/make-server-6a712830/customers", requireAuth, async (c) => {
  try {
    const customers = await kv.getByPrefix('customer:');
    return c.json({ customers });
  } catch (error) {
    console.log('Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers' }, 500);
  }
});

// Save customer inquiry
app.post("/make-server-6a712830/inquiries", async (c) => {
  try {
    const inquiryData = await c.req.json();
    const inquiryId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const inquiry = {
      id: inquiryId,
      ...inquiryData,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`inquiry:${inquiryId}`, inquiry);
    
    return c.json({ inquiry });
  } catch (error) {
    console.log('Error saving inquiry:', error);
    return c.json({ error: 'Failed to save inquiry' }, 500);
  }
});

// Create customer (admin only)
app.post("/make-server-6a712830/customers", requireAuth, async (c) => {
  try {
    const customerData = await c.req.json();
    const customerId = customerData.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const customer = {
      id: customerId,
      ...customerData,
      createdAt: customerData.createdAt || new Date().toISOString(),
    };
    
    await kv.set(`customer:${customerId}`, customer);
    
    return c.json({ customer });
  } catch (error) {
    console.log('Error creating customer:', error);
    return c.json({ error: 'Failed to create customer' }, 500);
  }
});

// Update customer (admin only)
app.put("/make-server-6a712830/customers/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existingCustomer = await kv.get(`customer:${id}`);
    if (!existingCustomer) {
      return c.json({ error: 'Customer not found' }, 404);
    }
    
    const updatedCustomer = {
      ...existingCustomer,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`customer:${id}`, updatedCustomer);
    
    return c.json({ customer: updatedCustomer });
  } catch (error) {
    console.log('Error updating customer:', error);
    return c.json({ error: 'Failed to update customer' }, 500);
  }
});

// Delete customer (admin only)
app.delete("/make-server-6a712830/customers/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`customer:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting customer:', error);
    return c.json({ error: 'Failed to delete customer' }, 500);
  }
});

// ===== PAYMENT ROUTES =====

// Get all payments (admin only)
app.get("/make-server-6a712830/payments", requireAuth, async (c) => {
  try {
    const payments = await kv.getByPrefix('payment:');
    return c.json({ payments });
  } catch (error) {
    console.log('Error fetching payments:', error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

// Create payment (admin only)
app.post("/make-server-6a712830/payments", requireAuth, async (c) => {
  try {
    const paymentData = await c.req.json();
    const paymentId = paymentData.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = {
      id: paymentId,
      ...paymentData,
      createdAt: paymentData.createdAt || new Date().toISOString(),
    };
    
    await kv.set(`payment:${paymentId}`, payment);
    
    return c.json({ payment });
  } catch (error) {
    console.log('Error creating payment:', error);
    return c.json({ error: 'Failed to create payment' }, 500);
  }
});

// Delete payment (admin only)
app.delete("/make-server-6a712830/payments/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`payment:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting payment:', error);
    return c.json({ error: 'Failed to delete payment' }, 500);
  }
});

// ===== SETTINGS ROUTES =====

// Get settings
app.get("/make-server-6a712830/settings", async (c) => {
  try {
    const settings = await kv.get('app:settings') || {};
    return c.json({ settings });
  } catch (error) {
    console.log('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update settings (admin only)
app.put("/make-server-6a712830/settings", requireAuth, async (c) => {
  try {
    const settingsData = await c.req.json();
    
    const settings = {
      ...settingsData,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set('app:settings', settings);
    
    return c.json({ settings });
  } catch (error) {
    console.log('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ===== CATEGORIES & FEATURES ROUTES =====

// Get categories
app.get("/make-server-6a712830/categories", async (c) => {
  try {
    const categories = await kv.get('app:categories') || [];
    return c.json({ categories });
  } catch (error) {
    console.log('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Update categories (admin only)
app.put("/make-server-6a712830/categories", requireAuth, async (c) => {
  try {
    const { categories } = await c.req.json();
    await kv.set('app:categories', categories);
    
    return c.json({ categories });
  } catch (error) {
    console.log('Error updating categories:', error);
    return c.json({ error: 'Failed to update categories' }, 500);
  }
});

// Get features
app.get("/make-server-6a712830/features", async (c) => {
  try {
    const features = await kv.get('app:features') || [];
    return c.json({ features });
  } catch (error) {
    console.log('Error fetching features:', error);
    return c.json({ error: 'Failed to fetch features' }, 500);
  }
});

// Update features (admin only)
app.put("/make-server-6a712830/features", requireAuth, async (c) => {
  try {
    const { features } = await c.req.json();
    await kv.set('app:features', features);
    
    return c.json({ features });
  } catch (error) {
    console.log('Error updating features:', error);
    return c.json({ error: 'Failed to update features' }, 500);
  }
});

// ===== ACTIVITY LOG ROUTES =====

// Get activity logs (admin only)
app.get("/make-server-6a712830/activity-logs", requireAuth, async (c) => {
  try {
    const logs = await kv.getByPrefix('activity-log:');
    return c.json({ logs });
  } catch (error) {
    console.log('Error fetching activity logs:', error);
    return c.json({ error: 'Failed to fetch activity logs' }, 500);
  }
});

// Create activity log
app.post("/make-server-6a712830/activity-logs", async (c) => {
  try {
    const logData = await c.req.json();
    const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const log = {
      id: logId,
      ...logData,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`activity-log:${logId}`, log);
    
    return c.json({ log });
  } catch (error) {
    console.log('Error creating activity log:', error);
    return c.json({ error: 'Failed to create activity log' }, 500);
  }
});

// ===== SYNC ROUTES =====

// Sync all data from localStorage to Supabase (admin only)
app.post("/make-server-6a712830/sync/upload", requireAuth, async (c) => {
  try {
    const { 
      properties, 
      customers, 
      bookings, 
      payments, 
      categories, 
      features, 
      settings,
      activityLogs 
    } = await c.req.json();
    
    console.log('Starting data sync to Supabase...');
    
    // Sync properties
    if (properties && Array.isArray(properties)) {
      for (const property of properties) {
        await kv.set(`property:${property.id}`, property);
      }
      console.log(`✅ Synced ${properties.length} properties`);
    }
    
    // Sync customers
    if (customers && Array.isArray(customers)) {
      for (const customer of customers) {
        await kv.set(`customer:${customer.id}`, customer);
      }
      console.log(`✅ Synced ${customers.length} customers`);
    }
    
    // Sync bookings
    if (bookings && Array.isArray(bookings)) {
      for (const booking of bookings) {
        await kv.set(`booking:${booking.id}`, booking);
      }
      console.log(`✅ Synced ${bookings.length} bookings`);
    }
    
    // Sync payments
    if (payments && Array.isArray(payments)) {
      for (const payment of payments) {
        await kv.set(`payment:${payment.id}`, payment);
      }
      console.log(`✅ Synced ${payments.length} payments`);
    }
    
    // Sync categories
    if (categories) {
      await kv.set('app:categories', categories);
      console.log(`✅ Synced categories`);
    }
    
    // Sync features
    if (features) {
      await kv.set('app:features', features);
      console.log(`✅ Synced features`);
    }
    
    // Sync settings
    if (settings) {
      await kv.set('app:settings', settings);
      console.log(`✅ Synced settings`);
    }
    
    // Sync activity logs
    if (activityLogs && Array.isArray(activityLogs)) {
      for (const log of activityLogs) {
        await kv.set(`activity-log:${log.id}`, log);
      }
      console.log(`✅ Synced ${activityLogs.length} activity logs`);
    }
    
    return c.json({ 
      success: true, 
      message: 'All data synced successfully to Supabase',
      counts: {
        properties: properties?.length || 0,
        customers: customers?.length || 0,
        bookings: bookings?.length || 0,
        payments: payments?.length || 0,
        activityLogs: activityLogs?.length || 0
      }
    });
  } catch (error) {
    console.log('Error syncing data to Supabase:', error);
    return c.json({ error: 'Failed to sync data' }, 500);
  }
});

// Download all data from Supabase
app.get("/make-server-6a712830/sync/download", async (c) => {
  try {
    console.log('Downloading all data from Supabase...');
    
    const properties = await kv.getByPrefix('property:');
    const customers = await kv.getByPrefix('customer:');
    const bookings = await kv.getByPrefix('booking:');
    const payments = await kv.getByPrefix('payment:');
    const activityLogs = await kv.getByPrefix('activity-log:');
    const categories = await kv.get('app:categories') || [];
    const features = await kv.get('app:features') || [];
    const settings = await kv.get('app:settings') || {};
    
    console.log(`✅ Downloaded ${properties.length} properties`);
    console.log(`✅ Downloaded ${customers.length} customers`);
    console.log(`✅ Downloaded ${bookings.length} bookings`);
    console.log(`✅ Downloaded ${payments.length} payments`);
    
    return c.json({ 
      properties,
      customers,
      bookings,
      payments,
      categories,
      features,
      settings,
      activityLogs
    });
  } catch (error) {
    console.log('Error downloading data from Supabase:', error);
    return c.json({ error: 'Failed to download data' }, 500);
  }
});

Deno.serve(app.fetch);

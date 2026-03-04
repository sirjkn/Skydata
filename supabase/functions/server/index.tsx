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

Deno.serve(app.fetch);

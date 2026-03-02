import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as db from "./database.tsx";

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

// Create a separate client for validating user tokens
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Initialize admin user on server startup
async function initializeAdminUser() {
  try {
    const adminEmail = 'admin@123.com';
    const adminPassword = '1234';
    
    // Check if admin user already exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('Error checking for existing admin user:', listError);
      return;
    }
    
    const existingAdmin = users?.users?.find((user: any) => user.email === adminEmail);
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', adminEmail);
      
      // Ensure admin has the correct role
      const currentRole = existingAdmin.user_metadata?.role;
      if (currentRole !== 'admin') {
        console.log('🔄 Updating admin role from', currentRole, 'to admin');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingAdmin.id,
          {
            user_metadata: {
              ...existingAdmin.user_metadata,
              name: 'System Administrator',
              role: 'admin'
            }
          }
        );
        
        if (updateError) {
          console.log('❌ Error updating admin role:', updateError);
        } else {
          console.log('✅ Admin role updated successfully');
        }
      }
      
      // Ensure admin is in customer database
      const adminInKV = await kv.get(`customer:${existingAdmin.id}`);
      if (!adminInKV) {
        console.log('🔄 Adding admin to customer database');
        await kv.set(`customer:${existingAdmin.id}`, {
          id: existingAdmin.id,
          name: 'System Administrator',
          email: adminEmail,
          phone: '',
          address: '',
          userId: existingAdmin.id,
          role: 'admin',
          createdAt: existingAdmin.created_at || new Date().toISOString(),
        });
        console.log('✅ Admin added to customer database');
      }
      
      // Ensure admin is in real database table
      try {
        const existingCustomer = await db.getCustomerByUserId(existingAdmin.id);
        if (!existingCustomer) {
          console.log('🔄 Adding admin to real database table');\n          await db.createCustomer({
            userId: existingAdmin.id,
            name: 'System Administrator',
            email: adminEmail,
            phone: '',
            address: '',
            role: 'admin',
          });\n          console.log('✅ Admin added to real database table');\n        }
      } catch (dbError) {
        console.log('⚠️  Note: Could not add admin to real database table (table may not exist yet):', dbError.message);\n      }
      
      return;
    }
    
    // Create admin user if it doesn't exist
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      user_metadata: { 
        name: 'System Administrator',
        role: 'admin'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('❌ Error creating admin user:', error);
      return;
    }
    
    console.log('✅ Admin user created successfully:', adminEmail);
    console.log('   Email: admin@123.com');
    console.log('   Password: 1234');
    console.log('   Role: admin (System Administrator)');
    
    // Add admin to customer database
    await kv.set(`customer:${data.user.id}`, {
      id: data.user.id,
      name: 'System Administrator',
      email: adminEmail,
      phone: '',
      address: '',
      userId: data.user.id,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    console.log('✅ Admin added to customer database');
    
  } catch (error) {
    console.log('❌ Exception initializing admin user:', error);
  }
}

// Initialize admin user
await initializeAdminUser();

// Health check endpoint
app.get("/make-server-6a712830/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth middleware for protected routes
const requireAuth = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('🔐 Auth check - Authorization header present:', !!authHeader);
    
    const accessToken = authHeader?.split(' ')[1];
    if (!accessToken) {
      console.log('❌ Auth failed: No access token provided');
      return c.json({ error: 'Unauthorized: No access token provided' }, 401);
    }
    
    console.log('🔑 Validating access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    
    // Create a Supabase client with the user's access token
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );
    
    // Validate the token by getting the user
    const { data: { user }, error } = await userSupabase.auth.getUser();
    
    if (error) {
      console.log('❌ Auth failed - Supabase error:', error.message);
      console.log('Error details:', JSON.stringify(error));
      return c.json({ error: `Unauthorized: ${error.message}` }, 401);
    }
    
    if (!user) {
      console.log('❌ Auth failed: No user found');
      return c.json({ error: 'Unauthorized: Invalid access token' }, 401);
    }
    
    console.log('✅ Auth successful - User:', user.email, 'ID:', user.id);
    c.set('userId', user.id);
    c.set('userEmail', user.email);
    c.set('user', user);
    await next();
  } catch (error) {
    console.log('❌ Auth exception:', error);
    console.log('Exception details:', JSON.stringify(error, null, 2));
    return c.json({ error: 'Unauthorized: Authentication error' }, 401);
  }
};

// ===== AUTH ROUTES =====

// Signup route - Creates user and adds to customers
app.post("/make-server-6a712830/signup", async (c) => {
  try {
    const body = await c.req.json();
    console.log('Signup request received:', { email: body.email, name: body.name });

    const { email, password, name, phone, address, role } = body;

    if (!email || !password) {
      console.log('Missing required fields');
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Create user in Supabase Auth with role (default to 'customer')
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: name || '',
        phone: phone || '',
        address: address || '',
        role: role || 'customer'  // Default role is customer
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating user in Supabase Auth:', error);
      return c.json({ error: error.message || 'Failed to create account' }, 400);
    }

    console.log('User created in Supabase Auth:', data.user.id);

    // Add user to customers database
    const customerId = data.user.id; // Use Supabase user ID as customer ID
    
    const customer = {
      id: customerId,
      name: name || '',
      phone: phone || '',
      email: email,
      address: address || '',
      userId: data.user.id,
      role: role || 'customer',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`customer:${customerId}`, customer);
    console.log('Customer added to database:', customerId);

    return c.json({ 
      success: true, 
      user: data.user,
      customer 
    });
  } catch (error) {
    console.log('Error in signup route:', error);
    return c.json({ error: `Failed to create account: ${error.message}` }, 500);
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
    
    console.log('💾 Saving property to Supabase:', propertyId);
    await kv.set(`property:${propertyId}`, property);
    console.log('✅ Property saved successfully:', propertyId);
    
    return c.json({ property });
  } catch (error) {
    console.log('❌ Error creating property:', error);
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
    
    console.log('💾 Updating property in Supabase:', id);
    await kv.set(`property:${id}`, updatedProperty);
    console.log('✅ Property updated successfully:', id);
    
    return c.json({ property: updatedProperty });
  } catch (error) {
    console.log('❌ Error updating property:', error);
    return c.json({ error: 'Failed to update property' }, 500);
  }
});

// Delete property (admin only)
app.delete("/make-server-6a712830/properties/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    console.log('🗑️ Deleting property from Supabase:', id);
    await kv.del(`property:${id}`);
    console.log('✅ Property deleted successfully:', id);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('❌ Error deleting property:', error);
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
    
    console.log('💾 Saving booking to Supabase:', bookingId);
    await kv.set(`booking:${bookingId}`, booking);
    console.log('✅ Booking saved successfully:', bookingId);
    
    return c.json({ booking });
  } catch (error) {
    console.log('❌ Error creating booking:', error);
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
    
    console.log('💾 Updating booking in Supabase:', id, 'Status:', status);
    await kv.set(`booking:${id}`, updatedBooking);
    console.log('✅ Booking updated successfully:', id);
    
    return c.json({ booking: updatedBooking });
  } catch (error) {
    console.log('❌ Error updating booking:', error);
    return c.json({ error: 'Failed to update booking' }, 500);
  }
});

// ===== CUSTOMER ROUTES (Admin) =====

// Get all customers (admin only)
app.get("/make-server-6a712830/customers", requireAuth, async (c) => {
  try {
    console.log('📥 Fetching customers from database...');
    const customers = await kv.getByPrefix('customer:');
    console.log(`✅ Found ${customers.length} customers`);
    return c.json({ customers });
  } catch (error) {
    console.log('❌ Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers' }, 500);
  }
});

// Create customer (direct save)
app.post("/make-server-6a712830/customers", async (c) => {
  try {
    const customerData = await c.req.json();
    const customerId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const customer = {
      id: customerId,
      ...customerData,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`customer:${customerId}`, customer);
    console.log('Customer added:', customerId);
    
    return c.json({ success: true, customer });
  } catch (error) {
    console.log('Error creating customer:', error);
    return c.json({ error: 'Failed to create customer' }, 500);
  }
});

// ===== USER MANAGEMENT ROUTES (Admin) =====

// Get all users with their roles
app.get("/make-server-6a712830/users", requireAuth, async (c) => {
  try {
    console.log('📥 Fetching users from Supabase Auth...');
    
    // Get all users from Supabase Auth
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Error fetching users:', error);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }
    
    // Get customer data for additional information
    const customers = await kv.getByPrefix('customer:');
    const customerMap = new Map(customers.map(c => [c.id, c]));
    
    // Combine auth data with customer data
    const users = data.users.map((user: any) => {
      const customerData = customerMap.get(user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || customerData?.name || 'N/A',
        phone: user.user_metadata?.phone || customerData?.phone || '',
        role: user.user_metadata?.role || 'customer',
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
      };
    });
    
    console.log(`✅ Found ${users.length} users`);
    return c.json({ users });
  } catch (error) {
    console.log('❌ Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Update user role
app.put("/make-server-6a712830/users/:userId/role", requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId');
    const { role } = await c.req.json();
    
    console.log(`🔄 Updating role for user ${userId} to ${role}`);
    
    // Validate role
    if (!['admin', 'manager', 'customer'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be admin, manager, or customer' }, 400);
    }
    
    // Get current user data
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !userData.user) {
      console.log('❌ Error fetching user:', getUserError);
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Update user metadata with new role
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...userData.user.user_metadata,
          role: role
        }
      }
    );
    
    if (error) {
      console.log('❌ Error updating user role:', error);
      return c.json({ error: 'Failed to update user role' }, 500);
    }
    
    console.log(`✅ Updated role for user ${userId} to ${role}`);
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('❌ Error updating user role:', error);
    return c.json({ error: 'Failed to update user role' }, 500);
  }
});

// ===== SETTINGS ROUTES =====

// Get system settings
app.get("/make-server-6a712830/settings", requireAuth, async (c) => {
  try {
    const settings = await kv.get('system:settings');
    return c.json({ settings });
  } catch (error) {
    console.log('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Save system settings
app.post("/make-server-6a712830/settings", requireAuth, async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('system:settings', settings);
    return c.json({ success: true, settings });
  } catch (error) {
    console.log('Error saving settings:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

// ===== BACKUP & RESTORE ROUTES =====

// Create full backup
app.get("/make-server-6a712830/backup", requireAuth, async (c) => {
  try {
    const properties = await kv.getByPrefix('property:');
    const bookings = await kv.getByPrefix('booking:');
    const customers = await kv.getByPrefix('customer:');
    const settings = await kv.get('system:settings');
    
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        properties,
        bookings,
        customers,
        settings,
      }
    };
    
    return c.json(backup);
  } catch (error) {
    console.log('Error creating backup:', error);
    return c.json({ error: 'Failed to create backup' }, 500);
  }
});

// Restore from backup
app.post("/make-server-6a712830/restore", requireAuth, async (c) => {
  try {
    const backup = await c.req.json();
    
    if (!backup.data) {
      return c.json({ error: 'Invalid backup format' }, 400);
    }
    
    // Restore properties
    if (backup.data.properties) {
      for (const property of backup.data.properties) {
        await kv.set(`property:${property.id}`, property);
      }
    }
    
    // Restore bookings
    if (backup.data.bookings) {
      for (const booking of backup.data.bookings) {
        await kv.set(`booking:${booking.id}`, booking);
      }
    }
    
    // Restore customers
    if (backup.data.customers) {
      for (const customer of backup.data.customers) {
        await kv.set(`customer:${customer.id}`, customer);
      }
    }
    
    // Restore settings
    if (backup.data.settings) {
      await kv.set('system:settings', backup.data.settings);
    }
    
    return c.json({ success: true, message: 'Data restored successfully' });
  } catch (error) {
    console.log('Error restoring backup:', error);
    return c.json({ error: 'Failed to restore backup' }, 500);
  }
});

// ===== DATA EXPORT ROUTES =====

// Export specific data type
app.get("/make-server-6a712830/export/:type", requireAuth, async (c) => {
  try {
    const type = c.req.param('type');
    let data;
    
    switch (type) {
      case 'properties':
        data = await kv.getByPrefix('property:');
        break;
      case 'bookings':
        data = await kv.getByPrefix('booking:');
        break;
      case 'customers':
        data = await kv.getByPrefix('customer:');
        break;
      case 'settings':
        data = await kv.get('system:settings');
        break;
      default:
        return c.json({ error: 'Invalid data type' }, 400);
    }
    
    return c.json({
      type,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.log('Error exporting data:', error);
    return c.json({ error: 'Failed to export data' }, 500);
  }
});

// ===== CATEGORIES ROUTES =====

// Get all categories
app.get("/make-server-6a712830/categories", requireAuth, async (c) => {
  try {
    const categories = await kv.getByPrefix('category:');
    return c.json({ categories });
  } catch (error) {
    console.log('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Create category
app.post("/make-server-6a712830/categories", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    console.log('Creating category with data:', body);
    
    const { name } = body;
    
    if (!name) {
      console.log('Category name is missing');
      return c.json({ error: 'Category name is required' }, 400);
    }
    
    const categoryId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const category = {
      id: categoryId,
      name,
      createdAt: new Date().toISOString(),
    };
    
    console.log('Saving category:', category);
    await kv.set(`category:${categoryId}`, category);
    console.log('Category saved successfully');
    
    return c.json({ category });
  } catch (error) {
    console.log('Error creating category:', error);
    return c.json({ error: `Failed to create category: ${error.message}` }, 500);
  }
});

// Delete category
app.delete("/make-server-6a712830/categories/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`category:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting category:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// ===== FEATURES ROUTES =====

// Get all features
app.get("/make-server-6a712830/features", requireAuth, async (c) => {
  try {
    const features = await kv.getByPrefix('feature:');
    return c.json({ features });
  } catch (error) {
    console.log('Error fetching features:', error);
    return c.json({ error: 'Failed to fetch features' }, 500);
  }
});

// Create feature
app.post("/make-server-6a712830/features", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    console.log('Creating feature with data:', body);
    
    const { name } = body;
    
    if (!name) {
      console.log('Feature name is missing');
      return c.json({ error: 'Feature name is required' }, 400);
    }
    
    const featureId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const feature = {
      id: featureId,
      name,
      createdAt: new Date().toISOString(),
    };
    
    console.log('Saving feature:', feature);
    await kv.set(`feature:${featureId}`, feature);
    console.log('Feature saved successfully');
    
    return c.json({ feature });
  } catch (error) {
    console.log('Error creating feature:', error);
    return c.json({ error: `Failed to create feature: ${error.message}` }, 500);
  }
});

// Delete feature
app.delete("/make-server-6a712830/features/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`feature:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting feature:', error);
    return c.json({ error: 'Failed to delete feature' }, 500);
  }
});

Deno.serve(app.fetch);
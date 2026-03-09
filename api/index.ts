/**
 * Skyway Suites API Server
 * Migrated from Supabase Edge Functions to Vercel Serverless Functions
 * Using Neon PostgreSQL + Cloudinary + JWT Auth
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

const { Pool } = pg;

// =============================================
// CONFIGURATION
// =============================================

const NEON_CONNECTION_STRING = process.env.NEON_DATABASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: NEON_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
  max: 20,
});

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Execute database query
 */
async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const result = await pool.query(text, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Generate JWT token
 */
function generateToken(userId: number, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token
 */
function verifyToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
  } catch (error) {
    return null;
  }
}

/**
 * CORS headers
 */
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Parse request body
 */
function parseBody(req: VercelRequest): any {
  return req.body;
}

/**
 * Get auth user from token
 */
function getAuthUser(req: VercelRequest): { userId: number; email: string; role: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

// =============================================
// MAIN HANDLER
// =============================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { method, url } = req;
  const path = url?.split('?')[0] || '';
  
  try {
    // ===== HEALTH CHECK =====
    if (path === '/api/health' && method === 'GET') {
      return res.status(200).json({ status: 'ok', database: 'neon', storage: 'cloudinary' });
    }
    
    // ===== AUTH ROUTES =====
    
    // Sign up
    if (path === '/api/auth/signup' && method === 'POST') {
      const { email, password, name, role = 'Customer' } = parseBody(req);
      
      // Check if user exists
      const existingUser = await query('SELECT * FROM skyway_auth_user WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const result = await query(
        'INSERT INTO skyway_auth_user (customer_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, customer_name, email, role',
        [name, email, hashedPassword, role]
      );
      
      const user = result.rows[0];
      const token = generateToken(user.user_id, user.email, user.role);
      
      return res.status(201).json({ user, token });
    }
    
    // Sign in
    if (path === '/api/auth/signin' && method === 'POST') {
      const { email, password } = parseBody(req);
      
      // Get user
      const result = await query('SELECT * FROM skyway_auth_user WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login
      await query('UPDATE skyway_auth_user SET last_login = NOW() WHERE user_id = $1', [user.user_id]);
      
      const token = generateToken(user.user_id, user.email, user.role);
      
      return res.status(200).json({
        user: {
          user_id: user.user_id,
          customer_name: user.customer_name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    }
    
    // Reset password
    if (path === '/api/auth/reset-password' && method === 'POST') {
      const { email, newPassword } = parseBody(req);
      
      // Get user
      const result = await query('SELECT * FROM skyway_auth_user WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await query('UPDATE skyway_auth_user SET password = $1 WHERE email = $2', [hashedPassword, email]);
      
      return res.status(200).json({ success: true, message: 'Password reset successfully' });
    }
    
    // ===== PROPERTY ROUTES =====
    
    // Get all properties
    if (path === '/api/properties' && method === 'GET') {
      const result = await query('SELECT * FROM skyway_properties ORDER BY created_at DESC');
      return res.status(200).json({ properties: result.rows });
    }
    
    // Get single property
    if (path?.match(/^\/api\/properties\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/').pop() || '0');
      const result = await query('SELECT * FROM skyway_properties WHERE property_id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      // Increment view count
      await query('UPDATE skyway_properties SET view_count = view_count + 1 WHERE property_id = $1', [id]);
      
      return res.status(200).json({ property: result.rows[0] });
    }
    
    // Create property (auth required)
    if (path === '/api/properties' && method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser || !['Admin', 'Manager'].includes(authUser.role)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const data = parseBody(req);
      const result = await query(
        `INSERT INTO skyway_properties 
        (property_name, category_id, location, no_of_beds, bathrooms, area_sqft, description, 
         price_per_month, security_deposit, photos, features, is_available, is_featured) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *`,
        [
          data.property_name,
          data.category_id,
          data.location,
          data.no_of_beds,
          data.bathrooms,
          data.area_sqft,
          data.description,
          data.price_per_month,
          data.security_deposit,
          data.photos,
          data.features,
          data.is_available ?? true,
          data.is_featured ?? false,
        ]
      );
      
      return res.status(201).json({ property: result.rows[0] });
    }
    
    // Update property (auth required)
    if (path?.match(/^\/api\/properties\/\d+$/) && method === 'PUT') {
      const authUser = getAuthUser(req);
      if (!authUser || !['Admin', 'Manager'].includes(authUser.role)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const id = parseInt(path.split('/').pop() || '0');
      const data = parseBody(req);
      
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && !['property_id', 'created_at', 'updated_at'].includes(key)) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      values.push(id);
      const result = await query(
        `UPDATE skyway_properties SET ${fields.join(', ')} WHERE property_id = $${paramIndex} RETURNING *`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      return res.status(200).json({ property: result.rows[0] });
    }
    
    // Delete property (auth required)
    if (path?.match(/^\/api\/properties\/\d+$/) && method === 'DELETE') {
      const authUser = getAuthUser(req);
      if (!authUser || authUser.role !== 'Admin') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const id = parseInt(path.split('/').pop() || '0');
      await query('DELETE FROM skyway_properties WHERE property_id = $1', [id]);
      
      return res.status(200).json({ success: true });
    }
    
    // ===== BOOKING ROUTES =====
    
    // Get all bookings (auth required)
    if (path === '/api/bookings' && method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const result = await query('SELECT * FROM skyway_bookings ORDER BY created_at DESC');
      return res.status(200).json({ bookings: result.rows });
    }
    
    // Create booking (auth required)
    if (path === '/api/bookings' && method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const data = parseBody(req);
      const result = await query(
        `INSERT INTO skyway_bookings 
        (customer_id, property_id, check_in_date, check_out_date, total_amount, amount_paid, 
         payment_status, booking_status, payment_method, payment_reference, notes, created_by) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING *`,
        [
          data.customer_id,
          data.property_id,
          data.check_in_date,
          data.check_out_date,
          data.total_amount,
          data.amount_paid || 0,
          data.payment_status || 'Not Paid',
          data.booking_status || 'Pending',
          data.payment_method,
          data.payment_reference,
          data.notes,
          authUser.userId,
        ]
      );
      
      return res.status(201).json({ booking: result.rows[0] });
    }
    
    // Update booking (auth required)
    if (path?.match(/^\/api\/bookings\/\d+$/) && method === 'PUT') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const id = parseInt(path.split('/').pop() || '0');
      const data = parseBody(req);
      
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && !['booking_id', 'created_at', 'updated_at'].includes(key)) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      values.push(id);
      const result = await query(
        `UPDATE skyway_bookings SET ${fields.join(', ')} WHERE booking_id = $${paramIndex} RETURNING *`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      return res.status(200).json({ booking: result.rows[0] });
    }
    
    // ===== CUSTOMER ROUTES =====
    
    // Get all customers (auth required)
    if (path === '/api/customers' && method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser || !['Admin', 'Manager'].includes(authUser.role)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const result = await query('SELECT * FROM skyway_customers ORDER BY created_at DESC');
      return res.status(200).json({ customers: result.rows });
    }
    
    // Create customer
    if (path === '/api/customers' && method === 'POST') {
      const data = parseBody(req);
      const result = await query(
        `INSERT INTO skyway_customers 
        (customer_name, phone, email, address, id_number, profile_photo, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [
          data.customer_name,
          data.phone,
          data.email,
          data.address,
          data.id_number,
          data.profile_photo,
          data.notes,
        ]
      );
      
      return res.status(201).json({ customer: result.rows[0] });
    }
    
    // ===== SETTINGS ROUTES =====
    
    // Get all settings (auth required)
    if (path === '/api/settings' && method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser || !['Admin', 'Manager'].includes(authUser.role)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const result = await query('SELECT * FROM skyway_settings ORDER BY setting_category, setting_key');
      return res.status(200).json({ settings: result.rows });
    }
    
    // Update setting (auth required)
    if (path === '/api/settings' && method === 'PUT') {
      const authUser = getAuthUser(req);
      if (!authUser || authUser.role !== 'Admin') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { setting_category, setting_key, setting_value } = parseBody(req);
      const result = await query(
        `INSERT INTO skyway_settings (setting_category, setting_key, setting_value) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (setting_category, setting_key) 
         DO UPDATE SET setting_value = $3 
         RETURNING *`,
        [setting_category, setting_key, setting_value]
      );
      
      return res.status(200).json({ setting: result.rows[0] });
    }
    
    // ===== CATEGORY ROUTES =====
    
    // Get all categories
    if (path === '/api/categories' && method === 'GET') {
      const result = await query('SELECT * FROM skyway_categories ORDER BY category_name');
      return res.status(200).json({ categories: result.rows });
    }
    
    // ===== FEATURES ROUTES =====
    
    // Get all features
    if (path === '/api/features' && method === 'GET') {
      const result = await query('SELECT * FROM skyway_features ORDER BY feature_name');
      return res.status(200).json({ features: result.rows });
    }
    
    // ===== ACTIVITY LOG ROUTES =====
    
    // Get activity logs (auth required)
    if (path === '/api/activity-logs' && method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser || !['Admin', 'Manager'].includes(authUser.role)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const result = await query('SELECT * FROM skyway_activity_logs ORDER BY created_at DESC LIMIT 100');
      return res.status(200).json({ logs: result.rows });
    }
    
    // Create activity log
    if (path === '/api/activity-logs' && method === 'POST') {
      const data = parseBody(req);
      const result = await query(
        `INSERT INTO skyway_activity_logs 
        (user_id, user_name, user_role, activity, activity_type, entity_type, entity_id, ip_address, user_agent) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
        [
          data.user_id,
          data.user_name,
          data.user_role,
          data.activity,
          data.activity_type,
          data.entity_type,
          data.entity_id,
          data.ip_address,
          data.user_agent,
        ]
      );
      
      return res.status(201).json({ log: result.rows[0] });
    }
    
    // ===== CLOUDINARY UPLOAD SIGNATURE =====
    
    // Generate Cloudinary signature for secure uploads
    if (path === '/api/cloudinary/signature' && method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          upload_preset: 'ml_default',
        },
        CLOUDINARY_API_SECRET
      );
      
      return res.status(200).json({
        signature,
        timestamp,
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey: CLOUDINARY_API_KEY,
      });
    }
    
    // Route not found
    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

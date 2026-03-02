# Skyway Suites - Real Database Migration Guide

## 📋 Overview

This guide will help you migrate Skyway Suites from the KV store to a real PostgreSQL database with proper tables, relationships, and constraints.

## 🚀 Quick Start

### Step 1: Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/cwgzukgpuqcfsbchosxs
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire SQL schema below and paste it
5. Click **Run** to execute

---

## 📊 Complete SQL Schema

```sql
-- ============================================
-- SKYWAY SUITES DATABASE SCHEMA
-- Property Listing & Management Platform
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone to East Africa Time
ALTER DATABASE postgres SET timezone TO 'Africa/Nairobi';

-- ============================================
-- 1. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_categories_name ON categories(name);

-- ============================================
-- 2. FEATURES/AMENITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_features_name ON features(name);
CREATE INDEX idx_features_category ON features(category);

-- ============================================
-- 3. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'customer')),
    avatar_url TEXT,
    id_number VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_role ON customers(role);

-- ============================================
-- 4. PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Pricing
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KSh',
    price_period VARCHAR(20) DEFAULT 'month',
    
    -- Location
    location VARCHAR(255) NOT NULL,
    county VARCHAR(100),
    city VARCHAR(100),
    neighborhood VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property Details
    type VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area DECIMAL(10, 2),
    floor_number INTEGER,
    total_floors INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Owner/Manager
    owner_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    managed_by UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- SEO & Marketing
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0
);

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_category ON properties(category_id);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_properties_slug ON properties(slug);

-- ============================================
-- 5. PROPERTY IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    category VARCHAR(50),
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(is_primary);

-- ============================================
-- 6. PROPERTY FEATURES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS property_features (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (property_id, feature_id)
);

CREATE INDEX idx_property_features_property ON property_features(property_id);
CREATE INDEX idx_property_features_feature ON property_features(feature_id);

-- ============================================
-- 7. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- References
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    
    -- Dates
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Pricing
    price_per_period DECIMAL(12, 2) NOT NULL,
    number_of_periods INTEGER NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    service_fee DECIMAL(12, 2) DEFAULT 0,
    tax DECIMAL(12, 2) DEFAULT 0,
    total_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KSh',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'completed')
    ),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'partial', 'paid', 'refunded')
    ),
    
    -- Guest Details
    number_of_guests INTEGER DEFAULT 1,
    special_requests TEXT,
    
    -- Contact
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Constraints
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_number ON bookings(booking_number);

-- ============================================
-- 8. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    
    -- References
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    
    -- Payment Details
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KSh',
    payment_method VARCHAR(50),
    
    -- M-Pesa specific
    mpesa_receipt_number VARCHAR(100),
    phone_number VARCHAR(20),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'refunded')
    ),
    
    -- Timestamps
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(payment_reference);

-- ============================================
-- 9. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Individual Ratings
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    
    -- Response
    owner_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- One review per booking
    UNIQUE(booking_id)
);

CREATE INDEX idx_reviews_property ON reviews(property_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_visible ON reviews(is_visible);

-- ============================================
-- 10. FAVORITES/WISHLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    UNIQUE(customer_id, property_id)
);

CREATE INDEX idx_favorites_customer ON favorites(customer_id);
CREATE INDEX idx_favorites_property ON favorites(property_id);

-- ============================================
-- 11. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    
    -- Reference
    reference_id UUID,
    reference_type VARCHAR(50),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- 12. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_by UUID REFERENCES customers(id)
);

-- ============================================
-- 13. ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
    ('Apartment', 'Modern apartments in urban areas', 'building'),
    ('House', 'Standalone houses with gardens', 'home'),
    ('Villa', 'Luxury villas with premium amenities', 'hotel'),
    ('Studio', 'Compact studio apartments', 'door-closed')
ON CONFLICT (name) DO NOTHING;

-- Insert common features
INSERT INTO features (name, category, icon) VALUES
    ('WiFi', 'utilities', 'wifi'),
    ('Parking', 'facilities', 'car'),
    ('Swimming Pool', 'amenities', 'waves'),
    ('Gym', 'amenities', 'dumbbell'),
    ('Security', 'security', 'shield'),
    ('Balcony', 'features', 'wind'),
    ('Air Conditioning', 'utilities', 'air-vent'),
    ('Garden', 'features', 'trees'),
    ('Pet Friendly', 'policies', 'paw-print'),
    ('Furnished', 'features', 'sofa')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Properties with full details
CREATE OR REPLACE VIEW properties_full AS
SELECT 
    p.*,
    c.name as category_name,
    o.name as owner_name,
    o.email as owner_email,
    o.phone as owner_phone,
    COUNT(DISTINCT b.id) as total_bookings,
    AVG(r.rating) as average_rating,
    COUNT(DISTINCT r.id) as review_count,
    (
        SELECT json_agg(json_build_object('url', url, 'category', category, 'is_primary', is_primary))
        FROM property_images 
        WHERE property_id = p.id
        ORDER BY is_primary DESC, display_order
    ) as images,
    (
        SELECT json_agg(f.name)
        FROM property_features pf
        JOIN features f ON f.id = pf.feature_id
        WHERE pf.property_id = p.id
    ) as features
FROM properties p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN customers o ON o.id = p.owner_id
LEFT JOIN bookings b ON b.property_id = p.id
LEFT JOIN reviews r ON r.property_id = p.id AND r.is_visible = true
GROUP BY p.id, c.name, o.name, o.email, o.phone;

-- Bookings with full details
CREATE OR REPLACE VIEW bookings_full AS
SELECT 
    b.*,
    p.title as property_title,
    p.location as property_location,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    (
        SELECT SUM(amount) 
        FROM payments 
        WHERE booking_id = b.id AND status = 'completed'
    ) as amount_paid
FROM bookings b
JOIN properties p ON p.id = b.property_id
JOIN customers c ON c.id = b.customer_id;

-- ============================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for properties and related data
CREATE POLICY "Public can view active properties" ON properties
    FOR SELECT USING (status = 'available' AND published_at IS NOT NULL);

CREATE POLICY "Public can view property images" ON property_images
    FOR SELECT USING (true);

CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Public can view features" ON features
    FOR SELECT USING (true);

CREATE POLICY "Public can view property features" ON property_features
    FOR SELECT USING (true);

CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT USING (is_visible = true);

-- Customers can view/edit their own data
CREATE POLICY "Users can view own customer data" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own customer data" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

-- Customers can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    ));

-- Customers can view their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    ));

-- Customers can manage their favorites
CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    ));

-- Customers can view their notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    ));

-- Admin/Manager full access policies
CREATE POLICY "Admins and managers have full access to properties" ON properties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins have full access to bookings" ON bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Skyway Suites Database Schema Created Successfully!';
    RAISE NOTICE '📊 Tables: 13 | Views: 2 | Indexes: 40+ | Triggers: 7';
    RAISE NOTICE '🔒 Row Level Security Enabled';
    RAISE NOTICE '🌍 Timezone: Africa/Nairobi (EAT)';
END $$;
```

---

## ✅ Verification Steps

After running the SQL, verify your tables were created:

1. In Supabase Dashboard, click **Table Editor**
2. You should see all 13 tables listed
3. Check that sample data was inserted:
   - 4 categories (Apartment, House, Villa, Studio)
   - 10 features (WiFi, Parking, etc.)

---

## 📝 What's Included

### **13 Tables:**
1. ✅ categories - Property types
2. ✅ features - Amenities/features
3. ✅ customers - User accounts with RBAC
4. ✅ properties - Property listings
5. ✅ property_images - Property photos
6. ✅ property_features - Many-to-many relationship
7. ✅ bookings - Reservations
8. ✅ payments - Payment tracking (M-Pesa, Card)
9. ✅ reviews - Customer reviews & ratings
10. ✅ favorites - User wishlists
11. ✅ notifications - User notifications
12. ✅ system_settings - App configuration (JSONB)
13. ✅ activity_logs - Audit trail

### **2 Views:**
- `properties_full` - Properties with images, features, ratings
- `bookings_full` - Bookings with property & customer details

### **40+ Indexes** for optimal query performance

### **Row Level Security (RLS)** for data protection

### **Auto-updating Timestamps** via triggers

---

## 🎯 Next Steps

Once you've created the tables:

1. ✅ Restart your Figma Make app
2. ✅ Admin user will be automatically added to the new `customers` table
3. ✅ App continues working with KV store (for now)
4. ✅ Ready to migrate data when you're ready

The database helper functions are already created at `/supabase/functions/server/database.tsx` and ready to use!

---

## 📚 Database Structure

```
customers (users + roles)
    ↓
properties ← property_images
    ↓         ↓
    ├── property_features → features
    └── bookings
         ↓
         └── payments

reviews → properties + customers
favorites → properties + customers
notifications → customers
```

---

## 🔐 Security Features

- ✅ UUIDs for all primary keys
- ✅ Foreign key constraints with CASCADE rules
- ✅ Check constraints for data validation
- ✅ Row Level Security (RLS) policies
- ✅ Role-based access control (admin, manager, customer)
- ✅ Public read access for active properties
- ✅ Private data for users (bookings, payments, favorites)

---

## 💡 Benefits of Real Database

✅ **Proper Relationships** - Foreign keys, joins, cascading deletes  
✅ **Query Performance** - Indexes, views, optimized queries  
✅ **Data Integrity** - Constraints, validations, transactions  
✅ **Advanced Queries** - Aggregations, joins, complex filters  
✅ **Real-time Subscriptions** - Supabase Realtime support  
✅ **Scalability** - Handle thousands of records efficiently  
✅ **Backup & Recovery** - Built-in Supabase backups  
✅ **Analytics** - Easy reporting with SQL views  

---

## 🆘 Support

If you encounter any errors while running the SQL:
1. Check the error message in the SQL Editor
2. Make sure you're connected to the correct database
3. Verify you have sufficient permissions
4. Try running the schema in smaller sections if needed

Once the tables are created, the server will automatically detect them and start syncing data!

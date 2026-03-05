-- =============================================
-- Skyway Suites Database Schema
-- Property Management Platform for Kenyan Market
-- Version: 3.0
-- Generated: 2026-03-05
-- =============================================

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS skyway_bookings CASCADE;
DROP TABLE IF EXISTS skyway_properties CASCADE;
DROP TABLE IF EXISTS skyway_activity_logs CASCADE;
DROP TABLE IF EXISTS skyway_customers CASCADE;
DROP TABLE IF EXISTS skyway_auth_user CASCADE;
DROP TABLE IF EXISTS skyway_features CASCADE;
DROP TABLE IF EXISTS skyway_categories CASCADE;
DROP TABLE IF EXISTS skyway_menu_pages CASCADE;
DROP TABLE IF EXISTS skyway_settings CASCADE;

-- =============================================
-- 1. CATEGORIES TABLE
-- Stores property categories (Apartment, Villa, etc.)
-- =============================================
CREATE TABLE skyway_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO skyway_categories (category_name, description, icon) VALUES
('Apartment', 'Modern apartments for rent', 'Building2'),
('Villa', 'Luxury villas with premium amenities', 'Home'),
('Townhouse', 'Spacious townhouses for families', 'Building'),
('Studio', 'Compact studio apartments', 'Warehouse'),
('Penthouse', 'Premium penthouse suites', 'Castle');

-- =============================================
-- 2. FEATURES TABLE
-- Stores property features/amenities
-- =============================================
CREATE TABLE skyway_features (
    feature_id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default features
INSERT INTO skyway_features (feature_name, description, icon) VALUES
('WiFi', 'High-speed internet connection', 'Wifi'),
('Parking', 'Dedicated parking space', 'Car'),
('Pool', 'Swimming pool access', 'Waves'),
('Gym', 'Fitness center', 'Dumbbell'),
('Security', '24/7 security service', 'Shield'),
('Generator', 'Backup power generator', 'Zap'),
('Garden', 'Private or shared garden', 'Trees'),
('Balcony', 'Private balcony', 'Home'),
('Air Conditioning', 'Climate control', 'Wind'),
('Elevator', 'Elevator access', 'ArrowUpDown');

-- =============================================
-- 3. AUTH_USER TABLE
-- Stores authenticated users (Admin, Manager, Customer)
-- =============================================
CREATE TABLE skyway_auth_user (
    user_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL, -- Should be hashed (bcrypt recommended)
    role VARCHAR(20) DEFAULT 'Customer' CHECK (role IN ('Admin', 'Manager', 'Customer')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_auth_user_email ON skyway_auth_user(email);

-- Insert default admin user (password should be hashed in production)
INSERT INTO skyway_auth_user (customer_name, email, phone, password, role) VALUES
('Admin User', 'admin@skywaysuites.com', '+254700000000', 'hashed_password_here', 'Admin');

-- =============================================
-- 4. CUSTOMERS TABLE
-- Stores customer information
-- =============================================
CREATE TABLE skyway_customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    password VARCHAR(255), -- Optional: for customer portal access
    id_number VARCHAR(50), -- Kenya ID or Passport
    profile_photo TEXT, -- URL or base64
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster searches
CREATE INDEX idx_customers_email ON skyway_customers(email);
CREATE INDEX idx_customers_phone ON skyway_customers(phone);
CREATE INDEX idx_customers_name ON skyway_customers(customer_name);

-- =============================================
-- 5. PROPERTIES TABLE
-- Stores property listings
-- =============================================
CREATE TABLE skyway_properties (
    property_id SERIAL PRIMARY KEY,
    property_name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES skyway_categories(category_id) ON DELETE SET NULL,
    location VARCHAR(255) NOT NULL,
    no_of_beds INTEGER NOT NULL CHECK (no_of_beds >= 0),
    bathrooms DECIMAL(3,1) NOT NULL CHECK (bathrooms >= 0), -- Allows 1.5, 2.5, etc.
    area_sqft INTEGER CHECK (area_sqft > 0),
    description TEXT,
    price_per_month DECIMAL(12,2) NOT NULL CHECK (price_per_month >= 0), -- in KES
    security_deposit DECIMAL(12,2), -- in KES
    photos TEXT, -- JSON array of photo URLs
    features TEXT, -- JSON array of feature IDs
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_properties_category ON skyway_properties(category_id);
CREATE INDEX idx_properties_location ON skyway_properties(location);
CREATE INDEX idx_properties_available ON skyway_properties(is_available);
CREATE INDEX idx_properties_price ON skyway_properties(price_per_month);

-- =============================================
-- 6. BOOKINGS TABLE
-- Stores booking/reservation records
-- =============================================
CREATE TABLE skyway_bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES skyway_customers(customer_id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES skyway_properties(property_id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0), -- in KES
    amount_paid DECIMAL(12,2) DEFAULT 0 CHECK (amount_paid >= 0), -- in KES
    payment_status VARCHAR(20) DEFAULT 'Not Paid' CHECK (payment_status IN ('Not Paid', 'Partial Payment', 'Paid in Full')),
    booking_status VARCHAR(20) DEFAULT 'Pending' CHECK (booking_status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    payment_method VARCHAR(50), -- M-Pesa, Bank Transfer, Cash, etc.
    payment_reference VARCHAR(100), -- M-Pesa code, transaction ID, etc.
    notes TEXT,
    created_by INTEGER REFERENCES skyway_auth_user(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint to ensure check-out is after check-in
    CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
    -- Constraint to ensure amount paid doesn't exceed total
    CONSTRAINT check_payment CHECK (amount_paid <= total_amount)
);

-- Create indexes for booking queries
CREATE INDEX idx_bookings_customer ON skyway_bookings(customer_id);
CREATE INDEX idx_bookings_property ON skyway_bookings(property_id);
CREATE INDEX idx_bookings_dates ON skyway_bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON skyway_bookings(booking_status);
CREATE INDEX idx_bookings_payment_status ON skyway_bookings(payment_status);

-- =============================================
-- 7. ACTIVITY LOGS TABLE
-- Tracks all system activities for audit trail
-- =============================================
CREATE TABLE skyway_activity_logs (
    activity_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES skyway_auth_user(user_id) ON DELETE SET NULL,
    user_name VARCHAR(255), -- Denormalized for historical records
    user_role VARCHAR(20),
    activity TEXT NOT NULL,
    activity_type VARCHAR(50), -- 'create', 'update', 'delete', 'login', etc.
    entity_type VARCHAR(50), -- 'property', 'booking', 'customer', etc.
    entity_id INTEGER, -- ID of the affected entity
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for activity log queries
CREATE INDEX idx_activity_user ON skyway_activity_logs(user_id);
CREATE INDEX idx_activity_type ON skyway_activity_logs(activity_type);
CREATE INDEX idx_activity_entity ON skyway_activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_date ON skyway_activity_logs(created_at);

-- =============================================
-- 8. MENU PAGES TABLE
-- Stores custom menu pages for the website
-- =============================================
CREATE TABLE skyway_menu_pages (
    page_id SERIAL PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL UNIQUE,
    page_slug VARCHAR(100) NOT NULL UNIQUE,
    page_title VARCHAR(255),
    page_content TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    parent_page_id INTEGER REFERENCES skyway_menu_pages(page_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default pages
INSERT INTO skyway_menu_pages (page_name, page_slug, page_title, page_content, display_order) VALUES
('Home', 'home', 'Welcome to Skyway Suites', 'Find your perfect home in Kenya', 1),
('About Us', 'about', 'About Skyway Suites', 'Learn more about our company', 2),
('Properties', 'properties', 'Browse Properties', 'Explore our available properties', 3),
('Contact', 'contact', 'Contact Us', 'Get in touch with our team', 4);

-- =============================================
-- 9. SETTINGS TABLE
-- Stores application-wide settings
-- =============================================
CREATE TABLE skyway_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_category VARCHAR(50) NOT NULL, -- 'general', 'homepage', 'user_management', 'sms_integration'
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(setting_category, setting_key)
);

-- Insert default settings
INSERT INTO skyway_settings (setting_category, setting_key, setting_value, setting_type, description) VALUES
-- General Settings
('general', 'company_name', 'Skyway Suites', 'text', 'Company name'),
('general', 'company_email', 'info@skywaysuites.com', 'text', 'Company email'),
('general', 'company_phone', '+254700000000', 'text', 'Company phone number'),
('general', 'company_address', 'Nairobi, Kenya', 'text', 'Company address'),
('general', 'currency', 'KES', 'text', 'Currency code'),
('general', 'currency_symbol', 'KSh', 'text', 'Currency symbol'),
('general', 'whatsapp_number', '+254700000000', 'text', 'WhatsApp business number'),
('general', 'app_version', '3.0', 'text', 'Application version'),

-- Homepage Settings
('homepage', 'hero_title', 'Find Your Dream Home in Kenya', 'text', 'Hero section title'),
('homepage', 'hero_subtitle', 'Discover premium properties across Kenya', 'text', 'Hero section subtitle'),
('homepage', 'featured_properties_count', '6', 'number', 'Number of featured properties to display'),
('homepage', 'show_testimonials', 'true', 'boolean', 'Show testimonials section'),

-- User Management Settings
('user_management', 'allow_registration', 'true', 'boolean', 'Allow new user registration'),
('user_management', 'require_email_verification', 'false', 'boolean', 'Require email verification'),
('user_management', 'session_timeout', '3600', 'number', 'Session timeout in seconds'),

-- SMS Integration Settings
('sms_integration', 'provider', 'Africa\'s Talking', 'text', 'SMS provider name'),
('sms_integration', 'api_key', '', 'text', 'SMS API key'),
('sms_integration', 'sender_id', 'SKYWAY', 'text', 'SMS sender ID'),
('sms_integration', 'booking_confirmation_enabled', 'true', 'boolean', 'Send SMS on booking confirmation'),
('sms_integration', 'payment_confirmation_enabled', 'true', 'boolean', 'Send SMS on payment received');

-- =============================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =============================================

-- View: Property listings with category information
CREATE VIEW vw_property_listings AS
SELECT 
    p.property_id,
    p.property_name,
    p.location,
    p.no_of_beds,
    p.bathrooms,
    p.area_sqft,
    p.price_per_month,
    p.is_available,
    p.is_featured,
    c.category_name,
    p.photos,
    p.features,
    p.created_at
FROM skyway_properties p
LEFT JOIN skyway_categories c ON p.category_id = c.category_id;

-- View: Booking details with customer and property information
CREATE VIEW vw_booking_details AS
SELECT 
    b.booking_id,
    b.check_in_date,
    b.check_out_date,
    b.total_amount,
    b.amount_paid,
    b.payment_status,
    b.booking_status,
    b.payment_method,
    c.customer_name,
    c.phone AS customer_phone,
    c.email AS customer_email,
    p.property_name,
    p.location AS property_location,
    cat.category_name,
    b.created_at
FROM skyway_bookings b
INNER JOIN skyway_customers c ON b.customer_id = c.customer_id
INNER JOIN skyway_properties p ON b.property_id = p.property_id
LEFT JOIN skyway_categories cat ON p.category_id = cat.category_id;

-- View: Dashboard statistics
CREATE VIEW vw_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM skyway_properties WHERE is_available = TRUE) AS available_properties,
    (SELECT COUNT(*) FROM skyway_properties) AS total_properties,
    (SELECT COUNT(*) FROM skyway_bookings WHERE booking_status = 'Confirmed') AS active_bookings,
    (SELECT COUNT(*) FROM skyway_bookings) AS total_bookings,
    (SELECT COUNT(*) FROM skyway_customers WHERE is_active = TRUE) AS active_customers,
    (SELECT COUNT(*) FROM skyway_customers) AS total_customers,
    (SELECT COALESCE(SUM(amount_paid), 0) FROM skyway_bookings WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)) AS monthly_revenue;

-- =============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON skyway_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON skyway_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auth_user_updated_at BEFORE UPDATE ON skyway_auth_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON skyway_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON skyway_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON skyway_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_pages_updated_at BEFORE UPDATE ON skyway_menu_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON skyway_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-update payment status based on amount paid
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount_paid >= NEW.total_amount THEN
        NEW.payment_status := 'Paid in Full';
        -- Auto-confirm booking when fully paid
        IF NEW.booking_status = 'Pending' THEN
            NEW.booking_status := 'Confirmed';
        END IF;
    ELSIF NEW.amount_paid > 0 AND NEW.amount_paid < NEW.total_amount THEN
        NEW.payment_status := 'Partial Payment';
    ELSE
        NEW.payment_status := 'Not Paid';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_payment_status 
BEFORE INSERT OR UPDATE ON skyway_bookings
FOR EACH ROW EXECUTE FUNCTION update_payment_status();

-- Function: Prevent double booking
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for overlapping bookings for the same property
    IF EXISTS (
        SELECT 1 FROM skyway_bookings
        WHERE property_id = NEW.property_id
        AND booking_status IN ('Confirmed', 'Pending')
        AND booking_id != COALESCE(NEW.booking_id, 0)
        AND (
            (NEW.check_in_date >= check_in_date AND NEW.check_in_date < check_out_date)
            OR (NEW.check_out_date > check_in_date AND NEW.check_out_date <= check_out_date)
            OR (NEW.check_in_date <= check_in_date AND NEW.check_out_date >= check_out_date)
        )
    ) THEN
        RAISE EXCEPTION 'Double booking detected: Property is already booked for overlapping dates';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_double_booking 
BEFORE INSERT OR UPDATE ON skyway_bookings
FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();

-- =============================================
-- GRANT PERMISSIONS (adjust based on your roles)
-- =============================================

-- Example: Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO skyway_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO skyway_app_user;
-- GRANT SELECT ON ALL VIEWS IN SCHEMA public TO skyway_app_user;

-- =============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =============================================

-- Sample Customers
INSERT INTO skyway_customers (customer_name, phone, email, address, id_number) VALUES
('John Kamau', '+254712345678', 'john.kamau@email.com', 'Westlands, Nairobi', '12345678'),
('Mary Wanjiku', '+254723456789', 'mary.wanjiku@email.com', 'Karen, Nairobi', '23456789'),
('David Ochieng', '+254734567890', 'david.ochieng@email.com', 'Kilimani, Nairobi', '34567890');

-- Sample Properties
INSERT INTO skyway_properties (property_name, category_id, location, no_of_beds, bathrooms, area_sqft, description, price_per_month, security_deposit, photos, features, is_available, is_featured) VALUES
('Sunset Apartment', 1, 'Westlands, Nairobi', 2, 2, 1200, 'Modern 2-bedroom apartment with stunning city views', 85000.00, 85000.00, '[]', '[1,2,3,4,5]', TRUE, TRUE),
('Garden Villa', 2, 'Karen, Nairobi', 4, 3.5, 3500, 'Luxury villa with private garden and pool', 250000.00, 250000.00, '[]', '[1,2,3,4,5,6,7,8,9]', TRUE, TRUE),
('City Studio', 4, 'CBD, Nairobi', 1, 1, 450, 'Compact studio in the heart of the city', 45000.00, 45000.00, '[]', '[1,5,10]', TRUE, FALSE);

-- =============================================
-- DATABASE SCHEMA CREATION COMPLETE
-- =============================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Skyway Suites Database Schema Created Successfully';
    RAISE NOTICE 'Version: 3.0';
    RAISE NOTICE 'Tables Created: 9';
    RAISE NOTICE 'Views Created: 3';
    RAISE NOTICE 'Triggers Created: 10';
    RAISE NOTICE '==============================================';
END $$;

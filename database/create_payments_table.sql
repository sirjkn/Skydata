-- =============================================
-- PAYMENTS TABLE (Missing from original schema)
-- Stores payment records for bookings
-- =============================================
CREATE TABLE IF NOT EXISTS skyway_payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES skyway_bookings(booking_id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES skyway_customers(customer_id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES skyway_properties(property_id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    paid_amount DECIMAL(12,2) NOT NULL CHECK (paid_amount > 0), -- in KES
    payment_method VARCHAR(50) NOT NULL, -- M-Pesa, Bank Transfer, Cash, etc.
    payment_reference VARCHAR(100), -- M-Pesa code, transaction ID, receipt number, etc.
    mpesa_code VARCHAR(50), -- Specific M-Pesa transaction code
    receipt_number VARCHAR(50), -- Internal receipt number
    notes TEXT,
    recorded_by INTEGER REFERENCES skyway_auth_user(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_payments_booking ON skyway_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON skyway_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_property ON skyway_payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON skyway_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_method ON skyway_payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON skyway_payments(payment_reference);

-- Add comment to table
COMMENT ON TABLE skyway_payments IS 'Stores all payment transactions for property bookings';

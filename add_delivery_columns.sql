-- Add delivery-specific columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_driver_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_driver_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_driver_username TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lat DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lng DOUBLE PRECISION;

-- Update existing pickup orders
UPDATE orders SET order_type = 'pickup' WHERE order_type IS NULL;

-- Add index for faster driver lookups
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(assigned_driver_id) WHERE assigned_driver_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);

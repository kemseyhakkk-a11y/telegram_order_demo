-- ============================================
-- Restaurant Digital Menu - Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Menu Categories
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🍽️',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_emoji TEXT NOT NULL DEFAULT '🍽️',
    image_url TEXT,
    available BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_note TEXT,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','delivering','completed','cancelled')),
    telegram_user_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items (line items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Status Logs (for audit trail)
CREATE TABLE order_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(available);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_status_logs_order ON order_status_logs(order_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;

-- Public can read menu
CREATE POLICY "Anyone can view categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view available items" ON menu_items FOR SELECT USING (available = true);

-- Public can create orders
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create status logs" ON order_status_logs FOR INSERT WITH CHECK (true);

-- Admin full access (using service_role / admin user)
CREATE POLICY "Admin full access categories" ON menu_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access order items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access status logs" ON order_status_logs FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- VIEWS & REPORTS
-- ============================================

-- Daily Sales Report
CREATE VIEW daily_sales_report AS
SELECT
    DATE(created_at) AS order_date,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders
FROM orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Popular Items Report
CREATE VIEW popular_items_report AS
SELECT
    oi.menu_item_id,
    oi.item_name,
    SUM(oi.quantity) AS total_ordered,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS unique_orders
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
GROUP BY oi.menu_item_id, oi.item_name
ORDER BY total_ordered DESC;

-- Order Status Summary
CREATE VIEW order_status_summary AS
SELECT
    status,
    COUNT(*) AS count,
    SUM(total_amount) AS total_value
FROM orders
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY status
ORDER BY count DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_categories_modtime
    BEFORE UPDATE ON menu_categories
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_menu_items_modtime
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Auto-log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO order_status_logs (order_id, status)
        VALUES (NEW.id, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_change_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- SEED DATA
-- ============================================

-- Categories
INSERT INTO menu_categories (name, icon, display_order) VALUES
    ('Appetizers', '🥗', 1),
    ('Main Dishes', '🍖', 2),
    ('Pizza', '🍕', 3),
    ('Drinks', '🥤', 4),
    ('Desserts', '🍰', 5);

DO $$
DECLARE
    appetizers_id UUID;
    mains_id UUID;
    pizza_id UUID;
    drinks_id UUID;
    desserts_id UUID;
BEGIN
    SELECT id INTO appetizers_id FROM menu_categories WHERE name = 'Appetizers' LIMIT 1;
    SELECT id INTO mains_id FROM menu_categories WHERE name = 'Main Dishes' LIMIT 1;
    SELECT id INTO pizza_id FROM menu_categories WHERE name = 'Pizza' LIMIT 1;
    SELECT id INTO drinks_id FROM menu_categories WHERE name = 'Drinks' LIMIT 1;
    SELECT id INTO desserts_id FROM menu_categories WHERE name = 'Desserts' LIMIT 1;

    -- Appetizers
    INSERT INTO menu_items (category_id, name, description, price, image_emoji, display_order) VALUES
        (appetizers_id, 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 8.99, '🥗', 1),
        (appetizers_id, 'Garlic Bread', 'Toasted bread with garlic butter', 4.99, '🥖', 2),
        (appetizers_id, 'Bruschetta', 'Grilled bread with tomatoes and basil', 6.99, '🍅', 3);

    -- Main Dishes
    INSERT INTO menu_items (category_id, name, description, price, image_emoji, display_order) VALUES
        (mains_id, 'Grilled Chicken', 'Served with vegetables and rice', 14.99, '🍗', 1),
        (mains_id, 'Beef Steak', 'Premium beef with mashed potatoes', 24.99, '🥩', 2),
        (mains_id, 'Salmon Fillet', 'Grilled salmon with asparagus', 19.99, '🐟', 3),
        (mains_id, 'Pasta Carbonara', 'Classic Italian pasta with bacon', 12.99, '🍝', 4);

    -- Pizza
    INSERT INTO menu_items (category_id, name, description, price, image_emoji, display_order) VALUES
        (pizza_id, 'Margherita', 'Tomato, mozzarella, basil', 11.99, '🍕', 1),
        (pizza_id, 'Pepperoni', 'Classic pepperoni pizza', 13.99, '🍕', 2),
        (pizza_id, 'Four Cheese', 'Mozzarella, gorgonzola, parmesan', 14.99, '🧀', 3);

    -- Drinks
    INSERT INTO menu_items (category_id, name, description, price, image_emoji, display_order) VALUES
        (drinks_id, 'Cola', '330ml can', 2.49, '🥤', 1),
        (drinks_id, 'Lemonade', 'Fresh homemade lemonade', 3.49, '🍋', 2),
        (drinks_id, 'Coffee', 'Americano or espresso', 3.99, '☕', 3);

    -- Desserts
    INSERT INTO menu_items (category_id, name, description, price, image_emoji, display_order) VALUES
        (desserts_id, 'Tiramisu', 'Classic Italian dessert', 7.99, '🍰', 1),
        (desserts_id, 'Cheesecake', 'Creamy New York style', 6.99, '🍰', 2),
        (desserts_id, 'Ice Cream', 'Vanilla, chocolate, strawberry', 4.99, '🍨', 3);

END $$;

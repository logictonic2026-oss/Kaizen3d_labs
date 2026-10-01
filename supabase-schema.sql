-- ==========================================
-- KAIZEN 3D LABS - COMPLETE SUPABASE SCHEMA
-- Run this ONCE in Supabase SQL Editor
-- ==========================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  subtitle        text,
  description     text,
  price           numeric(10, 2) NOT NULL DEFAULT 0.00,
  original_price  numeric(10, 2) DEFAULT NULL,   -- MRP (crossed-out price for discounts)
  discount_label  text DEFAULT NULL,              -- e.g. '20% OFF' or 'DIWALI OFFER'
  images          jsonb DEFAULT '[]'::jsonb,
  image_labels    jsonb DEFAULT '[]'::jsonb,
  tag             text,
  category        text DEFAULT 'divine-idols',   -- 'car-dashboard-idol' | 'divine-idols' | 'gifting-elements' | 'custom-products'
  is_active       boolean DEFAULT true,
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 2. Create Orders Table
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name    text NOT NULL,
  customer_email   text NOT NULL,
  customer_phone   text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city    text NOT NULL,
  shipping_state   text NOT NULL,
  shipping_zip     text NOT NULL,
  shipping_country text NOT NULL,
  payment_method   text NOT NULL,
  promo_code       text,
  discount_amount  numeric(10, 2) DEFAULT 0.00,
  subtotal         numeric(10, 2) NOT NULL,
  total            numeric(10, 2) NOT NULL,
  status           text DEFAULT 'pending',       -- 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at       timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 3. Create Order Items Table
-- ==========================================
CREATE TABLE IF NOT EXISTS order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id        uuid REFERENCES products(id),
  product_name      text NOT NULL,
  price_at_purchase numeric(10, 2) NOT NULL,
  quantity          integer NOT NULL CHECK (quantity > 0),
  image_url         text
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can READ active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Products: Authenticated admin can view ALL (including hidden)
CREATE POLICY "Admin can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Products: Admin can INSERT new products
CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Products: Admin can UPDATE products (price, images, visibility, discounts)
CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products: Admin can DELETE products
CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Orders: Anyone can place an order (from checkout)
CREATE POLICY "Anyone can create an order"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Orders: Anyone can view orders (for order tracking page)
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

-- Orders: Admin can update order status
CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

-- Order Items: Anyone can insert (when checking out)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Order Items: Anyone can view
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);

-- ==========================================
-- INITIAL SEED DATA — 3 Products
-- ==========================================
INSERT INTO products (slug, name, subtitle, description, price, images, image_labels, tag, category)
VALUES
(
  'venkateshwara',
  'Lord Venkateshwara',
  'Car Dashboard Idol',
  'A beautifully crafted Lord Venkateshwara idol, designed to sit elegantly on your car dashboard. Made with premium PLA filament with a fine detail finish.',
  999.00,
  '["/product-venkateshwara-1.jpg", "/product-venkateshwara-2.jpg"]'::jsonb,
  '["Product", "In Application"]'::jsonb,
  'Dashboard Idol',
  'car-dashboard-idol'
),
(
  'ganesha',
  'Lord Ganesha',
  'Car Dashboard Idol',
  'An intricately printed Lord Ganesha idol — the remover of obstacles — crafted for your car dashboard. A perfect daily blessing on every journey.',
  999.00,
  '["/product-ganesha-1.jpg", "/product-ganesha-2.jpg"]'::jsonb,
  '["Product", "In Application"]'::jsonb,
  'Dashboard Idol',
  'car-dashboard-idol'
),
(
  'kumkum',
  'Kumkum Gopuram',
  'Gift Your Loved One',
  'A traditional Kumkum Gopuram, elegantly designed and 3D printed as a unique and meaningful gift for festivals and special occasions.',
  499.00,
  '["/product-kumkum-1.jpg", "/product-kumkum-2.jpg"]'::jsonb,
  '["Product", "In Use"]'::jsonb,
  'Gift Item',
  'gifting-elements'
)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 4. Create Design Enquiries Table
-- ==========================================
CREATE TABLE IF NOT EXISTS design_enquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type    text NOT NULL, -- '3D Model Generation' | 'Design Enquiry'
  company_name    text,
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  address         text,
  city            text,
  pincode         text,
  country         text,
  description     text,
  images          jsonb DEFAULT '[]'::jsonb,
  status          text DEFAULT 'pending', -- 'pending' | 'reviewed' | 'resolved'
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE design_enquiries ENABLE ROW LEVEL SECURITY;

-- Design Enquiries: Anyone can insert
CREATE POLICY "Anyone can create design enquiries"
  ON design_enquiries FOR INSERT
  WITH CHECK (true);

-- Design Enquiries: Admin can view all
CREATE POLICY "Admin can view design enquiries"
  ON design_enquiries FOR SELECT
  TO authenticated
  USING (true);

-- Design Enquiries: Admin can update status
CREATE POLICY "Admin can update design enquiries"
  ON design_enquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

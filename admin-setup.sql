-- ==========================================
-- KAIZEN 3D LABS — ADMIN PANEL SETUP SQL
-- Run this ONCE in Supabase SQL Editor
-- ==========================================

-- ── Step 1: Add category + discount columns ──────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS category       text    DEFAULT 'divine-idols';
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price  decimal DEFAULT NULL;  -- MRP (crossed out)
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_label  text    DEFAULT NULL;  -- e.g. '20% OFF'

-- Update existing products with correct categories
UPDATE products SET category = 'car-dashboard-idol' WHERE slug IN ('venkateshwara', 'ganesha');
UPDATE products SET category = 'gifting-elements'   WHERE slug IN ('kumkum');


-- ── Step 2: Tighten RLS — only authenticated admin can write products ─────────

-- Allow admin to insert new products
CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admin to update products (price, images, visibility, etc.)
CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow admin to delete products
CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);


-- ── Step 3: Storage policies for product-images bucket ───────────────────────
-- (Run AFTER creating the bucket in Supabase Storage dashboard)

-- Anyone can view product images (needed for the public shop)
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Only authenticated admin can upload images
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Only authenticated admin can delete images
CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Only authenticated admin can update/replace images
CREATE POLICY "Admin can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');


-- ── VERIFICATION QUERIES (run these to confirm everything is set up) ──────────
-- SELECT * FROM products LIMIT 5;
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'products';

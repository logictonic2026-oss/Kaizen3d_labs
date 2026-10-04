-- ==========================================
-- KAIZEN 3D LABS — RAZORPAY INTEGRATION SETUP
-- Run this ONCE in Supabase SQL Editor (after supabase-schema.sql)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS
-- ==========================================

-- ── 1. Payment columns on orders ────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method     text DEFAULT 'standard';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost       numeric(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS alt_phone           text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name        text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst_number          text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status      text DEFAULT 'unpaid';  -- 'unpaid' | 'created' | 'paid' | 'failed' | 'refunded'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at             timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_id_key ON orders (razorpay_order_id);

-- ── 2. Promo codes table (used by checkout; created only if missing) ────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text UNIQUE NOT NULL,
  discount_type    text NOT NULL DEFAULT 'percentage',  -- 'percentage' | 'fixed'
  discount_value   numeric(10, 2) NOT NULL,
  min_order_amount numeric(10, 2),
  expires_at       timestamp with time zone,
  is_active        boolean DEFAULT true,
  uses_count       integer DEFAULT 0,
  max_uses         integer,
  created_at       timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS uses_count integer DEFAULT 0;
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS max_uses   integer;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active promo codes" ON promo_codes;
CREATE POLICY "Public can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage promo codes" ON promo_codes;
CREATE POLICY "Admin can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Atomic usage counter, called by the Edge Function (service role) after a successful payment
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE promo_codes SET uses_count = COALESCE(uses_count, 0) + 1 WHERE code = promo_code;
$$;
REVOKE ALL ON FUNCTION increment_promo_usage(text) FROM PUBLIC, anon, authenticated;

-- ── 3. Tighten RLS so browsers cannot fake a paid Razorpay order ────────────
-- Razorpay orders are created ONLY by the Edge Function (service role bypasses RLS).
-- Anonymous inserts are restricted to manual methods (UPI / bank transfer) and can never
-- set payment fields.
DROP POLICY IF EXISTS "Anyone can create an order" ON orders;
CREATE POLICY "Anyone can create an order"
  ON orders FOR INSERT
  WITH CHECK (
    payment_method <> 'razorpay'
    AND COALESCE(payment_status, 'unpaid') = 'unpaid'
    AND razorpay_order_id   IS NULL
    AND razorpay_payment_id IS NULL
    AND razorpay_signature  IS NULL
    AND paid_at             IS NULL
  );

DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.payment_method <> 'razorpay'
    )
  );

-- ── VERIFICATION ────────────────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('orders','order_items','promo_codes');

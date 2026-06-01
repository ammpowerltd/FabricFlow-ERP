-- =====================================================
-- FABRICFLOW ERP - SUPABASE DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor to create tables.
-- =====================================================

-- 1. App Masters Table (Generic storage for all Master Data types)
-- Types: 'party', 'item', 'category', 'unit', 'tax', 'courier', 'aggregator', 'platform', 'payment', 'bank', 'bom', 'expense', 'docnum'
CREATE TABLE IF NOT EXISTS app_masters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_masters_type ON app_masters(type);
CREATE INDEX IF NOT EXISTS idx_app_masters_data_gin ON app_masters USING gin(data);

-- 2. D2C E-Commerce Orders Table
CREATE TABLE IF NOT EXISTS d2c_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text UNIQUE NOT NULL,
  order_date date NOT NULL,
  customer_name text NOT NULL,
  mobile_number text NOT NULL,
  address text,
  payment_type text CHECK (payment_type IN ('Prepaid', 'COD')) DEFAULT 'Prepaid',
  courier_aggregator text,
  courier_company text,
  awb_number text,
  sku text NOT NULL,
  product_name text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  rate decimal NOT NULL DEFAULT 0,
  total_amount decimal NOT NULL DEFAULT 0,
  status text CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
  dispatch_date date,
  delivery_date date,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_d2c_orders_order_id ON d2c_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_d2c_orders_status ON d2c_orders(status);
CREATE INDEX IF NOT EXISTS idx_d2c_orders_customer ON d2c_orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_d2c_orders_sku ON d2c_orders(sku);

-- 3. Job Works Table (Production)
CREATE TABLE IF NOT EXISTS job_works (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_work_no text UNIQUE NOT NULL,
  date date NOT NULL,
  contractor_id text,
  contractor_name text NOT NULL,
  priority text CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium',
  expected_return_date date NOT NULL,
  status text CHECK (status IN ('Draft', 'In Process', 'Completed', 'Overdue', 'Cancelled')) DEFAULT 'Draft',
  raw_materials jsonb DEFAULT '[]'::jsonb,
  expected_outputs jsonb DEFAULT '[]'::jsonb,
  remarks text,
  created_at timestamptz DEFAULT now(),
  total_accepted int DEFAULT 0,
  total_rejected int DEFAULT 0,
  total_received int DEFAULT 0,
  pending_qty int DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_job_works_no ON job_works(job_work_no);
CREATE INDEX IF NOT EXISTS idx_job_works_status ON job_works(status);
CREATE INDEX IF NOT EXISTS idx_job_works_contractor ON job_works(contractor_name);

-- 4. Material In Table (Production Receipt)
CREATE TABLE IF NOT EXISTS material_ins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  material_in_no text UNIQUE NOT NULL,
  date date NOT NULL,
  job_work_id uuid REFERENCES job_works(id) ON DELETE CASCADE,
  job_work_no text NOT NULL,
  contractor_name text NOT NULL,
  status text CHECK (status IN ('Pending', 'Partial Received', 'Completed', 'QC Hold')) DEFAULT 'Pending',
  items jsonb DEFAULT '[]'::jsonb,
  remarks text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_material_ins_no ON material_ins(material_in_no);
CREATE INDEX IF NOT EXISTS idx_material_ins_job_work_id ON material_ins(job_work_id);

-- 5. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid, -- Links to app_masters where type='item'
  item_code text,
  sku text UNIQUE,
  current_stock int DEFAULT 0,
  reserved_stock int DEFAULT 0,
  available_stock int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_item_id ON inventory(item_id);

-- 6. Users Table (for simple user management if not using Supabase Auth directly for app logic)
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling RLS and creating permissive policies for anon role to ensure app works smoothly.
-- In production, restrict these to authenticated users.
-- =====================================================

ALTER TABLE app_masters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to app_masters" ON app_masters FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE d2c_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to d2c_orders" ON d2c_orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE job_works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to job_works" ON job_works FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE material_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to material_ins" ON material_ins FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to users" ON users FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS (Optional but helpful)
-- Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_masters_updated_at BEFORE UPDATE ON app_masters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

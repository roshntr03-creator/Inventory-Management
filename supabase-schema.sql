-- Inventory Management System Database Schema
-- Run this in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update suppliers" ON suppliers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete suppliers" ON suppliers FOR DELETE TO authenticated USING (true);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete customers" ON customers FOR DELETE TO authenticated USING (true);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('warehouse', 'aisle', 'rack', 'bin')),
  parent_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  capacity integer,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view locations" ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create locations" ON locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update locations" ON locations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete locations" ON locations FOR DELETE TO authenticated USING (true);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'pcs',
  min_stock_threshold integer DEFAULT 0,
  barcode text,
  category text,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  reorder_point integer DEFAULT 0,
  reorder_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view items" ON items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create items" ON items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update items" ON items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete items" ON items FOR DELETE TO authenticated USING (true);

-- Create stock_lots table
CREATE TABLE IF NOT EXISTS stock_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  lot_number text NOT NULL,
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 0,
  unit_cost numeric(10,2) NOT NULL DEFAULT 0,
  expiry_date date,
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT quantity_non_negative CHECK (quantity >= 0)
);

ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock lots" ON stock_lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create stock lots" ON stock_lots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update stock lots" ON stock_lots FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete stock lots" ON stock_lots FOR DELETE TO authenticated USING (true);

-- Create movements table
CREATE TABLE IF NOT EXISTS movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  lot_id uuid REFERENCES stock_lots(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('in', 'out', 'transfer', 'adjust')),
  quantity integer NOT NULL,
  from_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  to_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  unit_cost numeric(10,2) NOT NULL DEFAULT 0,
  reason text,
  reference_number text,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view movements" ON movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create movements" ON movements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update movements" ON movements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete movements" ON movements FOR DELETE TO authenticated USING (true);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('low_stock', 'expiry_warning', 'negative_balance')),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES stock_lots(id) ON DELETE CASCADE,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved')),
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alerts" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create alerts" ON alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alerts" ON alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete alerts" ON alerts FOR DELETE TO authenticated USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode);
CREATE INDEX IF NOT EXISTS idx_stock_lots_item_id ON stock_lots(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_location_id ON stock_lots(location_id);
CREATE INDEX IF NOT EXISTS idx_movements_item_id ON movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_item_id ON alerts(item_id);

/*
  # Inventory Management System Schema

  ## Overview
  Complete schema for inventory management with QR codes, stock tracking, 
  movements, locations, and lead capture.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, references auth.users) - User profile linked to auth
  - `email` (text) - User email
  - `full_name` (text) - User full name
  - `role` (text) - User role: 'admin' or 'staff'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. suppliers
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Supplier name
  - `contact_name` (text) - Contact person
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `address` (text) - Supplier address
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. customers
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Customer name
  - `contact_name` (text) - Contact person
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `address` (text) - Customer address
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. locations
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Location name (e.g., "A-1-2")
  - `type` (text) - Type: 'warehouse', 'aisle', 'rack', 'bin'
  - `parent_id` (uuid) - Parent location for hierarchy
  - `capacity` (integer) - Maximum capacity
  - `description` (text) - Location description
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. items
  - `id` (uuid, primary key) - Unique identifier
  - `sku` (text, unique) - Stock keeping unit
  - `name` (text) - Item name
  - `description` (text) - Item description
  - `unit` (text) - Unit of measure (e.g., 'pcs', 'kg', 'box')
  - `min_stock_threshold` (integer) - Minimum stock alert level
  - `barcode` (text) - Barcode/QR code identifier
  - `category` (text) - Item category
  - `supplier_id` (uuid) - Default supplier
  - `reorder_point` (integer) - Reorder point quantity
  - `reorder_quantity` (integer) - Standard reorder quantity
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. stock_lots
  - `id` (uuid, primary key) - Unique identifier
  - `item_id` (uuid, references items) - Associated item
  - `lot_number` (text) - Lot/batch number
  - `location_id` (uuid, references locations) - Storage location
  - `quantity` (integer) - Current quantity in this lot
  - `unit_cost` (decimal) - Cost per unit
  - `expiry_date` (date) - Optional expiry date
  - `received_date` (date) - Date received
  - `supplier_id` (uuid) - Supplier for this lot
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. movements
  - `id` (uuid, primary key) - Unique identifier
  - `item_id` (uuid, references items) - Associated item
  - `lot_id` (uuid, references stock_lots) - Associated lot
  - `type` (text) - Movement type: 'in', 'out', 'transfer', 'adjust'
  - `quantity` (integer) - Quantity moved
  - `from_location_id` (uuid) - Source location (for transfers)
  - `to_location_id` (uuid) - Destination location
  - `unit_cost` (decimal) - Cost per unit at time of movement
  - `reason` (text) - Reason for movement
  - `reference_number` (text) - PO/SO/Transfer reference
  - `customer_id` (uuid) - Customer for outbound movements
  - `supplier_id` (uuid) - Supplier for inbound movements
  - `user_id` (uuid, references profiles) - User who performed movement
  - `created_at` (timestamptz) - Movement timestamp
  - `notes` (text) - Additional notes

  ### 8. alerts
  - `id` (uuid, primary key) - Unique identifier
  - `type` (text) - Alert type: 'low_stock', 'expiry_warning', 'negative_balance'
  - `item_id` (uuid, references items) - Associated item
  - `lot_id` (uuid) - Associated lot (for expiry alerts)
  - `message` (text) - Alert message
  - `severity` (text) - Severity: 'low', 'medium', 'high'
  - `status` (text) - Status: 'active', 'dismissed', 'resolved'
  - `resolved_by` (uuid) - User who resolved
  - `resolved_at` (timestamptz) - Resolution timestamp
  - `created_at` (timestamptz) - Alert creation timestamp

  ### 9. leads
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Lead name
  - `email` (text) - Lead email
  - `company` (text) - Company name
  - `phone` (text) - Phone number
  - `message` (text) - Optional message
  - `status` (text) - Lead status: 'new', 'contacted', 'qualified', 'converted'
  - `created_at` (timestamptz) - Submission timestamp

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users based on roles
  - Public access only for lead submission
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage suppliers"
  ON suppliers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'bin' CHECK (type IN ('warehouse', 'aisle', 'rack', 'bin')),
  parent_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  capacity integer,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage locations"
  ON locations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'pcs',
  min_stock_threshold integer DEFAULT 10,
  barcode text,
  category text,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  reorder_point integer DEFAULT 0,
  reorder_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage items"
  ON items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Stock lots table
CREATE TABLE IF NOT EXISTS stock_lots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  lot_number text NOT NULL,
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 0,
  unit_cost numeric(10,2) DEFAULT 0,
  expiry_date date,
  received_date date DEFAULT CURRENT_DATE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock_lots"
  ON stock_lots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage stock_lots"
  ON stock_lots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Movements table
CREATE TABLE IF NOT EXISTS movements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES stock_lots(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('in', 'out', 'transfer', 'adjust')),
  quantity integer NOT NULL,
  from_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  to_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  unit_cost numeric(10,2) DEFAULT 0,
  reason text,
  reference_number text,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view movements"
  ON movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create movements"
  ON movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE POLICY "Authenticated users can view alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage alerts"
  ON alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Leads table (public submissions)
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit leads"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_stock_lots_item_id ON stock_lots(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_lots_location_id ON stock_lots(location_id);
CREATE INDEX IF NOT EXISTS idx_movements_item_id ON movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_item_id ON alerts(item_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_lots_updated_at BEFORE UPDATE ON stock_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

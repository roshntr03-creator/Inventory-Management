import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('🌱 Seeding database...');

  const demoEmail = 'admin@demo.com';
  const demoPassword = 'demo123456';

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: demoEmail,
    password: demoPassword,
  });

  if (authError && !authError.message.includes('already registered')) {
    console.error('Auth error:', authError);
    return;
  }

  const userId = authData?.user?.id;

  if (userId) {
    await supabase.from('profiles').upsert({
      id: userId,
      email: demoEmail,
      full_name: 'Demo Admin',
      role: 'admin',
    });
    console.log('✅ Demo user created:', demoEmail, '/', demoPassword);
  }

  const { data: suppliers } = await supabase
    .from('suppliers')
    .upsert([
      { name: 'Acme Corp', email: 'sales@acme.com', phone: '555-0100' },
      { name: 'Global Supplies', email: 'info@global.com', phone: '555-0200' },
    ])
    .select();

  console.log('✅ Suppliers created');

  const { data: customers } = await supabase
    .from('customers')
    .upsert([
      { name: 'Tech Store', email: 'orders@techstore.com', phone: '555-1000' },
      { name: 'Retail Chain', email: 'purchasing@retail.com', phone: '555-2000' },
    ])
    .select();

  console.log('✅ Customers created');

  const { data: locations } = await supabase
    .from('locations')
    .upsert([
      { name: 'Warehouse A', type: 'warehouse', description: 'Main warehouse' },
      { name: 'A-1', type: 'aisle', description: 'Aisle 1 in Warehouse A' },
      { name: 'A-1-1', type: 'rack', description: 'Rack 1 in Aisle 1' },
      { name: 'A-1-1-A', type: 'bin', description: 'Bin A' },
      { name: 'A-1-1-B', type: 'bin', description: 'Bin B' },
      { name: 'A-2-1-A', type: 'bin', description: 'Bin A in Rack 1, Aisle 2' },
    ])
    .select();

  console.log('✅ Locations created');

  const { data: items } = await supabase
    .from('items')
    .upsert([
      {
        sku: 'WIDGET-001',
        name: 'Blue Widget',
        description: 'High-quality blue widget',
        unit: 'pcs',
        min_stock_threshold: 50,
        category: 'Widgets',
        supplier_id: suppliers?.[0]?.id,
        reorder_point: 50,
        reorder_quantity: 200,
      },
      {
        sku: 'GADGET-002',
        name: 'Red Gadget',
        description: 'Premium red gadget',
        unit: 'pcs',
        min_stock_threshold: 30,
        category: 'Gadgets',
        supplier_id: suppliers?.[1]?.id,
        reorder_point: 30,
        reorder_quantity: 100,
      },
      {
        sku: 'CABLE-USB-C',
        name: 'USB-C Cable',
        description: '1m USB-C cable',
        unit: 'pcs',
        min_stock_threshold: 100,
        category: 'Cables',
        reorder_point: 100,
        reorder_quantity: 500,
      },
    ])
    .select();

  console.log('✅ Items created');

  if (items && locations) {
    const { data: lots } = await supabase
      .from('stock_lots')
      .upsert([
        {
          item_id: items[0].id,
          lot_number: 'LOT-001',
          location_id: locations[3].id,
          quantity: 150,
          unit_cost: 5.99,
          supplier_id: suppliers?.[0]?.id,
        },
        {
          item_id: items[1].id,
          lot_number: 'LOT-002',
          location_id: locations[4].id,
          quantity: 75,
          unit_cost: 12.50,
          supplier_id: suppliers?.[1]?.id,
        },
        {
          item_id: items[2].id,
          lot_number: 'LOT-003',
          location_id: locations[5].id,
          quantity: 200,
          unit_cost: 2.99,
        },
      ])
      .select();

    console.log('✅ Stock lots created');

    if (lots && userId) {
      await supabase.from('movements').insert([
        {
          item_id: items[0].id,
          lot_id: lots[0].id,
          type: 'in',
          quantity: 150,
          to_location_id: locations[3].id,
          unit_cost: 5.99,
          user_id: userId,
          reason: 'Initial stock',
        },
        {
          item_id: items[1].id,
          lot_id: lots[1].id,
          type: 'in',
          quantity: 75,
          to_location_id: locations[4].id,
          unit_cost: 12.50,
          user_id: userId,
          reason: 'Initial stock',
        },
      ]);

      console.log('✅ Movements created');
    }

    await supabase.from('alerts').insert([
      {
        type: 'low_stock',
        item_id: items[1].id,
        message: `${items[1].name} is below minimum stock threshold`,
        severity: 'medium',
        status: 'active',
      },
    ]);

    console.log('✅ Alerts created');
  }

  console.log('🎉 Seeding complete!');
  console.log('📧 Login with:', demoEmail, '/', demoPassword);
}

seed().catch(console.error);

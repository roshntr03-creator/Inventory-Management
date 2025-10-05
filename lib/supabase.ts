import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'staff';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'staff';
        };
      };
      items: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string | null;
          unit: string;
          min_stock_threshold: number;
          barcode: string | null;
          category: string | null;
          supplier_id: string | null;
          reorder_point: number;
          reorder_quantity: number;
          created_at: string;
          updated_at: string;
        };
      };
      stock_lots: {
        Row: {
          id: string;
          item_id: string;
          lot_number: string;
          location_id: string;
          quantity: number;
          unit_cost: number;
          expiry_date: string | null;
          received_date: string;
          supplier_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      movements: {
        Row: {
          id: string;
          item_id: string;
          lot_id: string | null;
          type: 'in' | 'out' | 'transfer' | 'adjust';
          quantity: number;
          from_location_id: string | null;
          to_location_id: string | null;
          unit_cost: number;
          reason: string | null;
          reference_number: string | null;
          customer_id: string | null;
          supplier_id: string | null;
          user_id: string | null;
          created_at: string;
          notes: string | null;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          type: 'warehouse' | 'aisle' | 'rack' | 'bin';
          parent_id: string | null;
          capacity: number | null;
          description: string | null;
          created_at: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          type: 'low_stock' | 'expiry_warning' | 'negative_balance';
          item_id: string | null;
          lot_id: string | null;
          message: string;
          severity: 'low' | 'medium' | 'high';
          status: 'active' | 'dismissed' | 'resolved';
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          phone: string | null;
          message: string | null;
          status: 'new' | 'contacted' | 'qualified' | 'converted';
          created_at: string;
        };
      };
    };
  };
};

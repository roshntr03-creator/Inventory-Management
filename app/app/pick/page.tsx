'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

type Item = { id: string; name: string; sku: string; unit: string };
type StockLot = { id: string; lot_number: string; quantity: number; locations: { name: string } | null };
type Customer = { id: string; name: string };

export default function PickPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [lots, setLots] = useState<StockLot[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedItem, setSelectedItem] = useState(searchParams?.get('item') || '');
  const [selectedLot, setSelectedLot] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customer, setCustomer] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      loadLots(selectedItem);
    }
  }, [selectedItem]);

  const loadData = async () => {
    const [itemsRes, customersRes] = await Promise.all([
      supabase.from('items').select('id, name, sku, unit'),
      supabase.from('customers').select('id, name'),
    ]);

    setItems(itemsRes.data || []);
    setCustomers(customersRes.data || []);
  };

  const loadLots = async (itemId: string) => {
    const { data } = await supabase
      .from('stock_lots')
      .select('id, lot_number, quantity, locations(name)')
      .eq('item_id', itemId)
      .gt('quantity', 0);

    const transformedData = (data || []).map((lot: any) => ({
      id: lot.id,
      lot_number: lot.lot_number,
      quantity: lot.quantity,
      locations: Array.isArray(lot.locations) ? lot.locations[0] : lot.locations,
    }));

    setLots(transformedData);
  };

  const handlePick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedLot || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const lot = lots.find((l) => l.id === selectedLot);
    const pickQty = parseInt(quantity);

    if (!lot || pickQty > lot.quantity) {
      toast.error('Invalid quantity');
      setLoading(false);
      return;
    }

    const { data: lotData } = await supabase
      .from('stock_lots')
      .select('location_id')
      .eq('id', selectedLot)
      .maybeSingle();

    const { error: updateError } = await supabase
      .from('stock_lots')
      .update({ quantity: lot.quantity - pickQty })
      .eq('id', selectedLot);

    if (updateError) {
      toast.error('Failed to update stock lot');
      setLoading(false);
      return;
    }

    const { error: movementError } = await supabase.from('movements').insert({
      item_id: selectedItem,
      lot_id: selectedLot,
      type: 'out',
      quantity: pickQty,
      from_location_id: lotData?.location_id,
      customer_id: customer || null,
      reference_number: referenceNumber || null,
      user_id: user?.id,
      reason: 'Stock picked',
      notes,
    });

    if (movementError) {
      toast.error('Failed to record movement');
    } else {
      toast.success('Stock picked successfully!');
      setQuantity('');
      setReferenceNumber('');
      setNotes('');
      loadLots(selectedItem);
    }

    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-8 w-8 text-red-400" />
          <h1 className="text-3xl font-bold">Pick Stock</h1>
        </div>
        <p className="text-gray-400">Remove inventory from stock</p>
      </div>

      <Card className="bg-gray-900 border-gray-800 max-w-2xl">
        <CardHeader>
          <CardTitle>Pick Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePick} className="space-y-4">
            <div>
              <Label htmlFor="item">Item *</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem} required>
                <SelectTrigger className="bg-black border-gray-700">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lot">Stock Lot *</Label>
              <Select value={selectedLot} onValueChange={setSelectedLot} required>
                <SelectTrigger className="bg-black border-gray-700">
                  <SelectValue placeholder="Select lot" />
                </SelectTrigger>
                <SelectContent>
                  {lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.lot_number} - {lot.quantity} available ({lot.locations?.name || 'No location'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                max={lots.find((l) => l.id === selectedLot)?.quantity || 999999}
                className="bg-black border-gray-700"
              />
              {selectedLot && (
                <p className="text-xs text-gray-400 mt-1">
                  Available: {lots.find((l) => l.id === selectedLot)?.quantity || 0}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger className="bg-black border-gray-700">
                  <SelectValue placeholder="Select customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((cust) => (
                    <SelectItem key={cust.id} value={cust.id}>
                      {cust.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Order/SO number"
                className="bg-black border-gray-700"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-black border-gray-700"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Picking...' : 'Pick Stock'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

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
import { Download } from 'lucide-react';

type Item = { id: string; name: string; sku: string; unit: string };
type Location = { id: string; name: string };
type Supplier = { id: string; name: string };

export default function ReceivePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [selectedItem, setSelectedItem] = useState(searchParams?.get('item') || '');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [supplier, setSupplier] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [itemsRes, locationsRes, suppliersRes] = await Promise.all([
      supabase.from('items').select('id, name, sku, unit'),
      supabase.from('locations').select('id, name'),
      supabase.from('suppliers').select('id, name'),
    ]);

    setItems(itemsRes.data || []);
    setLocations(locationsRes.data || []);
    setSuppliers(suppliersRes.data || []);
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity || !location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const generatedLotNumber = lotNumber || `LOT-${Date.now()}`;

    const { data: lotData, error: lotError } = await supabase
      .from('stock_lots')
      .insert({
        item_id: selectedItem,
        lot_number: generatedLotNumber,
        location_id: location,
        quantity: parseInt(quantity),
        unit_cost: parseFloat(unitCost) || 0,
        expiry_date: expiryDate || null,
        supplier_id: supplier || null,
        notes,
      })
      .select()
      .single();

    if (lotError) {
      toast.error('Failed to create stock lot: ' + lotError.message);
      setLoading(false);
      return;
    }

    const { error: movementError } = await supabase.from('movements').insert({
      item_id: selectedItem,
      lot_id: lotData.id,
      type: 'in',
      quantity: parseInt(quantity),
      to_location_id: location,
      unit_cost: parseFloat(unitCost) || 0,
      supplier_id: supplier || null,
      user_id: user?.id,
      reason: 'Stock received',
      notes,
    });

    if (movementError) {
      toast.error('Failed to record movement');
    } else {
      toast.success('Stock received successfully!');
      setQuantity('');
      setLotNumber('');
      setUnitCost('');
      setExpiryDate('');
      setNotes('');
    }

    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Download className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-bold">Receive Stock</h1>
        </div>
        <p className="text-gray-400">Add new inventory to your stock</p>
      </div>

      <Card className="bg-gray-900 border-gray-800 max-w-2xl">
        <CardHeader>
          <CardTitle>Receive Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReceive} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                  className="bg-black border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="unitCost">Unit Cost</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="bg-black border-gray-700"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Select value={location} onValueChange={setLocation} required>
                <SelectTrigger className="bg-black border-gray-700">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger className="bg-black border-gray-700">
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lotNumber">Lot Number</Label>
                <Input
                  id="lotNumber"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="bg-black border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-black border-gray-700"
                />
              </div>
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
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Receiving...' : 'Receive Stock'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

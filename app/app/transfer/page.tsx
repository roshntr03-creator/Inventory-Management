'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeftRight } from 'lucide-react';

type StockLot = { id: string; lot_number: string; quantity: number; item_id: string; location_id: string; items: { name: string } | null; locations: { name: string } | null };
type Location = { id: string; name: string };

export default function TransferPage() {
  const { user } = useAuth();
  const [lots, setLots] = useState<StockLot[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLot, setSelectedLot] = useState('');
  const [quantity, setQuantity] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [lotsRes, locationsRes] = await Promise.all([
      supabase.from('stock_lots').select('*, items(name), locations(name)').gt('quantity', 0),
      supabase.from('locations').select('id, name'),
    ]);

    setLots(lotsRes.data || []);
    setLocations(locationsRes.data || []);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot || !quantity || !toLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const lot = lots.find((l) => l.id === selectedLot);
    const transferQty = parseInt(quantity);

    if (!lot || transferQty > lot.quantity) {
      toast.error('Invalid quantity');
      setLoading(false);
      return;
    }

    if (lot.location_id === toLocation) {
      toast.error('Cannot transfer to the same location');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('stock_lots')
      .update({
        location_id: toLocation,
      })
      .eq('id', selectedLot);

    if (updateError) {
      toast.error('Failed to transfer stock');
      setLoading(false);
      return;
    }

    const { error: movementError } = await supabase.from('movements').insert({
      item_id: lot.item_id,
      lot_id: selectedLot,
      type: 'transfer',
      quantity: transferQty,
      from_location_id: lot.location_id,
      to_location_id: toLocation,
      user_id: user?.id,
      reason: 'Stock transfer',
      notes,
    });

    if (movementError) {
      toast.error('Failed to record movement');
    } else {
      toast.success('Stock transferred successfully!');
      setQuantity('');
      setNotes('');
      setSelectedLot('');
      loadData();
    }

    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ArrowLeftRight className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Transfer Stock</h1>
        </div>
        <p className="text-gray-400">Move stock between locations</p>
      </div>

      <Card className="bg-gray-900 border-gray-800 max-w-2xl">
        <CardHeader>
          <CardTitle>Transfer Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <Label htmlFor="lot">Stock Lot *</Label>
              <Select value={selectedLot} onValueChange={setSelectedLot} required>
                <SelectTrigger className="bg-black border-gray-700">
                  <SelectValue placeholder="Select lot" />
                </SelectTrigger>
                <SelectContent>
                  {lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.items?.name} - {lot.lot_number} ({lot.quantity} available at {lot.locations?.name})
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
                className="bg-black border-gray-700"
              />
            </div>

            <div>
              <Label htmlFor="toLocation">To Location *</Label>
              <Select value={toLocation} onValueChange={setToLocation} required>
                <SelectTrigger className="bg-black border-gray-700">
                  <SelectValue placeholder="Select destination location" />
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
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Transferring...' : 'Transfer Stock'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

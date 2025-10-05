'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, QrCode, CreditCard as Edit, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type Item = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  min_stock_threshold: number;
  category: string | null;
};

type StockLot = {
  id: string;
  lot_number: string;
  quantity: number;
  unit_cost: number;
  expiry_date: string | null;
  received_date: string;
  locations: { name: string } | null;
};

type Movement = {
  id: string;
  type: string;
  quantity: number;
  created_at: string;
  reason: string | null;
  profiles: { full_name: string | null } | null;
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [lots, setLots] = useState<StockLot[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalQty, setTotalQty] = useState(0);

  useEffect(() => {
    loadItemDetails();
  }, [params.id]);

  const loadItemDetails = async () => {
    const [itemRes, lotsRes, movementsRes] = await Promise.all([
      supabase.from('items').select('*').eq('id', params.id).maybeSingle(),
      supabase.from('stock_lots').select('*, locations(name)').eq('item_id', params.id),
      supabase.from('movements').select('*, profiles(full_name)').eq('item_id', params.id).order('created_at', { ascending: false }).limit(20),
    ]);

    setItem(itemRes.data);
    setLots(lotsRes.data || []);
    setMovements(movementsRes.data || []);

    const total = (lotsRes.data || []).reduce((sum, lot) => sum + lot.quantity, 0);
    setTotalQty(total);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Item not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
            <p className="text-gray-400">SKU: {item.sku}</p>
            {item.category && (
              <p className="text-cyan-400 text-sm mt-1">{item.category}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/app/items/${item.id}/qr`}>
              <Button className="bg-cyan-400 text-black hover:bg-cyan-500">
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total On Hand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQty} {item.unit}</div>
            <p className={`text-sm ${totalQty < item.min_stock_threshold ? 'text-red-400' : 'text-green-400'}`}>
              {totalQty < item.min_stock_threshold ? 'Below threshold' : 'Stock OK'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Min Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.min_stock_threshold} {item.unit}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Stock Lots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lots.length}</div>
          </CardContent>
        </Card>
      </div>

      {item.description && (
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">{item.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Stock Lots</CardTitle>
          </CardHeader>
          <CardContent>
            {lots.length === 0 ? (
              <p className="text-gray-400 text-sm">No stock lots</p>
            ) : (
              <div className="space-y-2">
                {lots.map((lot) => (
                  <div key={lot.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">Lot: {lot.lot_number}</div>
                        <div className="text-sm text-gray-400">
                          {lot.locations?.name || 'No location'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{lot.quantity} {item.unit}</div>
                        <div className="text-xs text-gray-400">${lot.unit_cost}/unit</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Received: {new Date(lot.received_date).toLocaleDateString()}
                      {lot.expiry_date && ` • Expires: ${new Date(lot.expiry_date).toLocaleDateString()}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-gray-400 text-sm">No movements</p>
            ) : (
              <div className="space-y-2">
                {movements.map((movement) => (
                  <div key={movement.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {movement.type === 'in' ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                        <div>
                          <div className="font-medium text-sm">{movement.type.toUpperCase()}</div>
                          <div className="text-xs text-gray-400">
                            {movement.profiles?.full_name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{movement.quantity} {item.unit}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {movement.reason && (
                      <div className="mt-2 text-xs text-gray-400">{movement.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href={`/app/receive?item=${item.id}`}>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <TrendingUp className="mr-2 h-4 w-4" />
                Receive Stock
              </Button>
            </Link>
            <Link href={`/app/pick?item=${item.id}`}>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <TrendingDown className="mr-2 h-4 w-4" />
                Pick Stock
              </Button>
            </Link>
            <Link href={`/app/transfer?item=${item.id}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Transfer Stock
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [onHandData, setOnHandData] = useState<any[]>([]);
  const [movementsData, setMovementsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const [lotsRes, movementsRes] = await Promise.all([
      supabase.from('stock_lots').select('*, items(name, sku, unit), locations(name)'),
      supabase.from('movements').select('*, items(name, sku), profiles(full_name)').order('created_at', { ascending: false }).limit(100),
    ]);

    setOnHandData(lotsRes.data || []);
    setMovementsData(movementsRes.data || []);
    setLoading(false);
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = h.includes('.') ? h.split('.').reduce((o, i) => o?.[i], row) : row[h];
        return `"${val || ''}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    toast.success('CSV exported successfully');
  };

  const exportOnHand = () => {
    exportToCSV(
      onHandData,
      'on-hand-inventory.csv',
      ['items.sku', 'items.name', 'lot_number', 'quantity', 'items.unit', 'locations.name', 'unit_cost']
    );
  };

  const exportMovements = () => {
    exportToCSV(
      movementsData,
      'stock-movements.csv',
      ['created_at', 'items.sku', 'items.name', 'type', 'quantity', 'reason', 'profiles.full_name']
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-cyan-400" />
          <h1 className="text-3xl font-bold">Reports</h1>
        </div>
        <p className="text-gray-400">View and export inventory reports</p>
      </div>

      <Tabs defaultValue="onhand" className="space-y-6">
        <TabsList className="bg-gray-900">
          <TabsTrigger value="onhand">On-Hand Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="onhand">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>On-Hand Inventory</CardTitle>
                <Button onClick={exportOnHand} className="bg-cyan-400 text-black hover:bg-cyan-500">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700">
                    <tr className="text-left">
                      <th className="pb-2">SKU</th>
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Lot</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Location</th>
                      <th className="pb-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onHandData.map((lot) => (
                      <tr key={lot.id} className="border-b border-gray-800">
                        <td className="py-2">{lot.items?.sku}</td>
                        <td className="py-2">{lot.items?.name}</td>
                        <td className="py-2">{lot.lot_number}</td>
                        <td className="py-2">{lot.quantity} {lot.items?.unit}</td>
                        <td className="py-2">{lot.locations?.name}</td>
                        <td className="py-2">${(lot.quantity * lot.unit_cost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Stock Movements</CardTitle>
                <Button onClick={exportMovements} className="bg-cyan-400 text-black hover:bg-cyan-500">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700">
                    <tr className="text-left">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">User</th>
                      <th className="pb-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movementsData.map((movement) => (
                      <tr key={movement.id} className="border-b border-gray-800">
                        <td className="py-2">{new Date(movement.created_at).toLocaleString()}</td>
                        <td className="py-2">{movement.items?.name}</td>
                        <td className="py-2 uppercase">{movement.type}</td>
                        <td className="py-2">{movement.quantity}</td>
                        <td className="py-2">{movement.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-2">{movement.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Inventory Valuation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-2xl font-bold mb-1">
                    ${onHandData.reduce((sum, lot) => sum + (lot.quantity * lot.unit_cost), 0).toFixed(2)}
                  </h3>
                  <p className="text-gray-400">Total Inventory Value</p>
                </div>
                <p className="text-sm text-gray-400">
                  Based on current on-hand stock and unit costs. Export on-hand inventory for detailed breakdown.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

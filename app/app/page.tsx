'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TriangleAlert as AlertTriangle, DollarSign, Package, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

type DashboardStats = {
  totalValue: number;
  lowStockCount: number;
  movementsToday: number;
  totalItems: number;
};

type Alert = {
  id: string;
  type: string;
  message: string;
  severity: string;
  created_at: string;
  item_id: string | null;
};

type RecentMovement = {
  id: string;
  type: string;
  quantity: number;
  created_at: string;
  items: { name: string } | null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalValue: 0,
    lowStockCount: 0,
    movementsToday: 0,
    totalItems: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [itemsRes, lotsRes, movementsRes, alertsRes] = await Promise.all([
      supabase.from('items').select('*'),
      supabase.from('stock_lots').select('quantity, unit_cost'),
      supabase.from('movements').select('*, items(name)').gte('created_at', new Date().toISOString().split('T')[0]).order('created_at', { ascending: false }).limit(10),
      supabase.from('alerts').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(5),
    ]);

    const items = itemsRes.data || [];
    const lots = lotsRes.data || [];
    const movements = movementsRes.data || [];
    const activeAlerts = alertsRes.data || [];

    const totalValue = lots.reduce((sum, lot) => sum + (lot.quantity * lot.unit_cost), 0);

    const lowStockItems = await Promise.all(
      items.map(async (item) => {
        const { data: itemLots } = await supabase
          .from('stock_lots')
          .select('quantity')
          .eq('item_id', item.id);

        const totalQty = (itemLots || []).reduce((sum, lot) => sum + lot.quantity, 0);
        return totalQty < item.min_stock_threshold;
      })
    );

    setStats({
      totalValue,
      lowStockCount: lowStockItems.filter(Boolean).length,
      movementsToday: movements.length,
      totalItems: items.length,
    });

    setAlerts(activeAlerts);
    setRecentMovements(movements);
    setLoading(false);
  };

  const dismissAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ status: 'dismissed' })
      .eq('id', alertId);

    if (error) {
      toast.error('Failed to dismiss alert');
    } else {
      setAlerts(alerts.filter(a => a.id !== alertId));
      toast.success('Alert dismissed');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your inventory operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Movements Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.movementsToday}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Items</CardTitle>
            <Package className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription className="text-gray-400">
              Alerts require your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-gray-400 text-sm">No active alerts</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'high' ? 'text-red-400' :
                          alert.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                        <span className="text-sm font-medium">{alert.message}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(alert.id)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription className="text-gray-400">
              Latest stock movements today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <p className="text-gray-400 text-sm">No movements today</p>
            ) : (
              <div className="space-y-2">
                {recentMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {movement.items?.name || 'Unknown Item'}
                      </div>
                      <p className="text-xs text-gray-400">
                        {movement.type.toUpperCase()} - {movement.quantity} units
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(movement.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/app/receive">
          <Card className="bg-gray-900 border-gray-800 hover:border-cyan-400 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📥</div>
                <h3 className="font-semibold mb-1">Receive Stock</h3>
                <p className="text-sm text-gray-400">Add new inventory</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/pick">
          <Card className="bg-gray-900 border-gray-800 hover:border-cyan-400 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📤</div>
                <h3 className="font-semibold mb-1">Pick Stock</h3>
                <p className="text-sm text-gray-400">Fulfill orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/transfer">
          <Card className="bg-gray-900 border-gray-800 hover:border-cyan-400 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🔄</div>
                <h3 className="font-semibold mb-1">Transfer Stock</h3>
                <p className="text-sm text-gray-400">Move between locations</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

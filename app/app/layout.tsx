'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Download,
  Upload,
  ArrowLeftRight,
  FileText,
  Settings,
  LogOut,
  PackageSearch,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard, shortcut: 'D' },
  { name: 'Items', href: '/app/items', icon: Package, shortcut: 'I' },
  { name: 'Receive', href: '/app/receive', icon: Download, shortcut: 'R' },
  { name: 'Pick', href: '/app/pick', icon: Upload, shortcut: 'P' },
  { name: 'Transfer', href: '/app/transfer', icon: ArrowLeftRight, shortcut: 'T' },
  { name: 'Locations', href: '/app/locations', icon: MapPin, shortcut: 'L' },
  { name: 'Scan', href: '/app/scan', icon: QrCode, shortcut: 'S' },
  { name: 'Reports', href: '/app/reports', icon: FileText, shortcut: null },
  { name: 'Settings', href: '/app/settings', icon: Settings, shortcut: null },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        const item = navigation.find(nav => nav.shortcut === e.key.toUpperCase());
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <PackageSearch className="h-8 w-8 text-cyan-400" />
              <span className="text-xl font-bold">InventoryQR</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-400 group-hover:text-cyan-400" />
                      <span className="group-hover:text-cyan-400">{item.name}</span>
                    </div>
                    {item.shortcut && (
                      <kbd className="px-2 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded">
                        Alt+{item.shortcut}
                      </kbd>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
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
import { LanguageSwitcher } from '@/components/language-switcher';

const navigation = [
  { name: 'nav.dashboard', href: '/app', icon: LayoutDashboard, shortcut: 'D' },
  { name: 'nav.items', href: '/app/items', icon: Package, shortcut: 'I' },
  { name: 'nav.receive', href: '/app/receive', icon: Download, shortcut: 'R' },
  { name: 'nav.pick', href: '/app/pick', icon: Upload, shortcut: 'P' },
  { name: 'nav.transfer', href: '/app/transfer', icon: ArrowLeftRight, shortcut: 'T' },
  { name: 'nav.locations', href: '/app/locations', icon: MapPin, shortcut: 'L' },
  { name: 'nav.scan', href: '/app/scan', icon: QrCode, shortcut: 'S' },
  { name: 'nav.reports', href: '/app/reports', icon: FileText, shortcut: null },
  { name: 'nav.settings', href: '/app/settings', icon: Settings, shortcut: null },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { t, dir } = useI18n();

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
        <div className="text-cyan-400">{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white" dir={dir}>
      <div className="flex h-screen">
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <PackageSearch className="h-8 w-8 text-cyan-400" />
                <span className="text-xl font-bold">InventoryQR</span>
              </Link>
              <LanguageSwitcher />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-400 group-hover:text-cyan-400" />
                      <span className="group-hover:text-cyan-400">{t(item.name)}</span>
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
              <LogOut className={`h-5 w-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
              {t('nav.signOut')}
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

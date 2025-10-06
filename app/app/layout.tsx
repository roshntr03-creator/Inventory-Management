'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  QrCode,
  Menu,
  X
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
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { t, dir } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
      {/* Mobile Header - Fixed */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-800 z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-gray-800 shrink-0"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <Link href="/" className="flex items-center gap-2 ml-3">
          <PackageSearch className="h-6 w-6 text-cyan-400" />
          <span className="text-base font-bold">InventoryQR</span>
        </Link>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen pt-14 lg:pt-0">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static
            top-14 lg:top-0
            ${dir === 'rtl' ? 'right-0' : 'left-0'}
            bottom-0
            w-64
            bg-gray-900
            ${dir === 'rtl' ? 'border-l' : 'border-r'}
            border-gray-800
            flex flex-col
            z-50
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}
            lg:translate-x-0
          `}
        >
          {/* Desktop Header */}
          <div className="hidden lg:flex p-4 border-b border-gray-800">
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="flex items-center gap-2">
                <PackageSearch className="h-8 w-8 text-cyan-400" />
                <span className="text-xl font-bold">InventoryQR</span>
              </Link>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    flex items-center justify-between px-3 py-3 rounded-lg
                    transition-colors group
                    ${isActive ? 'bg-cyan-400/10 text-cyan-400' : 'hover:bg-gray-800'}
                  `}>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                      <span className={`${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`}>
                        {t(item.name)}
                      </span>
                    </div>
                    {item.shortcut && (
                      <kbd className="hidden lg:block px-2 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded">
                        Alt+{item.shortcut}
                      </kbd>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={signOut}
            >
              <LogOut className={`h-5 w-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
              {t('nav.signOut')}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
